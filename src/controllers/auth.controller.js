import userModel from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";
import jwt from "jsonwebtoken";
import { sendSuccess } from "../utils/response.js";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from "../utils/AppError.js";

export const register = async (req, res, next) => {
  try {
    const { username, email, password, verified } = req.body;
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return next(
        new ConflictError("User with this email already exists", {
          email: "Email is already registered",
        }),
      );
    }

    const user = await userModel.create({
      username,
      email,
      password,
      verified,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    await sendEmail({
      to: user.email,
      subject: "Verify your email",
      html: `
        <p> Welcome Onboard ${username} </p>
        <h1>Verify your email</h1>
        <p>Click the link to verify your email: <a href="${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}">Verify Email</a></p>
        <span style="color: #888; font-size: 12px; margin-top: 20px; display: block;"> Team aether-ai </span>
      `,
    });

    return sendSuccess(
      res,
      201,
      "User registered successfully. Please verify your email.",
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { userInfo, password } = req.body;
    // Find user by either email or username
    const user = await userModel
      .findOne({
        $or: [{ email: userInfo }, { username: userInfo }],
      })
      .select("+password");

    if (!user) {
      return next(new UnauthorizedError("Invalid credentials"));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new UnauthorizedError("Invalid credentials"));
    }

    if (!user.verified) {
      return next(
        new ValidationError(
          null,
          "Please verify your email address before logging in",
        ),
      );
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, 200, "Login successful", {
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return next(new NotFoundError("User not found or token invalid"));
    }

    user.verified = true;
    await user.save();

    const html = `<h1> User Verified </h1>
    <p> Click Here to Login <a href="${process.env.FRONTEND_URL}/login">Login to aether-ai</a></p>`;
    res.send(html);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  return sendSuccess(res, 200, "Logout successful");
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);

    if (!user) {
      return next(new NotFoundError("User profile not found"));
    }

    return sendSuccess(res, 200, "User profile fetched", {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const guestLogin = async (req, res, next) => {
  const { username } = req.body;
  const [email, password] = [
    Math.random().toString(36).slice(2) + "@guest.com",
    Math.random().toString(36).slice(2),
  ];
  const userExists = await userModel.findOne({ username });
  if (userExists) {
    return next(
      new ConflictError("User with this username already exists", {
        username: "Username is already taken",
      }),
    );
  }

  try {
    const user = await userModel.create({
      username,
      email,
      password,
      verified: true,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, 201, "Guest user session created successfully.", {
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};
