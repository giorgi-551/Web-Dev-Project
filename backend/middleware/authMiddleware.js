import { PrismaClient } from "@prisma/client";
import { AppError } from "./errorHandler.js"; // Needs AppError to throw custom HTTP errors
import { verifyToken } from "../utils/tokenUtils.js";

const prisma = new PrismaClient();

export const protect = async (req, res, next) => {
  let token;

  // 1. Check if the token is present and correctly formatted in the header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (removes 'Bearer ')
      token = req.headers.authorization.split(" ")[1];
      
      // 2. Verify the token using the utility function
      // This will throw an error if the token is expired or invalid
      const decoded = verifyToken(token); 

      // 3. Find the user in the database based on the ID in the token's payload
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
        // Token was valid but user no longer exists
        return next(new AppError("Not authorized, user not found", 401));
      }

      // 4. Attach the user object to the request for use in route handlers
      req.user = user;
      
      // Move on to the next middleware or route handler
      next();
    } catch (error) {
      // Handles JWT errors (e.g., token expired, bad signature)
      if (!(error instanceof AppError)) {
         console.error("Auth Error:", error.message);
         return next(new AppError("Not authorized, token failed", 401));
      }
      return next(error);
    }
  }

  if (!token) {
    return next(new AppError("Not authorized, no token", 401));
  }
};

export const admin = (req, res, next) => {
  // Check if user object exists AND if their role is 'admin'
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    // Access denied
    return next(new AppError("Not authorized. Requires Admin privileges.", 403));
  }
};