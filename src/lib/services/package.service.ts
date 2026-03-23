import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type {
  CreatePackageInput,
  CreateProductInPackageInput,
  PackageQueryInput,
  UpdatePackageInput,
} from "@/lib/validations/package";

export class PackageServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "BAD_REQUEST",
  ) {
    super(message);
    this.name = "PackageServiceError";
  }
}

async function ensurePackageExists(id: string) {
  const existing = await prisma.package.findUnique({ where: { id } });
  if (!existing) {
    throw new PackageServiceError("Package not found", "NOT_FOUND");
  }
  return existing;
}

async function ensureCategoryExists(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new PackageServiceError("Category not found", "BAD_REQUEST");
  }
  return category;
}

function toCreateData(data: CreatePackageInput): Prisma.PackageCreateInput {
  return {
    category: { connect: { id: data.categoryId } },
    name: data.name,
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
  };
}

function toUpdateData(data: UpdatePackageInput): Prisma.PackageUpdateInput {
  return {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.description !== undefined ? { description: data.description || null } : {}),
    ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl || null } : {}),
    ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
  };
}

export const packageService = {
  async getAllPackages(filters?: PackageQueryInput) {
    const where: Prisma.PackageWhereInput = {
      ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters?.includeInactive ? {} : { isActive: true }),
    };

    return prisma.package.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getPackagesByCategory(categoryId: string) {
    return prisma.package.findMany({
      where: { categoryId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getPackageById(id: string) {
    await ensurePackageExists(id);
    return prisma.package.findUnique({
      where: { id },
      include: { category: true },
    });
  },

  async getPackageWithProducts(id: string) {
    const item = await prisma.package.findUnique({
      where: { id },
      include: {
        category: true,
        products: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!item) {
      throw new PackageServiceError("Package not found", "NOT_FOUND");
    }

    return item;
  },

  async createPackage(data: CreatePackageInput) {
    await ensureCategoryExists(data.categoryId);
    return prisma.package.create({
      data: toCreateData(data),
      include: { category: true },
    });
  },

  async updatePackage(id: string, data: UpdatePackageInput) {
    await ensurePackageExists(id);
    return prisma.package.update({
      where: { id },
      data: toUpdateData(data),
      include: { category: true },
    });
  },

  async deletePackage(id: string) {
    await ensurePackageExists(id);
    return prisma.package.update({
      where: { id },
      data: { isActive: false },
    });
  },

  async addProductToPackage(id: string, data: CreateProductInPackageInput) {
    await ensurePackageExists(id);
    return prisma.product.create({
      data: {
        package: { connect: { id } },
        name: data.name,
        quantity: data.quantity,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
      },
    });
  },

  async calculatePackageMetrics(id: string) {
    const pkg = await this.getPackageWithProducts(id);
    const totalCost = pkg.products.reduce(
      (sum, product) => sum + product.quantity * product.costPrice,
      0,
    );
    const totalRevenue = pkg.products.reduce(
      (sum, product) => sum + product.quantity * product.sellingPrice,
      0,
    );
    const expectedProfit = totalRevenue - totalCost;

    return {
      packageId: pkg.id,
      totalCost,
      totalRevenue,
      expectedProfit,
      productCount: pkg.products.length,
    };
  },
};
