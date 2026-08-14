export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: unknown;

  constructor(statusCode: number, message: string, errors?: unknown, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
