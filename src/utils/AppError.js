export class AppError extends Error {
  constructor(
    message,
    statusCode = 500,
    errorCode = "INTERNAL_SERVER_ERROR",
    errors = null,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(errors, message = "Validation failed") {
    super(message, 400, "VALIDATION_ERROR", errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED", null);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access forbidden") {
    super(message, 403, "FORBIDDEN", null);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND", null);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict", errors = null) {
    super(message, 409, "CONFLICT", errors);
  }
}

export class RateLimitError extends AppError {
  constructor(
    message = "AI service rate limit exceeded. Please wait a moment before trying again.",
  ) {
    super(message, 429, "RATE_LIMIT_EXCEEDED", null);
  }
}

