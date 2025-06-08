/**
 * 서버 사이드 보고서 생성 유틸리티
 * 이 파일은 Next.js API 라우트나 서버 컴포넌트에서 사용됩니다.
 */
import fs from 'fs';
import path from 'path';
import { ReportTemplate, GenerateReportRequest } from '../types';
import { PDFGenerator } from '../generators/pdf-generator';
import { ExcelGenerator } from '../generators/excel-generator';

interface GenerateReportOptions {
  outputDir?: string;
  format?: 'pdf' | 'excel' | 'word';
  filename?: string;
}

/**
 * 서버 사이드에서 보고서를 생성하는 함수
 */
export async function generateReport(
  template: ReportTemplate,
  data: Record<string, unknown>,
  parameters: Record<string, unknown> = {},
  options: GenerateReportOptions = {}
): Promise<{ filePath: string; buffer: Buffer }> {
  const { format = 'pdf', outputDir = './tmp', filename } = options;

  // 출력 디렉토리 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let buffer: Buffer;
  let extension: string;
  let excelGenerator;
  let pdfGenerator;

  // 템플릿 유형에 따라 적절한 생성기 사용
  switch (format) {
    case 'excel':
      excelGenerator = new ExcelGenerator({ template, data, parameters });
      buffer = await excelGenerator.generate();
      extension = 'xlsx';
      break;

    case 'word':
      throw new Error('워드 문서 생성은 아직 지원되지 않습니다.');

    case 'pdf':
    default:
      pdfGenerator = new PDFGenerator({ template, data, parameters });
      buffer = await pdfGenerator.generate();
      extension = 'pdf';
      break;
  }

  // 파일명 생성
  const outputFilename =
    filename ||
    `${template.name.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${new Date().toISOString().slice(0, 10)}.${extension}`;
  const outputPath = path.join(outputDir, outputFilename);

  // 파일 저장
  fs.writeFileSync(outputPath, buffer);

  return {
    filePath: outputPath,
    buffer,
  };
}

/**
 * 비동기적으로 보고서를 생성하는 함수 (백그라운드 작업)
 */
export async function generateReportAsync(
  request: GenerateReportRequest,
  onProgress?: (progress: number) => void,
  onComplete?: (filePath: string) => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    // 템플릿 조회 로직 (DB에서 템플릿 가져오기)
    // const template = await getTemplateFromDatabase(request.templateId);

    // 데이터 소스에서 데이터 가져오기
    // const data = await fetchDataFromSource(template.dataSource, request.parameters);

    // 더미 데이터
    const template: ReportTemplate = {
      id: request.templateId,
      name: '샘플 보고서',
      description: '샘플 설명',
      category: 'custom',
      type: 'pdf',
      layout: {
        orientation: 'portrait',
        pageSize: 'A4',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        sections: [],
      },
      dataSource: [],
      parameters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      isActive: true,
    };

    const data = {
      /* 더미 데이터 */
    };

    // 진행률 업데이트
    if (onProgress) {
      onProgress(10);
    }

    // 보고서 생성
    const { filePath } = await generateReport(template, data, request.parameters, {
      format: request.format as 'pdf' | 'excel' | 'word',
    });

    // 진행률 업데이트
    if (onProgress) {
      onProgress(100);
    }

    // 완료 콜백
    if (onComplete) {
      onComplete(filePath);
    }
  } catch (error) {
    // 에러 처리
    if (onError && error instanceof Error) {
      onError(error);
    }
  }
}
