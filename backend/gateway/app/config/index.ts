import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // API Services
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    workshop: process.env.WORKSHOP_SERVICE_URL || 'http://localhost:3002',
    fleet: process.env.FLEET_SERVICE_URL || 'http://localhost:3003',
    parts: process.env.PARTS_SERVICE_URL || 'http://localhost:3004',
    delivery: process.env.DELIVERY_SERVICE_URL || 'http://localhost:3005',
    smartcar: process.env.SMARTCAR_SERVICE_URL || 'http://localhost:3006',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15분
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per windowMs
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },
};
