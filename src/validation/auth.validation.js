import { body, validationResult } from "express-validator";
import { ValidationError } from "../utils/AppError.js";

const handleValidation = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const formattedErrors = {};
    result.array().forEach((err) => {
      const field = err.path || err.param;
      if (!formattedErrors[field]) {
        formattedErrors[field] = err.msg;
      }
    });
    return next(
      new ValidationError(
        formattedErrors,
        "Please fix the validation errors below",
      ),
    );
  }
  next();
};

export const validateRegister = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  handleValidation,
];

export const validateLogin = [
  body("userInfo")
    .trim()
    .notEmpty()
    .withMessage("Username or email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidation,
];
