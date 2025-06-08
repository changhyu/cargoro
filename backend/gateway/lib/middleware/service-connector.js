/**
 * 서비스 간 통신을 위한 연결 미들웨어
 * 각 마이크로서비스 API에 대한 프록시 및 서비스 검색을 담당
 */
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { performance } = require('perf_hooks');
const pino = require('pino');

// Pino 로거 설정
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

// 서비스 목록 및 URL 구성 (환경변수에서 로드)
const BASE_URL = process.env.SERVICES_BASE_URL || 'http://localhost';

const services = {
  'core-api': {
    url: process.env.CORE_API_URL || `${BASE_URL}:8001`,
    healthCheck: '/health',
    endpoints: ['/api/users', '/api/auth', '/api/organizations'],
  },
  'repair-api': {
    url: process.env.REPAIR_API_URL || `${BASE_URL}:8002`,
    healthCheck: '/health',
    endpoints: ['/api/bookings', '/api/maintenance'],
  },
  'parts-api': {
    url: process.env.PARTS_API_URL || `${BASE_URL}:8003`,
    healthCheck: '/health',
    endpoints: ['/api/parts', '/api/suppliers', '/api/inventory', '/api/orders'],
  },
  'delivery-api': {
    url: process.env.DELIVERY_API_URL || `${BASE_URL}:8004`,
    healthCheck: '/health',
    endpoints: ['/api/deliveries', '/api/drivers', '/api/routes'],
  },
  'fleet-api': {
    url: process.env.FLEET_API_URL || `${BASE_URL}:8005`,
    healthCheck: '/health',
    endpoints: ['/api/vehicles', '/api/fleets', '/api/assignments'],
  },
  'admin-api': {
    url: process.env.ADMIN_API_URL || `${BASE_URL}:8006`,
    healthCheck: '/health',
    endpoints: ['/api/admin'],
  },
};

/**
 * 서비스 상태 확인
 * @param {string} serviceName - 서비스 이름
 * @param {string} serviceUrl - 서비스 URL
 * @param {string} healthCheckPath - 헬스체크 경로
 * @returns {Promise<boolean>} 서비스 상태 (true: 정상, false: 비정상)
 */
async function checkServiceHealth(serviceName, serviceUrl, healthCheckPath) {
  try {
    const response = await axios.get(`${serviceUrl}${healthCheckPath}`, {
      timeout: 2000,
      headers: {
        'X-Internal-Request': 'gateway',
      },
    });

    const isHealthy = response.status === 200 && response.data.status === 'ok';
    logger.info(`Service ${serviceName} health check: ${isHealthy ? 'healthy' : 'unhealthy'}`);
    return isHealthy;
  } catch (error) {
    logger.error(`Service ${serviceName} health check failed: ${error.message}`);
    return false;
  }
}

/**
 * 모든 서비스 상태 확인
 * @returns {Promise<Object>} 서비스별 상태 객체
 */
async function checkAllServicesHealth() {
  const healthResults = {};

  for (const [serviceName, serviceConfig] of Object.entries(services)) {
    healthResults[serviceName] = await checkServiceHealth(
      serviceName,
      serviceConfig.url,
      serviceConfig.healthCheck
    );
  }

  return healthResults;
}

/**
 * 서비스 프록시 미들웨어 생성
 * @param {string} serviceName - 서비스 이름
 * @param {Object} serviceConfig - 서비스 구성
 * @returns {Function} Express 미들웨어
 */
function createServiceProxy(serviceName, serviceConfig) {
  return createProxyMiddleware({
    target: serviceConfig.url,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // API 경로 재작성 (예: /api/parts-api/... -> /api/...)
      return path.replace(new RegExp(`^/api/${serviceName}`), '/api');
    },
    onProxyReq: (proxyReq, req, res) => {
      // 요청 헤더에 내부 요청 식별자 추가
      proxyReq.setHeader('X-Internal-Request', 'gateway');

      // 기존 인증 토큰 전달
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }

      // 요청 시작 시간 저장
      req.startTime = performance.now();
    },
    onProxyRes: (proxyRes, req, res) => {
      // 응답 시간 측정 및 로깅
      const duration = performance.now() - req.startTime;
      logger.info({
        service: serviceName,
        method: req.method,
        path: req.originalUrl,
        status: proxyRes.statusCode,
        duration: `${duration.toFixed(2)}ms`,
      });
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${serviceName}: ${err.message}`);
      res.status(500).json({
        error: 'Service unavailable',
        message: `The ${serviceName} service is currently unavailable`,
      });
    },
  });
}

/**
 * 서비스 디스커버리 및 프록시 설정
 * @param {Object} app - Express 앱 인스턴스
 */
function setupServiceConnector(app) {
  // 서비스 헬스 체크 엔드포인트
  app.get('/api/health', async (req, res) => {
    const results = await checkAllServicesHealth();
    const allHealthy = Object.values(results).every(status => status);

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ok' : 'degraded',
      services: results,
      timestamp: new Date().toISOString(),
    });
  });

  // 각 서비스에 대한 프록시 설정
  for (const [serviceName, serviceConfig] of Object.entries(services)) {
    // 서비스별 경로에 프록시 미들웨어 마운트
    app.use(`/api/${serviceName}`, createServiceProxy(serviceName, serviceConfig));

    // 서비스 엔드포인트별 전용 경로 설정
    serviceConfig.endpoints.forEach(endpoint => {
      app.use(endpoint, createServiceProxy(serviceName, serviceConfig));
    });
  }

  // 알 수 없는 경로에 대한 처리
  app.use('/api/*', (req, res) => {
    logger.warn(`Unknown API route requested: ${req.originalUrl}`);
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested API endpoint does not exist',
    });
  });
}

/**
 * 서비스 직접 호출 (내부 통신용)
 * @param {string} serviceName - 서비스 이름
 * @param {string} path - API 경로
 * @param {string} method - HTTP 메서드
 * @param {Object} data - 요청 데이터 (선택사항)
 * @param {Object} headers - 요청 헤더 (선택사항)
 * @returns {Promise<Object>} API 응답
 */
async function callService(serviceName, path, method = 'GET', data = null, headers = {}) {
  const serviceConfig = services[serviceName];

  if (!serviceConfig) {
    throw new Error(`Unknown service: ${serviceName}`);
  }

  // 서비스 헬스 확인
  const isHealthy = await checkServiceHealth(
    serviceName,
    serviceConfig.url,
    serviceConfig.healthCheck
  );

  if (!isHealthy) {
    throw new Error(`Service ${serviceName} is not healthy`);
  }

  // 내부 요청 헤더 추가
  const requestHeaders = {
    'X-Internal-Request': 'gateway',
    'Content-Type': 'application/json',
    ...headers,
  };

  try {
    const startTime = performance.now();
    const response = await axios({
      method,
      url: `${serviceConfig.url}${path}`,
      headers: requestHeaders,
      data: method !== 'GET' ? data : undefined,
      params: method === 'GET' ? data : undefined,
      timeout: 5000,
    });

    const duration = performance.now() - startTime;
    logger.info({
      service: serviceName,
      method,
      path,
      status: response.status,
      duration: `${duration.toFixed(2)}ms`,
    });

    return response.data;
  } catch (error) {
    logger.error({
      message: `Error calling ${serviceName} service`,
      path,
      method,
      error: error.message,
      response: error.response?.data,
    });

    throw error;
  }
}

module.exports = {
  setupServiceConnector,
  callService,
  checkServiceHealth,
  checkAllServicesHealth,
  services,
};
