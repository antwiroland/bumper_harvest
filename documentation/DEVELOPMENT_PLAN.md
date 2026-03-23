# Bamper Harvest - Full Stack Development Plan

## Project Overview

A **Package Category Sales Platform** built with Next.js 15 (App Router) that enables users to subscribe to package categories, purchase packages, and earn profits from company-managed product sales. The platform guarantees capital protection and earns 10% commission on successful sales.

---

## Technology Stack

| Layer            | Technology                 |
| ---------------- | -------------------------- |
| Framework        | Next.js 15 (App Router)    |
| Language         | TypeScript                 |
| Styling          | Tailwind CSS + shadcn/ui   |
| Database         | MongoDB Atlas              |
| ORM              | Prisma (MongoDB Connector) |
| Authentication   | NextAuth.js v5 (Auth.js)   |
| Validation       | Zod                        |
| Charts           | Recharts                   |
| State Management | Zustand                    |
| Forms            | React Hook Form + Zod      |
| Payments         | Paystack/Flutterwave       |
| Cron Jobs        | Vercel Cron                |
| Caching          | Redis (optional)           |

---

## Development Phases

> **Rule**: Backend must be 100% complete before starting Frontend development.

---

# PHASE 1: PROJECT SETUP & CONFIGURATION

## 1.1 Initial Project Setup

- [x] Initialize Next.js 15 project with TypeScript
  ```bash
  npx create-next-app@latest bamper-harvest --typescript --tailwind --eslint --app --src-dir
  ```
- [x] Configure TypeScript strict mode in `tsconfig.json`
- [x] Set up path aliases (`@/components`, `@/lib`, `@/types`, etc.)
- [x] Install and configure ESLint with Prettier
- [x] Set up `.env.local` and `.env.example` files
- [x] Configure `.gitignore` properly
- [x] Create project folder structure

## 1.2 Folder Structure Setup

- [x] Create the following directory structure:

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── user/
│   │   │   ├── dashboard/
│   │   │   ├── packages/
│   │   │   ├── subscriptions/
│   │   │   ├── wallet/
│   │   │   └── settings/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── categories/
│   │   │   ├── packages/
│   │   │   ├── products/
│   │   │   ├── sales/
│   │   │   ├── users/
│   │   │   └── settlements/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── categories/
│   │   ├── packages/
│   │   ├── products/
│   │   ├── subscriptions/
│   │   ├── purchases/
│   │   ├── sales/
│   │   ├── settlement/
│   │   ├── wallet/
│   │   └── webhooks/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── forms/
│   ├── charts/
│   ├── tables/
│   ├── cards/
│   ├── modals/
│   └── layout/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── utils.ts
│   ├── validations/
│   ├── services/
│   └── constants.ts
├── hooks/
├── types/
├── stores/
└── middleware.ts
```

## 1.3 Database Setup (MongoDB)

- [x] Install Prisma CLI and client
  ```bash
  npm install prisma @prisma/client
  npx prisma init
  ```
- [ ] Create MongoDB Atlas account and cluster
- [ ] Create database user with read/write permissions
- [ ] Get MongoDB connection string
- [ ] Configure MongoDB connection in `.env`
  ```env
  DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority"
  ```
- [x] Configure Prisma for MongoDB in `prisma/schema.prisma`

  ```prisma
  datasource db {
    provider = "mongodb"
    url      = env("DATABASE_URL")
  }

  generator client {
    provider = "prisma-client-js"
  }
  ```

## 1.4 UI Framework Setup

- [ ] Install and configure shadcn/ui
  ```bash
  npx shadcn@latest init
  ```
- [x] Configure Tailwind CSS with custom theme colors
- [x] Set up custom fonts (Inter or similar)
- [x] Install Lucide React icons
- [x] Install Recharts for data visualization

---

# PHASE 2: DATABASE DESIGN & PRISMA SCHEMA (MongoDB)

## 2.1 Core Schema Models

- [x] Create User model

```prisma
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  email         String    @unique
  password      String
  name          String
  phone         String?
  role          Role      @default(USER)
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  wallet        Wallet?
  subscriptions Subscription[]
  purchases     PackagePurchase[]
}

enum Role {
  USER
  ADMIN
}
```

- [x] Create Wallet model

```prisma
model Wallet {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @unique @db.ObjectId
  balance   Float    @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user         User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions WalletTransaction[]
}

model WalletTransaction {
  id          String          @id @default(auto()) @map("_id") @db.ObjectId
  walletId    String          @db.ObjectId
  type        TransactionType
  amount      Float
  description String
  reference   String?
  createdAt   DateTime        @default(now())

  wallet Wallet @relation(fields: [walletId], references: [id], onDelete: Cascade)
}

