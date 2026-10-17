import express from "express";
import {
  register,
  login,
  logout,
  verifyEmail,
  getMe,
} from "../controllers/auth.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import {
  validateRegister,
  validateLogin,
} from "../validation/auth.validation.js";

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register new  user
 * @access Public
 */
router.post("/register", validateRegister, register);

/**
 * @route POST /api/auth/login
 * @description login old  user
 * @access Public
 */
router.post("/login", validateLogin, login);

/**
 * @route POST /api/auth/logout
 * @description logsout old user
 * @access Private
 */
router.post("/logout", logout);

/**
 * @route POST /api/auth/verify-email
 * @description Verify user's email
 * @access Public
 * @query { token }
 */
router.get("/verify-email", verifyEmail);

/**
 * @route GET /api/auth/me
 * @description Get current user
 * @access Private
 */
router.get("/get-me", verifyUser, getMe);

export default router;
