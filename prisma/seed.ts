import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

type SeedCategory = {
  name: string;
  description: string;
  packagePrice: number;
  subscriptionFee: number;
  packages: Array<{
    name: string;
    description: string;
    products: Array<{
      name: string;
      quantity: number;
      costPrice: number;
      sellingPrice: number;
    }>;
  }>;
};

const seedCategories: SeedCategory[] = [
  {
    name: "Groceries",
    description: "High-demand household goods.",
    packagePrice: 300,
    subscriptionFee: 25,
    packages: [
      {
        name: "Essentials Basket",
        description: "Fast-moving staples package.",
        products: [
          { name: "Rice (5kg)", quantity: 80, costPrice: 12, sellingPrice: 16 },
          { name: "Vegetable Oil (1L)", quantity: 120, costPrice: 3, sellingPrice: 4.2 },
          { name: "Sugar (1kg)", quantity: 100, costPrice: 2.1, sellingPrice: 3.1 },
        ],
      },
    ],
  },
  {
    name: "Home Care",
    description: "Cleaning and maintenance products.",
    packagePrice: 450,
    subscriptionFee: 40,
    packages: [
      {
        name: "Clean Living Pack",
        description: "Cleaning products with stable weekly demand.",
        products: [
          { name: "Laundry Detergent", quantity: 70, costPrice: 5, sellingPrice: 7 },
          { name: "Dish Soap", quantity: 100, costPrice: 2.5, sellingPrice: 3.7 },
          { name: "Surface Cleaner", quantity: 85, costPrice: 3.8, sellingPrice: 5.5 },
        ],
      },
    ],
  },
];

async function seedAdminUser() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@bumperharvest.com")
    .toLowerCase()
    .trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminName = process.env.SEED_ADMIN_NAME ?? "System Admin";
  const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      password: hashedPassword,
      role: Role.ADMIN,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: Role.ADMIN,
      wallet: {
        create: {
          balance: 0,
        },
      },
    },
  });

  await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, balance: 0 },
  });

  return admin;
}

async function seedCatalog() {
  for (const categoryData of seedCategories) {
    const category = await prisma.category.findFirst({
      where: { name: categoryData.name },
    });

    const savedCategory =
      category ??
      (await prisma.category.create({
        data: {
          name: categoryData.name,
          description: categoryData.description,
          packagePrice: categoryData.packagePrice,
          subscriptionFee: categoryData.subscriptionFee,
          isActive: true,
        },
      }));

    for (const packageData of categoryData.packages) {
      const existingPackage = await prisma.package.findFirst({
        where: {
          categoryId: savedCategory.id,
          name: packageData.name,
        },
      });

      const savedPackage =
        existingPackage ??
        (await prisma.package.create({
          data: {
            categoryId: savedCategory.id,
            name: packageData.name,
            description: packageData.description,
            isActive: true,
          },
        }));

      for (const productData of packageData.products) {
        const existingProduct = await prisma.product.findFirst({
          where: {
            packageId: savedPackage.id,
            name: productData.name,
          },
        });

        if (!existingProduct) {
          await prisma.product.create({
            data: {
              packageId: savedPackage.id,
              name: productData.name,
              quantity: productData.quantity,
              costPrice: productData.costPrice,
              sellingPrice: productData.sellingPrice,
            },
          });
        }
      }
    }
  }
}

async function main() {
  const admin = await seedAdminUser();
  await seedCatalog();
  console.log(`Seed complete. Admin: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
