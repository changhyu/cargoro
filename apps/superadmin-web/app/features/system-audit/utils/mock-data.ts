import {
  AuditLog,
  AuditLogLevel,
  // AuditCategory, // 향후 사용 예정
  // ServiceType, // 향후 사용 예정
  AuditCategoryValues,
  ServiceTypeValues,
} from '../types';

// 감사 로그 모킹 데이터 생성 함수
export const generateMockAuditLogs = (count: number): AuditLog[] => {
  const messages = [
    '사용자 로그인 시도',
    '시스템 구성 변경',
    '관리자 권한 변경',
    '데이터베이스 접근',
    '사용자 생성',
    '비밀번호 재설정',
    '예약 취소',
    '결제 처리',
    'API 키 생성',
    '시스템 백업 완료',
  ];

  const details = [
    '사용자가 로그인을 시도했습니다. IP: 192.168.1.100',
    '시스템 구성이 변경되었습니다. 변경사항: 로그 보관 기간 30일 -> 90일',
    '관리자 권한이 변경되었습니다. 대상: user123, 권한: READ -> WRITE',
    '데이터베이스 테이블 접근: users, 작업: SELECT',
    '새 사용자가 생성되었습니다. ID: user456',
    '사용자 비밀번호가 재설정되었습니다. ID: user789',
    '예약 ID: RS12345가 취소되었습니다. 사유: 고객 요청',
    '결제 ID: PM67890 처리 완료. 금액: 50,000원',
    'API 키가 생성되었습니다. 서비스: 차량 위치 API',
    '시스템 백업이 완료되었습니다. 크기: 2.5GB',
  ];

  const userNames = [
    '김관리자',
    '이사용자',
    '박시스템',
    '최운영자',
    '정기술자',
    '강개발자',
    '조분석가',
    '윤테스터',
    '장보안',
    '한네트워크',
  ];

  const levels: AuditLogLevel[] = ['info', 'warning', 'error', 'critical'];
  const services = Object.values(ServiceTypeValues);
  const categories = Object.values(AuditCategoryValues);
  const mockLogs: AuditLog[] = [];

  for (let i = 0; i < count; i++) {
    const now = new Date();
    const randomPastTime = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);

    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    const randomService = services[Math.floor(Math.random() * services.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomMessageIndex = Math.floor(Math.random() * messages.length);
    const randomUserIndex = Math.floor(Math.random() * userNames.length);

    mockLogs.push({
      id: `log-${i + 1}`,
      timestamp: randomPastTime.toISOString(),
      level: randomLevel,
      serviceType: randomService,
      category: randomCategory,
      message: messages[randomMessageIndex],
      details: details[randomMessageIndex],
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userId: `user-${Math.floor(Math.random() * 1000)}`,
      userName: userNames[randomUserIndex],
      resourceType: randomCategory === AuditCategoryValues.DATA_ACCESS ? 'Table' : 'Config',
      resourceId: randomCategory === AuditCategoryValues.DATA_ACCESS ? `tbl-${i}` : `cfg-${i}`,
      source: randomMessageIndex % 2 === 0 ? 'API' : 'UI',
      metadata: {
        browser: Math.random() > 0.5 ? 'Chrome' : 'Firefox',
        os: Math.random() > 0.5 ? 'Windows' : 'MacOS',
        duration: `${Math.floor(Math.random() * 1000)}ms`,
        actionType: randomMessageIndex % 2 === 0 ? 'CREATE' : 'UPDATE',
        success: Math.random() > 0.2, // 80% 성공 확률
        ...(randomCategory === AuditCategoryValues.DATA_ACCESS
          ? {
              query: 'SELECT * FROM users WHERE id = ?',
              params: ['user-123'],
              rows_affected: Math.floor(Math.random() * 10),
            }
          : {}),
      },
    });
  }

  return mockLogs;
};
