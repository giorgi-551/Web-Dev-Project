import express from "express";
import { PrismaClient } from "@prisma/client";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { generateToken } from "../utils/tokenUtils.js";
import { AppError } from "../middleware/errorHandler.js";

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/register - Handles user creation and JWT return
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Use the AppError class to send a clean error response
      throw new AppError("Email already registered", 400);
    }

    // 2. Hash the password using the utility function
    const hashedPassword = await hashPassword(password);

    // 3. Create the user record
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: "user", // Default role
      },
    });

    // 4. Generate token using the utility function
    const token = generateToken(user.id, user.role);

    // 5. Send successful response
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    // Pass any error to the central errorHandler middleware
    next(error);
  }
});

// POST /api/auth/login - Handles user login and JWT return
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // 2. Verify password using the utility function
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new AppError("Invalid credentials", 401);
    }

    // 3. Generate token
    const token = generateToken(user.id, user.role);

    // 4. Send successful response
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

export default router;