enum TransactionType {
  CREDIT
  DEBIT
}
```

- [x] Create Category model

```prisma
model Category {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  name            String
  description     String?
  packagePrice    Float
  subscriptionFee Float
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  packages      Package[]
  subscriptions Subscription[]
}
```

- [x] Create Subscription model

```prisma
model Subscription {
  id         String             @id @default(auto()) @map("_id") @db.ObjectId
  userId     String             @db.ObjectId
  categoryId String             @db.ObjectId
  status     SubscriptionStatus @default(ACTIVE)
  startDate  DateTime           @default(now())
  endDate    DateTime?
  createdAt  DateTime           @default(now())
  updatedAt  DateTime           @updatedAt

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@unique([userId, categoryId])
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
}
```

- [x] Create Package model

```prisma
model Package {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  categoryId  String   @db.ObjectId
  name        String
  description String?
  imageUrl    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  category  Category          @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  products  Product[]
  purchases PackagePurchase[]
}
```

- [x] Create Product model

```prisma
model Product {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  packageId    String   @db.ObjectId
  name         String
  quantity     Int
  costPrice    Float
  sellingPrice Float
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  package     Package              @relation(fields: [packageId], references: [id], onDelete: Cascade)
  salesRecord ProductSalesRecord[]
}
```

- [x] Create PackagePurchase model

```prisma
model PackagePurchase {
  id                 String         @id @default(auto()) @map("_id") @db.ObjectId
  userId             String         @db.ObjectId
  packageId          String         @db.ObjectId
  purchasePrice      Float
  expectedProfit     Float
  status             PurchaseStatus @default(ACTIVE)
  sellingWindowStart DateTime       @default(now())
  sellingWindowEnd   DateTime
  completionPercent  Float          @default(0)
  settledAt          DateTime?
  payoutAmount       Float?
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt

  user         User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  package      Package              @relation(fields: [packageId], references: [id], onDelete: Cascade)
  salesRecords ProductSalesRecord[]
}

