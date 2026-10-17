import userModel from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const { username, email, password, verified } = req.body;
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
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
    );

    await sendEmail({
      to: user.email,
      subject: "Verify your email",
      html: `
        <p> Welcome Onboard ${username} </p>
        <h1>Verify your email</h1>
        <p>Click the link to verify your email: <a href="http://localhost:3000/api/auth/verify-email?token=${token}">Verify Email</a></p>
        <span style="color: #888; font-size: 12px; margin-top: 20px; display: block;"> Team Perplexity AI</span>
      `,
    });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { userInfo, password } = req.body;
    // Find user by either email or username using $or
    const user = await userModel
      .findOne({
        $or: [{ email: userInfo }, { username: userInfo }],
      })
      .select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.verified) {
      return res.status(400).json({
        message: "Please verify your email address",
        success: false,
        error: "Email Not Verified",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 3600000,
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    const userId = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(userId.id);

    if (!user) {
      return res.status(404).json({ message: "Token not found" });
    }

    user.verified = true;
    await user.save();

    const html = `<h1> User Verified </h1>
    <p> Click Here to Login <a href="http://localhost:3000/api/auth/login">Login</a></p>`;
    res.send(html);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.decoded.id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
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
