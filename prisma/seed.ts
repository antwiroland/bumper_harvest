import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seeding...")

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@bamper.com" },
    update: {},
    create: {
      email: "admin@bamper.com",
      password: adminPassword,
      name: "Admin User",
      role: Role.ADMIN,
      wallet: {
        create: {
          balance: 0,
        },
      },
    },
  })
  console.log("Created admin user:", admin.email)

  // Create sample user
  const userPassword = await bcrypt.hash("user123", 12)
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: userPassword,
      name: "Test User",
      role: Role.USER,
      wallet: {
        create: {
          balance: 50000, // Starting balance for testing
        },
      },
    },
  })
  console.log("Created test user:", user.email)

  // Create sample categories
  const electronicsCategory = await prisma.category.upsert({
    where: { id: "000000000000000000000001" },
    update: {},
    create: {
      name: "Electronics",
      description: "Electronic gadgets and accessories",
      packagePrice: 25000,
      subscriptionFee: 2000,
      isActive: true,
    },
  })
  console.log("Created category:", electronicsCategory.name)

  const fashionCategory = await prisma.category.upsert({
    where: { id: "000000000000000000000002" },
    update: {},
    create: {
      name: "Fashion",
      description: "Clothing, shoes, and accessories",
      packagePrice: 15000,
      subscriptionFee: 1500,
      isActive: true,
    },
  })
  console.log("Created category:", fashionCategory.name)

  const groceriesCategory = await prisma.category.upsert({
    where: { id: "000000000000000000000003" },
    update: {},
    create: {
      name: "Groceries",
      description: "Food items and household essentials",
      packagePrice: 10000,
      subscriptionFee: 1000,
      isActive: true,
    },
  })
  console.log("Created category:", groceriesCategory.name)

  // Create sample package for electronics
  const phoneAccessoriesPackage = await prisma.package.create({
    data: {
      categoryId: electronicsCategory.id,
      name: "Phone Accessories Bundle",
      description: "High-demand phone accessories including cases, chargers, and earphones",
      isActive: true,
      products: {
        create: [
          {
            name: "Phone Cases",
            quantity: 20,
            costPrice: 500,
            sellingPrice: 800,
          },
          {
            name: "USB Chargers",
            quantity: 15,
            costPrice: 600,
            sellingPrice: 1000,
          },
          {
            name: "Wireless Earphones",
            quantity: 10,
            costPrice: 800,
            sellingPrice: 1400,
          },
        ],
      },
    },
  })
  console.log("Created package:", phoneAccessoriesPackage.name)

  console.log("Database seeding completed!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
