import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validations/category";

export class CategoryServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "BAD_REQUEST",
  ) {
    super(message);
    this.name = "CategoryServiceError";
  }
}

function toCreateCategoryData(data: CreateCategoryInput): Prisma.CategoryCreateInput {
  return {
    name: data.name,
    ...(data.description !== undefined ? { description: data.description || null } : {}),
    packagePrice: data.packagePrice,
    subscriptionFee: data.subscriptionFee,
    ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
  };
}

function toUpdateCategoryData(data: UpdateCategoryInput): Prisma.CategoryUpdateInput {
  return {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.description !== undefined ? { description: data.description || null } : {}),
    ...(data.packagePrice !== undefined ? { packagePrice: data.packagePrice } : {}),
    ...(data.subscriptionFee !== undefined ? { subscriptionFee: data.subscriptionFee } : {}),
    ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
  };
}

async function ensureCategoryExists(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new CategoryServiceError("Category not found", "NOT_FOUND");
  }
  return category;
}

export const categoryService = {
  async getAllCategories() {
    return prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async getActiveCategories() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getCategoryById(id: string) {
    return ensureCategoryExists(id);
  },

  async getCategoryWithPackages(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        packages: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!category) {
      throw new CategoryServiceError("Category not found", "NOT_FOUND");
    }

    return category;
  },

  async createCategory(data: CreateCategoryInput) {
    return prisma.category.create({
      data: toCreateCategoryData(data),
    });
  },

  async updateCategory(id: string, data: UpdateCategoryInput) {
    await ensureCategoryExists(id);
    return prisma.category.update({
      where: { id },
      data: toUpdateCategoryData(data),
    });
  },

  async toggleCategoryStatus(id: string) {
    const existing = await ensureCategoryExists(id);
    return prisma.category.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
  },

  async deleteCategory(id: string) {
    await ensureCategoryExists(id);
    return prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
