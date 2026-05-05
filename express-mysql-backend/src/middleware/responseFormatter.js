module.exports = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    // If response already follows the unified format, send as-is
    if (
      body &&
      typeof body === 'object' &&
      Object.prototype.hasOwnProperty.call(body, 'success') &&
      Object.prototype.hasOwnProperty.call(body, 'code') &&
      Object.prototype.hasOwnProperty.call(body, 'message')
    ) {
      return originalJson(body);
    }

    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 200;
    const success = statusCode >= 200 && statusCode < 300;

    // If controller returned an object with a `message`, use that as the message
    if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'message')) {
      const { message, ...rest } = body;
      const data = Object.keys(rest).length ? rest : null;
      return originalJson({ success, code: statusCode, message, data });
    }

    // If controller returned an object with an `error` string, use it as message
    if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'error')) {
      const message = body.error;
      return originalJson({ success: false, code: statusCode, message, data: null });
    }

    const defaultMessage = statusCode === 201 ? 'Created' : success ? 'OK' : 'Error';
    return originalJson({ success, code: statusCode, message: defaultMessage, data: body ?? null });
  };

  next();
};
