import { AppError } from "../utils/AppError.js";

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errorCode = err.errorCode || "INTERNAL_SERVER_ERROR";
  let errors = err.errors || null;

  // 1. Mongoose Duplicate Key Error (e.g. unique email or username)
  if (err.code === 11000) {
    statusCode = 409;
    errorCode = "DUPLICATE_RESOURCE";
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} is already registered`;
    errors = {
      [field]: `${field.charAt(0).toUpperCase() + field.slice(1)} is already in use`,
    };
  }

  // 2. Mongoose Schema Validation Error
  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    message = "Validation failed";
    errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
  }

  // 3. Mongoose Invalid ObjectId (CastError)
  if (err.name === "CastError") {
    statusCode = 400;
    errorCode = "INVALID_ID";
    message = `Invalid format for resource ID: ${err.value}`;
  }

  // 4. JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    errorCode = "INVALID_TOKEN";
    message = "Invalid authentication token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    errorCode = "TOKEN_EXPIRED";
    message = "Authentication token expired. Please log in again";
  }

  // 5. Multer File Upload Errors
  if (err.name === "MulterError") {
    statusCode = 400;
    errorCode = "FILE_UPLOAD_ERROR";
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Uploaded file exceeds maximum allowed size (25MB)";
    }
  }

  // Log unexpected server errors in development
  if (statusCode >= 500) {
    console.error("[ServerError]:", err);
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    errorCode,
    message,
    errors,
    ...(process.env.NODE_ENV === "DEVELOPMENT" && { stack: err.stack }),
  });
};
