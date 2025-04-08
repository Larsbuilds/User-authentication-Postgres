const logger = require('../utils/logger');

/**
 * Custom request logger middleware
 * Logs detailed information about incoming requests and their responses
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    // Log request details
    logger.info({
        requestId,
        type: 'REQUEST',
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        body: req.method !== 'GET' ? req.body : undefined,
        query: Object.keys(req.query).length ? req.query : undefined,
    });

    // Capture response using response event listener
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            requestId,
            type: 'RESPONSE',
            statusCode: res.statusCode,
            duration: `${duration}ms`,
        });
    });

    next();
};

module.exports = requestLogger; 