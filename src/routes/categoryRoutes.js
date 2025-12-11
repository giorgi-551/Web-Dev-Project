import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../services/categoryService.js";

const router = express.Router();

// Public routes
router.get("/", async (req, res, next) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const category = await getCategoryById(req.params.id);
    res.json(category);
  } catch (error) {
    next(error);
  }
});

// Protected routes (Admin only)
router.post("/", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const { name, slug, color } = req.body;
    const category = await createCategory(name, slug, color);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const category = await updateCategory(req.params.id, req.body);
    res.json(category);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const result = await deleteCategory(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;