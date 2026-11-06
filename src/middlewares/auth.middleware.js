import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/AppError.js";

export const verifyUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(new UnauthorizedError("Authentication token missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new UnauthorizedError("Invalid or expired session token"));
  }
};
