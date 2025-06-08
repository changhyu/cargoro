// 서버 모듈 테스트 스크립트
import { generateReportAsync } from '../packages/reporting/dist/server';

async function testServerModule() {
  try {
    console.log('서버 모듈 테스트 중...');

    // 비동기 보고서 생성 테스트
    await generateReportAsync(
      {
        templateId: 'test-template',
        parameters: {},
        format: 'pdf',
        async: true,
      },
      progress => {
        console.log(`진행률: ${progress}%`);
      },
      filePath => {
        console.log(`보고서 파일 생성됨: ${filePath}`);
      },
      error => {
        console.error(`오류 발생: ${error.message}`);
      }
    );

    console.log('테스트 완료!');
  } catch (error) {
    console.error('테스트 실패:', error);
  }
}

testServerModule();
