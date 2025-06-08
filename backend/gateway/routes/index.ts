import { Router } from 'express';
import { proxyToService } from '../utils/proxy-utils';
import { createSuccessResponse } from '../utils/response-utils';

const router = Router();

// 보호된 엔드포인트 예시
router.get('/protected', (req, res) => {
  // 사용자 인증 확인 (auth 미들웨어가 이미 req.user 설정)
  if (!req.userId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: '이 리소스에 접근하려면 로그인이 필요합니다.',
      },
    });
  }

  return createSuccessResponse(res, {
    message: '보호된 리소스에 접근했습니다.',
    user: {
      id: req.userId,
      role: req.role,
    },
  });
});

// 회원가입 엔드포인트 - auth 서비스로 프록시
router.post('/auth/register', (req, res) => {
  return proxyToService(req, res, 'auth', '/users/register');
});

// 로그인 엔드포인트 - auth 서비스로 프록시
router.post('/auth/login', (_req, res) => {
  return proxyToService(_req, res, 'auth', '/users/login');
});

// 사용자 프로필 엔드포인트 - user 서비스로 프록시
router.get('/users/me', (req, res) => {
  if (!req.userId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: '인증이 필요합니다.',
      },
    });
  }

  return proxyToService(req, res, 'users', `/users/${req.userId}`);
});

// 예약 관리 엔드포인트 - booking 서비스로 프록시
router.get('/bookings', (req, res) => {
  return proxyToService(req, res, 'booking', '/bookings');
});

router.get('/bookings/:id', (req, res) => {
  return proxyToService(req, res, 'booking', `/bookings/${req.params.id}`);
});

// 정비소 관리 엔드포인트 - workshop 서비스로 프록시
router.get('/workshops', (req, res) => {
  return proxyToService(req, res, 'workshop', '/workshops');
});

// 부품 관리 엔드포인트 - parts 서비스로 프록시
router.get('/parts', (req, res) => {
  return proxyToService(req, res, 'parts', '/parts');
});

// 차량 관리 엔드포인트 - vehicle 서비스로 프록시
router.get('/vehicles', (req, res) => {
  return proxyToService(req, res, 'vehicle', '/vehicles');
});

export default router;
