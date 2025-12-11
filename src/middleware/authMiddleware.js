import { PrismaClient } from "@prisma/client";
import { AppError } from "./errorHandler.js";
import { verifyToken } from "../utils/tokenUtils.js";

const prisma = new PrismaClient();

// Authenticate middleware - verifies JWT token
export const authenticate = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = verifyToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
        },
      });

      if (!user) {
        return next(new AppError("Not authorized, user not found", 401));
      }

      req.user = user;
      next();
    } catch (error) {
      if (!(error instanceof AppError)) {
        console.error("Auth Error:", error.message);
        return next(new AppError("Not authorized, token failed", 401));
      }
      return next(error);
    }
  } else {
    return next(new AppError("Not authorized, no token", 401));
  }
};

// Authorize middleware - checks if user has required role(s)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Not authorized. Required roles: ${roles.join(", ")}. Your role: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
};

// Admin middleware (backward compatibility)
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return next(new AppError("Not authorized. Requires Admin privileges.", 403));
  }
};