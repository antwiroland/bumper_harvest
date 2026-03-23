import type { Product } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type {
  CreateProductInput,
  ProductQueryInput,
  UpdateProductInput,
} from "@/lib/validations/product";

export class ProductServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "BAD_REQUEST",
  ) {
    super(message);
    this.name = "ProductServiceError";
  }
}

async function ensureProductExists(id: string) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new ProductServiceError("Product not found", "NOT_FOUND");
  }
  return existing;
}

async function ensurePackageExists(id: string) {
  const pkg = await prisma.package.findUnique({ where: { id } });
  if (!pkg) {
    throw new ProductServiceError("Package not found", "BAD_REQUEST");
  }
  return pkg;
}

function toUpdateData(data: UpdateProductInput): Prisma.ProductUpdateInput {
  return {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
    ...(data.costPrice !== undefined ? { costPrice: data.costPrice } : {}),
    ...(data.sellingPrice !== undefined ? { sellingPrice: data.sellingPrice } : {}),
  };
}

export const productService = {
  async getProducts(filters?: ProductQueryInput) {
    return prisma.product.findMany({
      where: {
        ...(filters?.packageId ? { packageId: filters.packageId } : {}),
      },
      include: {
        package: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getProductsByPackage(packageId: string) {
    return prisma.product.findMany({
      where: { packageId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getProductById(id: string) {
    const item = await prisma.product.findUnique({
      where: { id },
      include: { package: true },
    });
    if (!item) {
      throw new ProductServiceError("Product not found", "NOT_FOUND");
    }
    return item;
  },

  async createProduct(data: CreateProductInput) {
    await ensurePackageExists(data.packageId);
    return prisma.product.create({
      data: {
        package: { connect: { id: data.packageId } },
        name: data.name,
        quantity: data.quantity,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
      },
      include: {
        package: true,
      },
    });
  },

  async updateProduct(id: string, data: UpdateProductInput) {
    await ensureProductExists(id);
    return prisma.product.update({
      where: { id },
      data: toUpdateData(data),
      include: {
        package: true,
      },
    });
  },

  async deleteProduct(id: string) {
    await ensureProductExists(id);
    return prisma.product.delete({
      where: { id },
    });
  },

  calculateProductProfit(product: Pick<Product, "quantity" | "costPrice" | "sellingPrice">) {
    const totalCost = product.quantity * product.costPrice;
    const totalRevenue = product.quantity * product.sellingPrice;
    const expectedProfit = totalRevenue - totalCost;

    return {
      totalCost,
      totalRevenue,
      expectedProfit,
    };
  },
};
