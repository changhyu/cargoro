import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// MSW 서버 설정
export const server = setupServer(...handlers);

// 테스트 환경에서 유용한 추가 설정
server.events.on('request:start', ({ request }) => {
  console.log('MSW intercepted:', request.method, request.url);
});
