import { ZodError } from 'zod';

export function notFoundHandler(req, _res, next) {
  next({ status: 404, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed.',
      errors: error.errors.map((item) => ({
        field: item.path.join('.'),
        message: item.message
      }))
    });
    return;
  }

  if (error.code === 'P2002') {
    res.status(409).json({ message: 'A record with that value already exists.' });
    return;
  }

  const status = error.status || 500;
  const message = status === 500 ? 'Internal server error.' : error.message;

  if (status === 500) {
    console.error(error);
  }

  res.status(status).json({
    message,
    ...(error.details ? { details: error.details } : {})
  });
}
