# CarGoro 보고서 시스템 개발자 가이드

## 개요

CarGoro 보고서 시스템(`@cargoro/reporting`)은 PDF 및 Excel 형식의 보고서를 생성하고 관리하기 위한 패키지입니다. 이 가이드는 개발자가 워크숍 웹 애플리케이션 및 기타 CarGoro 애플리케이션에서 보고서 시스템을 통합하고 활용하는 방법을 설명합니다.

## 설치 및 설정

워크숍 웹 애플리케이션은 이미 `@cargoro/reporting` 패키지를 의존성으로 포함하고 있습니다. 다른 애플리케이션에서 사용하려면 다음과 같이 의존성을 추가하세요:

```json
{
  "dependencies": {
    "@cargoro/reporting": "workspace:*"
    // ... 기타 의존성
  }
}
```

## 기본 사용법

### 보고서 템플릿 목록 가져오기

```tsx
import { useReportTemplates } from '@cargoro/reporting';

function ReportsPage() {
  const { templates, activeTemplate, setActiveTemplate, isPending } = useReportTemplates();

  // templates - 사용 가능한 보고서 템플릿 목록
  // activeTemplate - 현재 선택된 템플릿
  // setActiveTemplate - 템플릿 선택 함수
  // isPending - 로딩 상태

  return (
    <div>
      {templates.map(template => (
        <div key={template.id} onClick={() => setActiveTemplate(template.id)}>
          {template.name}
        </div>
      ))}
    </div>
  );
}
```

### 보고서 생성 컴포넌트 사용하기

```tsx
import { ReportGenerator } from '@cargoro/reporting';

function ReportGeneratorPage() {
  const handleReportGenerated = (reportId: string) => {
    console.log(`보고서 생성됨: ${reportId}`);
    // 추가 작업 (알림 표시, 페이지 이동 등)
  };

  return <ReportGenerator template={selectedTemplate} onGenerated={handleReportGenerated} />;
}
```

### 보고서 이력 관리 컴포넌트 사용하기

```tsx
import { ReportManager } from '@cargoro/reporting';

function ReportHistoryPage() {
  return <ReportManager />;
}
```

## 서버 사이드 보고서 생성

API 라우트나 서버 컴포넌트에서 보고서를 생성하려면 다음과 같이 사용할 수 있습니다:

```typescript
import { generateReport } from '@cargoro/reporting/server';
import { prisma } from '@/lib/prisma';

// API 라우트 예제
export async function POST(req: Request) {
  const { templateId, parameters } = await req.json();

  // 템플릿 조회
  const template = await prisma.reportTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    return Response.json({ error: '템플릿을 찾을 수 없습니다' }, { status: 404 });
  }

  // 보고서 데이터 준비
  const data = await fetchReportData(parameters);

  // 보고서 생성
  try {
    const { filePath, buffer } = await generateReport(template, data, parameters, {
      format: 'pdf',
    });

    // 생성된 보고서 정보 저장
    await prisma.reportJob.create({
      data: {
        templateId,
        userId: 'user-id',
        parameters: JSON.stringify(parameters),
        status: 'completed',
        outputUrl: filePath,
        progress: 100,
        completedAt: new Date(),
      },
    });

    return Response.json({ success: true, filePath });
  } catch (error) {
    console.error('보고서 생성 오류:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : '보고서 생성 실패' },
      { status: 500 }
    );
  }
}

// 보고서 데이터 가져오기 (예제)
async function fetchReportData(parameters: Record<string, any>) {
  // 데이터 소스에서 필요한 데이터 가져오기
  // 예: 데이터베이스 조회, API 호출 등
  return {
    // 보고서에 필요한 데이터
  };
}
```

## 보고서 템플릿 관리

### 새 템플릿 추가하기

```typescript
import { prisma } from '@/lib/prisma';

async function addReportTemplate() {
  const newTemplate = {
    name: '새 보고서 템플릿',
    description: '새로운 보고서 템플릿 설명',
    category: '점검',
    type: 'pdf',
    layout: JSON.stringify({
      // 템플릿 레이아웃 정의
    }),
    dataSource: JSON.stringify([
      // 데이터 소스 정의
    ]),
    parameters: JSON.stringify([
      // 매개변수 정의
    ]),
    createdBy: 'user-id',
    isActive: true,
  };

  return prisma.reportTemplate.create({
    data: newTemplate,
  });
}
```

### 템플릿 편집하기

```typescript
import { prisma } from '@/lib/prisma';

async function updateReportTemplate(templateId: string, updates: any) {
  return prisma.reportTemplate.update({
    where: { id: templateId },
    data: updates,
  });
}
```

## PDF 생성기 직접 사용하기

고급 사용자를 위해 PDF 생성기를 직접 사용할 수 있습니다:

```typescript
import { PDFGenerator } from '@cargoro/reporting/generators';

async function createCustomPdf() {
  const pdf = new PDFGenerator({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 콘텐츠 추가
  pdf.addHeader({
    title: '커스텀 보고서',
    subtitle: '부제목',
    logo: '/path/to/logo.png',
  });

  pdf.addSection({
    title: '섹션 제목',
    content: '섹션 내용',
  });

  // 테이블 추가
  pdf.addTable({
    headers: ['항목', '값'],
    rows: [
      ['항목 1', '값 1'],
      ['항목 2', '값 2'],
    ],
  });

  // PDF 생성
  const buffer = await pdf.generate();
  return buffer;
}
```

## 문제 해결

### 일반적인 오류 및 해결 방법

1. **템플릿 로딩 실패**

   - API 엔드포인트가 올바르게 구성되었는지 확인
   - 네트워크 연결 확인
   - 템플릿이 데이터베이스에 존재하는지 확인

2. **보고서 생성 실패**

   - 필요한 매개변수가 모두 제공되었는지 확인
   - 데이터 소스가 올바르게 구성되었는지 확인
   - 서버 로그 확인

3. **데이터베이스 오류**
   - Prisma 스키마가 올바르게 구성되었는지 확인
   - 마이그레이션이 적용되었는지 확인
   - 데이터베이스 연결 문자열 확인

## API 참조

자세한 API 문서는 `@cargoro/reporting` 패키지의 README.md 파일을 참조하세요.
