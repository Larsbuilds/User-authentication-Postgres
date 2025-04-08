const helmet = require('helmet');
const cors = require('cors');

const securityMiddleware = (app) => {
  // Helmet security headers
  app.use(helmet());

  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  // Rate limiting
  const rateLimit = require('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  // XSS protection
  app.use(helmet.xssFilter());

  // Prevent MIME type sniffing
  app.use(helmet.noSniff());

  // Prevent clickjacking
  app.use(helmet.frameguard({ action: 'deny' }));

  // Hide powered by header
  app.use(helmet.hidePoweredBy());
};

module.exports = securityMiddleware; 