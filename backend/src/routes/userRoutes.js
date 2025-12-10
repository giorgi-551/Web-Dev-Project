import express from "express";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler.js"; 
import { protect, admin } from "../../middleware/authMiddleware.js"; 

const router = express.Router();
const prisma = new PrismaClient();

// ----------------------------------------------------------------------
// AUTHENTICATED USER ROUTES (Applies to the currently logged-in user)
// ----------------------------------------------------------------------

// GET /api/users/me - Get the currently logged-in user's profile
router.get("/me", protect, async (req, res, next) => {
  try {
    // req.user is populated by the 'protect' middleware
    res.json(req.user);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/me - Update the currently logged-in user's profile
router.put("/me", protect, async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id; // User ID from the token/req.user

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name,
        phone: phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        updatedAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    if (error.code === 'P2025') { 
        return next(new AppError("User profile not found.", 404));
    }
    next(error);
  }
});


// ----------------------------------------------------------------------
// ADMIN MANAGEMENT ROUTES
// ----------------------------------------------------------------------

// GET /api/users - List all users (Admin only)
router.get("/", protect, admin, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Get a single user by ID (Admin only)
router.get("/:id", protect, admin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        events: true, // Include events they are organizing
        registrations: true // Include events they registered for
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id - Update user details, including role (Admin only)
router.put("/:id", protect, admin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, email, role } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        phone,
        email,
        role, // Admin can update the user's role
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        updatedAt: true,
      }
    });

    res.json({ message: "User updated successfully (Admin action)", user: updatedUser });
  } catch (error) {
    if (error.code === 'P2025') { 
        return next(new AppError("User not found.", 404));
    }
    next(error);
  }
});

// DELETE /api/users/:id - Delete a user (Admin only)
router.delete("/:id", protect, admin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Optional: Check if the user being deleted is the deleting admin itself
    if (id === req.user.id) {
        throw new AppError("Cannot delete your own admin account.", 400);
    }
    
    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    if (error.code === 'P2025') { 
        return next(new AppError("User not found.", 404));
    }
    next(error);
  }
});

export default router;