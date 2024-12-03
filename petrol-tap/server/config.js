config.jsexport const config = {
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development'
};