export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/cargoro',
  },
  server: {
    port: parseInt(process.env.PORT || '4000'),
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
  },
  env: process.env.NODE_ENV || 'development',
};