enum PurchaseStatus {
  ACTIVE
  SETTLED
  REFUNDED
}
```

- [x] Create ProductSalesRecord model

```prisma
model ProductSalesRecord {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  purchaseId       String   @db.ObjectId
  productId        String   @db.ObjectId
  totalQuantity    Int
  soldQuantity     Int      @default(0)
  lastUpdatedBy    String?  @db.ObjectId
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  purchase PackagePurchase @relation(fields: [purchaseId], references: [id], onDelete: Cascade)
  product  Product         @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([purchaseId, productId])
}
```

- [x] Create SettlementLog model

```prisma
model SettlementLog {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  purchaseId    String   @db.ObjectId
  status        String
  payout        Float
  commission    Float
  completionPct Float
  processedAt   DateTime @default(now())
}
```

- [x] Create PaymentTransaction model

```prisma
model PaymentTransaction {
  id          String        @id @default(auto()) @map("_id") @db.ObjectId
  userId      String        @db.ObjectId
  type        PaymentType
  amount      Float
  status      PaymentStatus @default(PENDING)
  reference   String        @unique
  provider    String
  metadata    Json?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum PaymentType {
  DEPOSIT
  SUBSCRIPTION
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
}
```

## 2.2 Database Setup & Indexing

- [ ] Push schema to MongoDB
  ```bash
  npx prisma db push
  ```
- [x] Generate Prisma client
  ```bash
  npx prisma generate
  ```
- [x] Create database indexes for performance

  ```prisma
  // Add to schema.prisma
  model User {
    // ... fields
    @@index([email])
    @@index([role])
  }

  model PackagePurchase {
    // ... fields
    @@index([userId])
    @@index([status])
    @@index([sellingWindowEnd])
  }

  model WalletTransaction {
    // ... fields
    @@index([walletId])
    @@index([createdAt])
  }
  ```

- [x] Create database seed file (`prisma/seed.ts`)
- [x] Add seed script to `package.json`
  ```json
  {
    "prisma": {
      "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
    }
  }
  ```
- [x] Create initial admin user seed
- [x] Create sample categories and packages seed

## 2.3 Prisma Client Setup

- [x] Create `src/lib/prisma.ts` - Singleton Prisma client

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

# PHASE 3: BACKEND - AUTHENTICATION SYSTEM

## 3.1 NextAuth.js Configuration

- [x] Install NextAuth.js v5
  ```bash
  npm install next-auth@beta @auth/prisma-adapter
  ```
- [x] Create `src/lib/auth.ts` configuration file
- [x] Configure Credentials provider with password hashing
- [x] Set up Prisma adapter for MongoDB session/account storage
- [x] Configure JWT strategy with role claim
- [x] Create auth types extension for User/Session

## 3.2 Authentication API Routes

- [x] Create `app/api/auth/[...nextauth]/route.ts`
- [x] Create `app/api/auth/register/route.ts` - User registration endpoint
  - Validate input with Zod
  - Hash password with bcrypt
  - Create user with wallet
  - Return success response
- [x] Create password hashing utility (`lib/password.ts`)
- [x] Add email validation utility

## 3.3 Authentication Middleware

- [x] Create `src/middleware.ts` for route protection
- [x] Configure protected routes patterns
- [x] Implement role-based access control (ADMIN/USER)
- [x] Handle redirect logic for unauthenticated users

## 3.4 Auth Utilities

- [x] Create `lib/auth-utils.ts` with helper functions:
  - `getCurrentUser()` - Get current session user
  - `requireAuth()` - Throw if not authenticated
  - `requireAdmin()` - Throw if not admin
  - `requireUser()` - Throw if not regular user

---

# PHASE 4: BACKEND - WALLET SYSTEM

## 4.1 Wallet Service Layer

- [x] Create `lib/services/wallet.service.ts`
  - `getWallet(userId)` - Get user wallet
  - `getBalance(userId)` - Get wallet balance
  - `credit(userId, amount, description)` - Add funds
  - `debit(userId, amount, description)` - Remove funds
  - `getTransactions(userId, pagination)` - Get transaction history
  - `hasSufficientBalance(userId, amount)` - Check balance

## 4.2 Wallet API Routes

- [x] Create `app/api/wallet/route.ts` - GET wallet details
- [x] Create `app/api/wallet/transactions/route.ts` - GET transactions
- [x] Create `app/api/wallet/deposit/route.ts` - POST initiate deposit
- [x] Create `app/api/wallet/withdraw/route.ts` - POST request withdrawal

## 4.3 Wallet Validation Schemas

- [x] Create `lib/validations/wallet.ts`
  - Deposit schema (amount validation)
  - Withdrawal schema (amount, account details)
  - Transaction query schema (pagination, filters)

---

# PHASE 5: BACKEND - CATEGORY MANAGEMENT

## 5.1 Category Service Layer

- [x] Create `lib/services/category.service.ts`
  - `getAllCategories()` - List all categories
  - `getActiveCategories()` - List active categories
  - `getCategoryById(id)` - Get single category
  - `createCategory(data)` - Create new category
  - `updateCategory(id, data)` - Update category
  - `toggleCategoryStatus(id)` - Activate/deactivate
  - `deleteCategory(id)` - Soft delete category
  - `getCategoryWithPackages(id)` - Get with related packages

## 5.2 Category API Routes

- [x] Create `app/api/categories/route.ts`
  - GET - List categories (public: active only, admin: all)
  - POST - Create category (admin only)
- [x] Create `app/api/categories/[id]/route.ts`
  - GET - Get single category
  - PUT - Update category (admin)
  - DELETE - Delete category (admin)
- [x] Create `app/api/categories/[id]/packages/route.ts`
  - GET - Get packages in category

## 5.3 Category Validation Schemas

- [x] Create `lib/validations/category.ts`
  - Create category schema
  - Update category schema
  - Query params schema

---

# PHASE 6: BACKEND - PACKAGE MANAGEMENT

## 6.1 Package Service Layer

- [x] Create `lib/services/package.service.ts`
  - `getAllPackages()` - List all packages
  - `getPackagesByCategory(categoryId)` - Filter by category
  - `getPackageById(id)` - Get single package
  - `getPackageWithProducts(id)` - Get with products
  - `createPackage(data)` - Create package
  - `updatePackage(id, data)` - Update package
  - `deletePackage(id)` - Delete package
  - `calculatePackageMetrics(id)` - Total cost, profit

## 6.2 Package API Routes

- [x] Create `app/api/packages/route.ts`
  - GET - List packages (with filters)
  - POST - Create package (admin)
- [x] Create `app/api/packages/[id]/route.ts`
  - GET - Get package details
  - PUT - Update package (admin)
  - DELETE - Delete package (admin)
- [x] Create `app/api/packages/[id]/products/route.ts`
  - GET - Get products in package
  - POST - Add product to package (admin)

## 6.3 Package Validation Schemas

- [x] Create `lib/validations/package.ts`
  - Create package schema
  - Update package schema

---

# PHASE 7: BACKEND - PRODUCT MANAGEMENT

## 7.1 Product Service Layer

- [x] Create `lib/services/product.service.ts`
  - `getProductsByPackage(packageId)` - List products
  - `getProductById(id)` - Get single product
  - `createProduct(data)` - Create product
  - `updateProduct(id, data)` - Update product
  - `deleteProduct(id)` - Delete product
  - `calculateProductProfit(product)` - Calculate profit

## 7.2 Product API Routes

- [x] Create `app/api/products/route.ts`
  - GET - List products (with filters)
  - POST - Create product (admin)
- [x] Create `app/api/products/[id]/route.ts`
  - GET - Get product details
  - PUT - Update product (admin)
  - DELETE - Delete product (admin)

## 7.3 Product Validation Schemas

- [x] Create `lib/validations/product.ts`
  - Create product schema
  - Update product schema

---

# PHASE 8: BACKEND - SUBSCRIPTION SYSTEM

## 8.1 Subscription Service Layer

- [x] Create `lib/services/subscription.service.ts`
  - `getUserSubscriptions(userId)` - Get user's subscriptions
  - `hasActiveSubscription(userId, categoryId)` - Check status
  - `createSubscription(userId, categoryId)` - New subscription
  - `cancelSubscription(id)` - Cancel subscription
  - `getSubscriptionsByCategory(categoryId)` - Admin view
  - `checkSubscriptionValidity(userId, categoryId)` - Validate

## 8.2 Subscription API Routes

- [x] Create `app/api/subscriptions/route.ts`
  - GET - List user subscriptions
  - POST - Subscribe to category
- [x] Create `app/api/subscriptions/[id]/route.ts`
  - GET - Get subscription details
  - DELETE - Cancel subscription
- [x] Create `app/api/subscriptions/check/route.ts`
  - POST - Check if user can access category

## 8.3 Subscription Validation

- [x] Create `lib/validations/subscription.ts`
  - Subscribe schema
  - Check subscription schema

---

# PHASE 9: BACKEND - PURCHASE SYSTEM

## 9.1 Purchase Service Layer

- [x] Create `lib/services/purchase.service.ts`
  - `getUserPurchases(userId)` - Get user's purchases
  - `getPurchaseById(id)` - Get purchase details
  - `createPurchase(userId, packageId)` - New purchase
    - Validate subscription
    - Check wallet balance
    - Debit wallet
    - Create purchase record
    - Create sales records for each product
    - Set selling window (7 days)
  - `getActivePurchases(userId)` - Get active purchases
  - `getPurchaseProgress(id)` - Calculate completion %
  - `getAllPurchases(filters)` - Admin view

## 9.2 Purchase API Routes

- [x] Create `app/api/purchases/route.ts`
  - GET - List purchases (user: own, admin: all)
  - POST - Create new purchase
- [x] Create `app/api/purchases/[id]/route.ts`
  - GET - Get purchase details with progress
- [x] Create `app/api/purchases/[id]/progress/route.ts`
  - GET - Get detailed progress with products

## 9.3 Purchase Validation

- [x] Create `lib/validations/purchase.ts`
  - Create purchase schema
  - Query params schema

---

# PHASE 10: BACKEND - SALES TRACKING SYSTEM

## 10.1 Sales Service Layer

- [x] Create `lib/services/sales.service.ts`
  - `getSalesRecords(purchaseId)` - Get all sales for purchase
  - `updateSalesProgress(purchaseId, productId, soldQty)` - Update sold
    - Validate selling window is active
    - Validate sold <= total quantity
    - Update record
    - Recalculate completion percentage
  - `calculateCompletion(purchaseId)` - Calculate % complete
  - `isWithinSellingWindow(purchaseId)` - Check window
  - `getExpiredActivePurchases()` - For settlement

## 10.2 Sales API Routes

- [x] Create `app/api/sales/route.ts`
  - GET - Get sales records (admin)
- [x] Create `app/api/sales/[purchaseId]/route.ts`
  - GET - Get sales for specific purchase
  - PUT - Update sales progress (admin only)
- [x] Create `app/api/sales/[purchaseId]/[productId]/route.ts`
  - PUT - Update specific product sales (admin)

## 10.3 Sales Validation

- [x] Create `lib/validations/sales.ts`
  - Update sales schema
  - Bulk update schema

---

# PHASE 11: BACKEND - SETTLEMENT SYSTEM

## 11.1 Settlement Service Layer

- [x] Create `lib/services/settlement.service.ts`
  - `processSettlements()` - Main settlement job
    - Find expired active purchases
    - For each purchase:
      - Calculate final completion %
      - Determine success/failure (70% threshold)
      - Calculate payout
      - Credit user wallet
      - Update purchase status
      - Create settlement log
  - `settlePurchase(purchaseId)` - Settle single purchase
  - `calculatePayout(purchase)` - Calculate payout amount
    - Success: Package Price + Profit - 10% commission
    - Failure: Package Price (full refund)
  - `getSettlementHistory(filters)` - Admin view

## 11.2 Settlement API Routes

- [x] Create `app/api/settlement/run/route.ts`
  - POST - Trigger settlement (cron endpoint)
  - Protected with cron secret
- [x] Create `app/api/settlement/history/route.ts`
  - GET - Settlement logs (admin)
- [x] Create `app/api/settlement/[purchaseId]/route.ts`
  - POST - Manual settlement trigger (admin)

## 11.3 Cron Configuration

- [x] Create `vercel.json` with cron configuration

```json
{
  "crons": [
    {
      "path": "/api/settlement/run",
      "schedule": "0 * * * *"
    }
  ]
}
```

- [x] Implement cron secret validation

---

# PHASE 12: BACKEND - PAYMENT INTEGRATION

## 12.1 Payment Service Layer

- [x] Create `lib/services/payment.service.ts`
  - `initializePayment(userId, amount, type)` - Start payment
  - `verifyPayment(reference)` - Verify with provider
  - `handleWebhook(payload)` - Process webhook
  - `getPaymentHistory(userId)` - Get payments

## 12.2 Payment Provider Integration

- [x] Create `lib/payment/paystack.ts`
  - Initialize transaction
  - Verify transaction
  - Webhook signature verification
- [x] Create `lib/payment/flutterwave.ts` (alternative)

## 12.3 Payment API Routes

- [x] Create `app/api/payments/initialize/route.ts`
  - POST - Initialize payment
- [x] Create `app/api/payments/verify/route.ts`
  - POST - Verify payment
- [x] Create `app/api/webhooks/paystack/route.ts`
  - POST - Paystack webhook handler

---

# PHASE 13: BACKEND - ADMIN ANALYTICS

## 13.1 Analytics Service Layer

- [x] Create `lib/services/analytics.service.ts`
  - `getDashboardStats()` - Overview statistics
  - `getRevenueAnalytics(period)` - Revenue data
  - `getUserGrowth(period)` - User registration trends
  - `getCategoryPerformance()` - Category stats
  - `getSettlementStats()` - Settlement overview
  - `getTopPerformingPackages()` - Best packages

## 13.2 Analytics API Routes

- [x] Create `app/api/admin/analytics/dashboard/route.ts`
- [x] Create `app/api/admin/analytics/revenue/route.ts`
- [x] Create `app/api/admin/analytics/users/route.ts`
- [x] Create `app/api/admin/analytics/categories/route.ts`

---

# PHASE 14: BACKEND - USER MANAGEMENT (ADMIN)

## 14.1 User Management Service

- [x] Create `lib/services/user.service.ts`
  - `getAllUsers(filters)` - List users with pagination
  - `getUserById(id)` - Get user details
  - `updateUserRole(id, role)` - Change user role
  - `suspendUser(id)` - Suspend user account
  - `getUserStats(id)` - Get user statistics

## 14.2 User Management API Routes

- [x] Create `app/api/admin/users/route.ts`
  - GET - List all users (admin)
- [x] Create `app/api/admin/users/[id]/route.ts`
  - GET - Get user details (admin)
  - PUT - Update user (admin)
  - DELETE - Suspend user (admin)

---

# PHASE 15: BACKEND - TESTING & VALIDATION

## 15.1 API Testing

- [x] Set up Jest or Vitest for testing
- [x] Create test utilities and mocks
- [ ] Write unit tests for all services:
  - [x] Wallet service tests
  - [x] Category service tests
  - [x] Package service tests
  - [x] Product service tests
  - [x] Subscription service tests
  - [x] Purchase service tests
  - [x] Sales service tests
  - [x] Settlement service tests
  - [x] Payment service tests

## 15.2 Integration Testing

- [x] Write API route integration tests
- [x] Test authentication flows
- [x] Test purchase flow end-to-end
- [x] Test settlement logic

## 15.3 Error Handling

- [x] Create centralized error handling utility
- [x] Create custom error classes
- [x] Implement error logging
- [x] Create API response helpers

---

# PHASE 16: FRONTEND - UI COMPONENTS LIBRARY

## 16.1 Install shadcn/ui Components

- [x] Button component
- [x] Input component
- [x] Card component
- [x] Dialog/Modal component
- [x] Dropdown Menu component
- [x] Select component
- [x] Table component
- [x] Tabs component
- [x] Toast/Sonner notifications
- [x] Avatar component
- [x] Badge component
- [x] Progress component
- [x] Skeleton loader component
- [x] Alert component
- [x] Form component
- [x] Calendar component
- [x] Sheet (slide-out panel) component

## 16.2 Custom UI Components

- [x] Create `components/ui/data-table.tsx` - Reusable data table
- [x] Create `components/ui/page-header.tsx` - Page headers
- [x] Create `components/ui/stat-card.tsx` - Statistics cards
- [x] Create `components/ui/empty-state.tsx` - Empty state displays
- [x] Create `components/ui/loading-state.tsx` - Loading states
- [x] Create `components/ui/error-state.tsx` - Error displays
- [x] Create `components/ui/confirm-dialog.tsx` - Confirmation modals
- [x] Create `components/ui/search-input.tsx` - Search with debounce
- [x] Create `components/ui/currency-display.tsx` - Format currency

---

# PHASE 17: FRONTEND - LAYOUT COMPONENTS

## 17.1 Authentication Layout

- [x] Create `app/(auth)/layout.tsx` - Auth pages layout
- [x] Create auth page wrapper with branding
- [x] Add decorative elements/illustrations

## 17.2 Dashboard Layout

- [x] Create `components/layout/sidebar.tsx` - Main navigation
  - User sidebar navigation items
  - Admin sidebar navigation items
  - Active state indicators
  - Collapsible functionality
- [x] Create `components/layout/header.tsx` - Top header
  - User profile dropdown
  - Notifications indicator
  - Mobile menu toggle
- [x] Create `components/layout/mobile-nav.tsx` - Mobile navigation
- [x] Create `app/(dashboard)/layout.tsx` - Dashboard layout wrapper

## 17.3 Navigation Configuration

- [x] Create `lib/navigation.ts` - Navigation items config
  - User navigation items
  - Admin navigation items
  - Icon mappings

---

# PHASE 18: FRONTEND - AUTHENTICATION PAGES

## 18.1 Login Page

- [x] Create `app/(auth)/login/page.tsx`
  - Email/password form
  - Form validation with Zod
  - Error handling and display
  - Loading states
  - Link to registration
  - Beautiful gradient background

## 18.2 Registration Page

- [x] Create `app/(auth)/register/page.tsx`
  - Full name, email, phone, password fields
  - Password strength indicator
  - Terms acceptance checkbox
  - Form validation
  - Success redirect to login

## 18.3 Auth Components

- [x] Create `components/auth/login-form.tsx`
- [x] Create `components/auth/register-form.tsx`
- [x] Create `components/auth/social-auth.tsx` (optional)
- [x] Create `components/auth/auth-card.tsx`

---

# PHASE 19: FRONTEND - LANDING PAGE

## 19.1 Landing Page Design

- [x] Create `app/page.tsx` - Main landing page
- [x] Hero section with CTA
- [x] How it works section (3-4 steps)
- [x] Features section with icons
- [ ] Testimonials/social proof (optional)
- [x] FAQ section
- [x] Footer with links

## 19.2 Landing Page Components

- [x] Create `components/landing/hero.tsx`
- [x] Create `components/landing/features.tsx`
- [x] Create `components/landing/how-it-works.tsx`
- [x] Create `components/landing/cta-section.tsx`
- [x] Create `components/landing/footer.tsx`

---

# PHASE 20: FRONTEND - USER DASHBOARD

## 20.1 Dashboard Overview

- [x] Create `app/(dashboard)/user/dashboard/page.tsx`
- [x] Wallet balance card with deposit button
- [x] Active packages summary
- [x] Recent transactions
- [x] Performance chart (earnings over time)
- [x] Quick actions section

## 20.2 Dashboard Components

- [x] Create `components/dashboard/wallet-card.tsx`
- [x] Create `components/dashboard/active-packages-card.tsx`
- [x] Create `components/dashboard/recent-transactions.tsx`
- [x] Create `components/dashboard/earnings-chart.tsx`
- [x] Create `components/dashboard/quick-actions.tsx`

---

# PHASE 21: FRONTEND - USER WALLET

## 21.1 Wallet Page

- [x] Create `app/(dashboard)/user/wallet/page.tsx`
- [x] Current balance display (prominent)
- [x] Deposit button with modal
- [x] Withdraw button with modal
- [x] Transaction history table
- [x] Transaction filters (type, date range)
- [x] Export transactions (optional)

## 21.2 Wallet Components

- [x] Create `components/wallet/balance-display.tsx`
- [x] Create `components/wallet/deposit-modal.tsx`
- [x] Create `components/wallet/withdraw-modal.tsx`
- [x] Create `components/wallet/transaction-table.tsx`
- [x] Create `components/wallet/transaction-row.tsx`

---

# PHASE 22: FRONTEND - CATEGORY & SUBSCRIPTION

## 22.1 Categories Listing

- [x] Create `app/(dashboard)/user/subscriptions/page.tsx`
- [x] Display available categories as cards
- [x] Show subscription status per category
- [x] Subscribe button for unsubscribed
- [x] Price and package count per category

## 22.2 Subscription Components

- [x] Create `components/subscriptions/category-card.tsx`
- [x] Create `components/subscriptions/subscribe-modal.tsx`
- [x] Create `components/subscriptions/subscription-badge.tsx`
- [x] Create `components/subscriptions/my-subscriptions.tsx`

---

# PHASE 23: FRONTEND - PACKAGES BROWSING

## 23.1 Packages Listing

- [x] Create `app/(dashboard)/user/packages/page.tsx`
- [x] Package grid/list view toggle
- [x] Filter by category
- [x] Search packages
- [x] Package cards with key info

## 23.2 Package Details

- [x] Create `app/(dashboard)/user/packages/[id]/page.tsx`
- [x] Package information display
- [x] Products list with quantities
- [x] Total cost and expected profit
- [x] Purchase button
- [x] Subscription requirement check

## 23.3 Package Components

- [x] Create `components/packages/package-card.tsx`
- [x] Create `components/packages/package-grid.tsx`
- [x] Create `components/packages/package-details.tsx`
- [x] Create `components/packages/product-list.tsx`
- [x] Create `components/packages/purchase-modal.tsx`
- [x] Create `components/packages/profit-calculator.tsx`

---

# PHASE 24: FRONTEND - USER PURCHASES & PROGRESS

## 24.1 My Purchases Page

- [x] Create `app/(dashboard)/user/purchases/page.tsx`
- [x] Active purchases section
- [x] Completed purchases section
- [x] Purchase status badges
- [x] Time remaining countdown

## 24.2 Purchase Details Page

- [x] Create `app/(dashboard)/user/purchases/[id]/page.tsx`
- [x] Package info summary
- [x] Overall completion progress bar
- [x] Per-product progress breakdown
- [x] Time remaining countdown (prominent)
- [x] Expected payout calculation
- [x] Status indicator

## 24.3 Purchase Components

- [x] Create `components/purchases/purchase-card.tsx`
- [x] Create `components/purchases/progress-bar.tsx`
- [x] Create `components/purchases/countdown-timer.tsx`
- [x] Create `components/purchases/product-progress-table.tsx`
- [x] Create `components/purchases/payout-preview.tsx`

---

# PHASE 25: FRONTEND - USER SETTINGS

## 25.1 Settings Page

- [x] Create `app/(dashboard)/user/settings/page.tsx`
- [x] Profile information section
- [x] Change password section
- [x] Notification preferences (optional)
- [x] Account actions

## 25.2 Settings Components

- [x] Create `components/settings/profile-form.tsx`
- [x] Create `components/settings/password-form.tsx`
- [x] Create `components/settings/notification-settings.tsx`

---

# PHASE 26: FRONTEND - ADMIN DASHBOARD

## 26.1 Admin Dashboard Overview

- [x] Create `app/(dashboard)/admin/dashboard/page.tsx`
- [x] Total revenue card
- [x] Total users card
- [x] Active packages card
- [x] Pending settlements card
- [x] Revenue chart (line/area)
- [x] Recent activity feed
- [x] Top performing categories

## 26.2 Admin Dashboard Components

- [x] Create `components/admin/stats-overview.tsx`
- [x] Create `components/admin/revenue-chart.tsx`
- [x] Create `components/admin/activity-feed.tsx`
- [x] Create `components/admin/category-performance.tsx`

---

# PHASE 27: FRONTEND - ADMIN CATEGORY MANAGEMENT

## 27.1 Categories Management Page

- [x] Create `app/(dashboard)/admin/categories/page.tsx`
- [x] Categories data table
- [x] Add category button
- [x] Edit/Delete actions
- [x] Status toggle

## 27.2 Category Form

- [x] Create `app/(dashboard)/admin/categories/new/page.tsx`
- [x] Create `app/(dashboard)/admin/categories/[id]/edit/page.tsx`
- [x] Category form with validation

## 27.3 Category Components

- [x] Create `components/admin/categories/category-table.tsx`
- [x] Create `components/admin/categories/category-form.tsx`
- [x] Create `components/admin/categories/category-actions.tsx`

---

# PHASE 28: FRONTEND - ADMIN PACKAGE MANAGEMENT

## 28.1 Packages Management Page

- [x] Create `app/(dashboard)/admin/packages/page.tsx`
- [x] Packages data table
- [x] Filter by category
- [x] Add package button
- [x] Edit/Delete actions

## 28.2 Package Form

- [x] Create `app/(dashboard)/admin/packages/new/page.tsx`
- [x] Create `app/(dashboard)/admin/packages/[id]/edit/page.tsx`
- [x] Package form with category selection
- [x] Products management within package

## 28.3 Package Components

- [x] Create `components/admin/packages/package-table.tsx`
- [x] Create `components/admin/packages/package-form.tsx`
- [x] Create `components/admin/packages/product-manager.tsx`

---

# PHASE 29: FRONTEND - ADMIN SALES MANAGEMENT

## 29.1 Sales Tracking Page

- [x] Create `app/(dashboard)/admin/sales/page.tsx`
- [x] Active purchases list (in selling window)
- [x] Search by user/package
- [x] Update sales progress interface
- [x] Bulk update capability

## 29.2 Sales Update Interface

- [x] Create `app/(dashboard)/admin/sales/[purchaseId]/page.tsx`
- [x] Purchase details display
- [x] Per-product sales update form
- [x] Real-time completion calculation
- [x] Save progress button

## 29.3 Sales Components

- [x] Create `components/admin/sales/active-sales-table.tsx`
- [x] Create `components/admin/sales/sales-update-form.tsx`
- [x] Create `components/admin/sales/progress-indicator.tsx`

---

# PHASE 30: FRONTEND - ADMIN USER MANAGEMENT

## 30.1 Users Management Page

- [x] Create `app/(dashboard)/admin/users/page.tsx`
- [x] Users data table with search
- [x] Filter by role
- [x] View user details
- [x] Change user role
- [x] User statistics

## 30.2 User Details

- [x] Create `app/(dashboard)/admin/users/[id]/page.tsx`
- [x] User profile information
- [x] User wallet info
- [x] User subscriptions
- [x] User purchases history
- [x] User activity log

## 30.3 User Components

- [x] Create `components/admin/users/users-table.tsx`
- [x] Create `components/admin/users/user-details.tsx`
- [x] Create `components/admin/users/user-actions.tsx`

---

# PHASE 31: FRONTEND - ADMIN SETTLEMENTS

## 31.1 Settlements Page

- [x] Create `app/(dashboard)/admin/settlements/page.tsx`
- [x] Pending settlements queue
- [x] Settlement history table
- [x] Manual settlement trigger
- [x] Settlement statistics

## 31.2 Settlement Components

- [x] Create `components/admin/settlements/pending-settlements.tsx`
- [x] Create `components/admin/settlements/settlement-history.tsx`
- [x] Create `components/admin/settlements/settlement-stats.tsx`

---

# PHASE 32: FRONTEND - CHARTS & DATA VISUALIZATION

## 32.1 Chart Components

- [x] Create `components/charts/line-chart.tsx` - Revenue trends
- [x] Create `components/charts/bar-chart.tsx` - Category comparison
- [x] Create `components/charts/pie-chart.tsx` - Distribution
- [x] Create `components/charts/area-chart.tsx` - Growth trends
- [x] Create `components/charts/progress-ring.tsx` - Circular progress

## 32.2 Dashboard Charts Integration

- [x] Integrate charts into user dashboard
- [x] Integrate charts into admin dashboard
- [x] Add chart loading states
- [x] Add empty state for no data

---

# PHASE 33: FRONTEND - STATE MANAGEMENT

## 33.1 Zustand Store Setup

- [x] Install Zustand
- [x] Create `stores/auth-store.ts` - Auth state
- [x] Create `stores/wallet-store.ts` - Wallet state
- [x] Create `stores/ui-store.ts` - UI state (sidebar, modals)

## 33.2 React Query Setup

- [x] Install TanStack Query
- [x] Create query client configuration
- [x] Create custom hooks for API calls:
  - [x] `hooks/use-categories.ts`
  - [x] `hooks/use-packages.ts`
  - [x] `hooks/use-purchases.ts`
  - [x] `hooks/use-wallet.ts`
  - [x] `hooks/use-subscriptions.ts`
  - [x] `hooks/use-admin-stats.ts`

---

# PHASE 34: FRONTEND - NOTIFICATIONS & FEEDBACK

## 34.1 Toast Notifications

- [x] Install Sonner or React Hot Toast
- [x] Configure toast provider
- [x] Create toast utility functions
- [x] Implement success/error/info toasts

## 34.2 Loading States

- [x] Create page-level loading skeletons
- [x] Create component-level loading states
- [x] Add loading spinners for actions
- [x] Implement optimistic updates

## 34.3 Error Handling

- [x] Create error boundary component
- [x] Create error page (`app/error.tsx`)
- [x] Create not found page (`app/not-found.tsx`)
- [x] Implement graceful error recovery

---

# PHASE 35: FRONTEND - RESPONSIVE DESIGN

## 35.1 Mobile Optimization

- [x] Test and optimize all pages for mobile
- [x] Ensure touch-friendly button sizes
- [x] Optimize tables for mobile (horizontal scroll/cards)
- [x] Test navigation on mobile
- [x] Verify modal behavior on mobile

## 35.2 Tablet Optimization

- [x] Test and adjust layouts for tablet
- [x] Ensure sidebar behavior on tablet
- [x] Optimize grid layouts

---

# PHASE 36: PERFORMANCE OPTIMIZATION

## 36.1 Next.js Optimizations

- [x] Implement proper Server Components usage
- [x] Use Suspense boundaries appropriately
- [x] Implement streaming where beneficial
- [x] Optimize images with next/image
- [x] Implement proper caching strategies

## 36.2 Bundle Optimization

- [x] Analyze bundle with @next/bundle-analyzer
- [x] Implement code splitting
- [x] Lazy load heavy components
- [x] Optimize third-party imports

## 36.3 Database Optimization (MongoDB)

- [x] Create compound indexes for complex queries
- [x] Implement MongoDB aggregation pipelines for analytics
- [x] Optimize queries with proper projections
- [x] Configure connection pooling

---

# PHASE 37: SECURITY HARDENING

## 37.1 Security Implementation

- [x] Implement rate limiting on API routes
- [x] Add CSRF protection
- [x] Implement input sanitization
- [x] Add NoSQL injection prevention
- [x] Secure headers configuration
- [x] Environment variables security audit

## 37.2 Authentication Security

- [x] Password hashing with bcrypt (10+ rounds)
- [x] Session management security
- [x] Implement account lockout after failed attempts
- [x] Add audit logging for sensitive actions

---

# PHASE 38: TESTING & QUALITY ASSURANCE

## 38.1 Frontend Testing

- [ ] Set up React Testing Library
- [ ] Write component tests
- [ ] Write integration tests for key flows
- [ ] Test form validations

## 38.2 End-to-End Testing

- [ ] Set up Playwright or Cypress
- [ ] Write E2E tests for:
  - [ ] Authentication flow
  - [ ] Purchase flow
  - [ ] Admin category management
  - [ ] Admin sales update

## 38.3 Manual Testing

- [ ] Test complete user journey
- [ ] Test admin workflows
- [ ] Cross-browser testing
- [ ] Mobile device testing

---

# PHASE 39: DEPLOYMENT PREPARATION

## 39.1 Environment Configuration

- [ ] Set up production environment variables
- [ ] Configure MongoDB Atlas production cluster
- [ ] Enable MongoDB Atlas backup and monitoring
- [ ] Set up Redis for production (if used)
- [ ] Configure payment provider production keys

## 39.2 Vercel Deployment

- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Configure cron jobs
- [ ] Set up custom domain

## 39.3 Database Setup (Production)

- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Set up database user for production
- [ ] Enable MongoDB Atlas monitoring
- [ ] Run seed for production admin user
- [ ] Verify database connectivity

---

# PHASE 40: POST-LAUNCH

## 40.1 Monitoring Setup

- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics (Vercel Analytics/Plausible)
- [ ] Configure uptime monitoring
- [ ] Set up MongoDB Atlas alerts

## 40.2 Documentation

- [ ] API documentation
- [ ] User guide
- [ ] Admin guide
- [ ] Deployment documentation

---

# PROJECT SUMMARY

## Key Business Rules Implemented

1. **Subscription Required** - Users must subscribe to category before purchasing packages
2. **Wallet System** - All transactions go through user wallet
3. **7-Day Selling Window** - Fixed period for sales tracking
4. **70% Success Threshold** - Determines settlement outcome
5. **Capital Protection** - Failed sales refund full package price
6. **10% Commission** - Platform takes commission only on successful sales
7. **No Updates After Window** - Sales cannot be modified after selling window closes

## Database Models (MongoDB)

- User, Wallet, WalletTransaction
- Category, Subscription
- Package, Product
- PackagePurchase, ProductSalesRecord
- SettlementLog, PaymentTransaction

## MongoDB-Specific Considerations

- All IDs use ObjectId (`@db.ObjectId`)
- References between documents use ObjectId
- Decimal values stored as Float
- Indexes configured for query optimization
- Use `db push` instead of migrations (MongoDB)

## User Flows

1. Register → Fund Wallet → Subscribe → Purchase Package → Track Progress → Receive Settlement
2. Admin: Manage Categories → Create Packages → Add Products → Update Sales → View Settlements

---

## Progress Tracking

| Phase    | Description                               | Status      |
| -------- | ----------------------------------------- | ----------- |
| Phase 1  | Project Setup & Configuration             | In Progress |
| Phase 2  | Database Design & Prisma Schema (MongoDB) | In Progress |
| Phase 3  | Authentication System                     | Completed   |
| Phase 4  | Wallet System                             | Completed   |
| Phase 5  | Category Management                       | Completed   |
| Phase 6  | Package Management                        | Completed   |
| Phase 7  | Product Management                        | Completed   |
| Phase 8  | Subscription System                       | Completed   |
| Phase 9  | Purchase System                           | Completed   |
| Phase 10 | Sales Tracking System                     | Completed   |
| Phase 11 | Settlement System                         | Completed   |
| Phase 12 | Payment Integration                       | Completed   |
| Phase 13 | Admin Analytics                           | Completed   |
| Phase 14 | User Management (Admin)                   | Completed   |
| Phase 15 | Backend Testing                           | Completed   |
| Phase 16 | UI Components Library                     | Completed   |
| Phase 17 | Layout Components                         | Completed   |
| Phase 18 | Authentication Pages                      | Completed   |
| Phase 19 | Landing Page                              | Completed   |
| Phase 20 | User Dashboard                            | Completed   |
| Phase 21 | User Wallet                               | Completed   |
| Phase 22 | Category & Subscription                   | Completed   |
| Phase 23 | Packages Browsing                         | Completed   |
| Phase 24 | User Purchases & Progress                 | Completed   |
| Phase 25 | User Settings                             | Completed   |
| Phase 26 | Admin Dashboard                           | Completed   |
| Phase 27 | Admin Category Management                 | Completed   |
| Phase 28 | Admin Package Management                  | Completed   |
| Phase 29 | Admin Sales Management                    | Completed   |
| Phase 30 | Admin User Management                     | Completed   |
| Phase 31 | Admin Settlements                         | Completed   |
| Phase 32 | Charts & Data Visualization               | Completed   |
| Phase 33 | State Management                          | Completed   |
| Phase 34 | Notifications & Feedback                  | Completed   |
| Phase 35 | Responsive Design                         | Completed   |
| Phase 36 | Performance Optimization                  | Completed   |
| Phase 37 | Security Hardening                        | Completed   |
| Phase 38 | Testing & QA                              | Not Started |
| Phase 39 | Deployment Preparation                    | Not Started |
| Phase 40 | Post-Launch                               | Not Started |

---

**Last Updated:** 2026-03-22

**Development Rules:**

1. Complete Phases 1-15 (Backend) before starting Phase 16+ (Frontend).
2. After completing each phase, immediately update this development plan before starting the next phase.
3. A phase is not considered complete until its status and completed checklist items are updated in this document.
