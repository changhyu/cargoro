// apps/workshop-web/scripts/seed-report-templates.ts
import { vehicleInspectionReport, repairHistoryReport } from '../app/data/report-templates';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 기본 보고서 템플릿 추가 중...');

  // 차량 점검 보고서 템플릿 추가
  const inspectionReport = await prisma.reportTemplate.upsert({
    where: { id: vehicleInspectionReport.id },
    update: vehicleInspectionReport,
    create: vehicleInspectionReport,
  });
  console.log(`✅ 차량 점검 보고서 템플릿이 추가되었습니다: ${inspectionReport.id}`);

  // 정비 내역 보고서 템플릿 추가
  const historyReport = await prisma.reportTemplate.upsert({
    where: { id: repairHistoryReport.id },
    update: repairHistoryReport,
    create: repairHistoryReport,
  });
  console.log(`✅ 정비 내역 보고서 템플릿이 추가되었습니다: ${historyReport.id}`);

  console.log('🎉 모든 보고서 템플릿이 성공적으로 추가되었습니다!');
}

main()
  .catch(e => {
    console.error('❌ 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
