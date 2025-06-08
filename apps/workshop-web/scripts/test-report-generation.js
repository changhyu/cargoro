// 보고서 생성 테스트 스크립트
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

// 직접 빌드된 파일을 가져옵니다.
const { generateReport } = require('../../packages/reporting/dist/server/report-generator');

async function testReportGeneration() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 보고서 생성 테스트 시작...');

    // 템플릿 가져오기
    const template = await prisma.reportTemplate.findFirst({
      where: { type: 'pdf', isActive: true },
    });

    if (!template) {
      console.error('❌ 활성화된 PDF 템플릿을 찾을 수 없습니다.');
      return;
    }

    console.log(`📄 템플릿 사용: ${template.name}`);

    // 테스트 데이터 준비
    const testData = {
      workshopName: 'CarGoro 테스트 워크숍',
      customerName: '홍길동',
      customerPhone: '010-1234-5678',
      customerEmail: 'hong@example.com',
      vehiclePlate: '서울 가 1234',
      vehicleMake: '현대',
      vehicleModel: '아반떼',
      vehicleYear: '2022',
      vehicleOdometer: '15000',
      inspectionSummary:
        '차량 상태는 전반적으로 양호합니다. 정기 점검을 위해 방문하였으며, 엔진 오일 교체와 타이어 공기압 조정을 진행했습니다.',
      recommendedRepairs: ['다음 방문 시 에어컨 필터 교체 권장', '브레이크 패드 마모 확인 필요'],
      estimatedCosts: [
        { item: '엔진 오일 교체', cost: '50,000원' },
        { item: '에어컨 필터', cost: '30,000원' },
        { item: '브레이크 패드 (전)', cost: '120,000원' },
      ],
      inspectorName: '김기술',
      inspectionDate: new Date().toISOString().split('T')[0],
      currentYear: new Date().getFullYear().toString(),
    };

    // 테스트 매개변수
    const testParameters = {
      customerId: 'test-customer-id',
      vehicleId: 'test-vehicle-id',
      inspectionId: 'test-inspection-id',
    };

    // 보고서 생성
    console.log('📊 보고서 생성 중...');
    const { filePath, buffer } = await generateReport(
      {
        ...template,
        layout: JSON.parse(template.layout),
        parameters: JSON.parse(template.parameters),
        dataSource: JSON.parse(template.dataSource),
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt),
        category: template.category,
        type: template.type,
      },
      testData,
      testParameters,
      { format: 'pdf' }
    );

    // 결과 저장
    const outputDir = path.resolve(__dirname, '../public/test-reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `test-report-${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, buffer);

    console.log(`✅ 테스트 보고서가 생성되었습니다: ${outputPath}`);
    console.log(`📋 보고서 크기: ${Math.round(buffer.length / 1024)} KB`);

    // 테스트 작업 기록
    await prisma.reportJob.create({
      data: {
        templateId: template.id,
        userId: 'test-user',
        parameters: JSON.stringify(testParameters),
        format: 'pdf',
        status: 'completed',
        progress: 100,
        outputUrl: `/test-reports/${path.basename(outputPath)}`,
        completedAt: new Date(),
      },
    });

    console.log('🎉 보고서 생성 테스트 완료!');
  } catch (error) {
    console.error('❌ 보고서 생성 테스트 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 테스트 실행
testReportGeneration();
