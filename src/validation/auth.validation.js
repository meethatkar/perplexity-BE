import { body, validationResult } from "express-validator";

export const validateRegister = [
  body("username").notEmpty().withMessage("Username is required").trim(),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .trim()
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 12 })
    .withMessage("Password must be between 8 and 12 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateLogin = [
  body("userInfo")
    .notEmpty()
    .withMessage("Username or Email is required")
    .trim(),
  body("password").notEmpty().withMessage("Password is required"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
