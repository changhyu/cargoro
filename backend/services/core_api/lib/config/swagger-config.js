const swaggerJsdoc = require('swagger-jsdoc');

/**
 * API 문서화를 위한 Swagger 설정
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CarGoro API Documentation',
      version: '1.0.0',
      description: '자동차 관련 종합 플랫폼 CarGoro의 API 문서입니다.',
      license: {
        name: '© 2024 CarGoro. 모든 권리 보유.',
      },
      contact: {
        name: 'CarGoro Developer Team',
        email: 'dev@cargoro.com',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'Development API Server',
      },
      {
        url: 'https://api.cargoro.com/api',
        description: 'Production API Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  // API 경로 패턴을 지정하여 자동으로 문서화
  apis: [
    './services/core-api/routes/*.ts',
    './services/core-api/middleware/*.ts',
    './services/core-api/models/*.ts',
    './database/schema/*.ts',
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
