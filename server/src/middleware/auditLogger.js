const AuditLog = require('../models/AuditLog');

const auditLog = (action, resource) => {
  return async (req, res, next) => {
    // Store original json method to intercept response
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      // Log after response
      AuditLog.create({
        userId: req.user?._id,
        action,
        resource,
        resourceId: req.params.id || req.body?.shopId || req.body?.userId,
        details: {
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
        },
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
      }).catch((err) => console.error('Audit log error:', err.message));

      return originalJson(body);
    };
    next();
  };
};

module.exports = auditLog;
