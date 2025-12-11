import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler.js";

const prisma = new PrismaClient();

export const createCategory = async (name, slug, color) => {
  const existingCategory = await prisma.category.findUnique({
    where: { slug },
  });

  if (existingCategory) {
    throw new AppError("Category slug already exists", 400);
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      color,
    },
  });

  return category;
};

export const getCategories = async () => {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { events: true },
      },
    },
  });

  return categories;
};

export const getCategoryById = async (categoryId) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      events: {
        where: { status: "published" },
      },
    },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

export const updateCategory = async (categoryId, updateData) => {
  if (updateData.slug) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: updateData.slug },
    });

    if (existingCategory && existingCategory.id !== categoryId) {
      throw new AppError("Category slug already exists", 400);
    }
  }

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: updateData,
  });

  return category;
};

export const deleteCategory = async (categoryId) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: { events: true },
      },
    },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (category._count.events > 0) {
    throw new AppError("Cannot delete category with existing events", 400);
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return { message: "Category deleted successfully" };
};