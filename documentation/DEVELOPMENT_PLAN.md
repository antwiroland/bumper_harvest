# Bamper Harvest - Full Stack Development Plan

## Project Overview

A **Package Category Sales Platform** built with Next.js 15 (App Router) that enables users to subscribe to package categories, purchase packages, and earn profits from company-managed product sales. The platform guarantees capital protection and earns 10% commission on successful sales.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | MongoDB Atlas |
| ORM | Prisma (MongoDB Connector) |
| Authentication | NextAuth.js v5 (Auth.js) |
| Validation | Zod |
| Charts | Recharts |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| Payments | Paystack/Flutterwave |
| Cron Jobs | Vercel Cron |
| Caching | Redis (optional) |

---

## Development Phases

> **Rule**: Backend must be 100% complete before starting Frontend development.

---

# PHASE 1: PROJECT SETUP & CONFIGURATION ✅ COMPLETED

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
- [ ] Create MongoDB Atlas account and cluster (User task - pending)
- [ ] Create database user with read/write permissions (User task - pending)
- [ ] Get MongoDB connection string (User task - pending)
- [x] Configure MongoDB connection in `.env`
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

- [x] Install and configure shadcn/ui
  ```bash
  npx shadcn@latest init
  ```
- [x] Configure Tailwind CSS with custom theme colors
- [x] Set up custom fonts (Inter or similar)
- [x] Install Lucide React icons
- [x] Install Recharts for data visualization

---

# PHASE 2: DATABASE DESIGN & PRISMA SCHEMA (MongoDB) ✅ COMPLETED

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

- [ ] Push schema to MongoDB (Pending: requires MongoDB Atlas connection)
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
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

# PHASE 3: BACKEND - AUTHENTICATION SYSTEM

## 3.1 NextAuth.js Configuration

- [ ] Install NextAuth.js v5
  ```bash
  npm install next-auth@beta @auth/prisma-adapter
  ```
- [ ] Create `src/lib/auth.ts` configuration file
- [ ] Configure Credentials provider with password hashing
- [ ] Set up Prisma adapter for MongoDB session/account storage
- [ ] Configure JWT strategy with role claim
- [ ] Create auth types extension for User/Session

## 3.2 Authentication API Routes

- [ ] Create `app/api/auth/[...nextauth]/route.ts`
- [ ] Create `app/api/auth/register/route.ts` - User registration endpoint
  - Validate input with Zod
  - Hash password with bcrypt
  - Create user with wallet
  - Return success response
- [ ] Create password hashing utility (`lib/password.ts`)
- [ ] Add email validation utility

## 3.3 Authentication Middleware

- [ ] Create `src/middleware.ts` for route protection
- [ ] Configure protected routes patterns
- [ ] Implement role-based access control (ADMIN/USER)
- [ ] Handle redirect logic for unauthenticated users

## 3.4 Auth Utilities

- [ ] Create `lib/auth-utils.ts` with helper functions:
  - `getCurrentUser()` - Get current session user
  - `requireAuth()` - Throw if not authenticated
  - `requireAdmin()` - Throw if not admin
  - `requireUser()` - Throw if not regular user

---

# PHASE 4: BACKEND - WALLET SYSTEM

## 4.1 Wallet Service Layer

- [ ] Create `lib/services/wallet.service.ts`
  - `getWallet(userId)` - Get user wallet
  - `getBalance(userId)` - Get wallet balance
  - `credit(userId, amount, description)` - Add funds
  - `debit(userId, amount, description)` - Remove funds
  - `getTransactions(userId, pagination)` - Get transaction history
  - `hasSufficientBalance(userId, amount)` - Check balance

## 4.2 Wallet API Routes

- [ ] Create `app/api/wallet/route.ts` - GET wallet details
- [ ] Create `app/api/wallet/transactions/route.ts` - GET transactions
- [ ] Create `app/api/wallet/deposit/route.ts` - POST initiate deposit
- [ ] Create `app/api/wallet/withdraw/route.ts` - POST request withdrawal

## 4.3 Wallet Validation Schemas

- [ ] Create `lib/validations/wallet.ts`
  - Deposit schema (amount validation)
  - Withdrawal schema (amount, account details)
  - Transaction query schema (pagination, filters)

---

# PHASE 5: BACKEND - CATEGORY MANAGEMENT

## 5.1 Category Service Layer

- [ ] Create `lib/services/category.service.ts`
  - `getAllCategories()` - List all categories
  - `getActiveCategories()` - List active categories
  - `getCategoryById(id)` - Get single category
  - `createCategory(data)` - Create new category
  - `updateCategory(id, data)` - Update category
  - `toggleCategoryStatus(id)` - Activate/deactivate
  - `deleteCategory(id)` - Soft delete category
  - `getCategoryWithPackages(id)` - Get with related packages

## 5.2 Category API Routes

- [ ] Create `app/api/categories/route.ts`
  - GET - List categories (public: active only, admin: all)
  - POST - Create category (admin only)
- [ ] Create `app/api/categories/[id]/route.ts`
  - GET - Get single category
  - PUT - Update category (admin)
  - DELETE - Delete category (admin)
- [ ] Create `app/api/categories/[id]/packages/route.ts`
  - GET - Get packages in category

## 5.3 Category Validation Schemas

- [ ] Create `lib/validations/category.ts`
  - Create category schema
  - Update category schema
  - Query params schema

---

# PHASE 6: BACKEND - PACKAGE MANAGEMENT

## 6.1 Package Service Layer

- [ ] Create `lib/services/package.service.ts`
  - `getAllPackages()` - List all packages
  - `getPackagesByCategory(categoryId)` - Filter by category
  - `getPackageById(id)` - Get single package
  - `getPackageWithProducts(id)` - Get with products
  - `createPackage(data)` - Create package
  - `updatePackage(id, data)` - Update package
  - `deletePackage(id)` - Delete package
  - `calculatePackageMetrics(id)` - Total cost, profit

## 6.2 Package API Routes

- [ ] Create `app/api/packages/route.ts`
  - GET - List packages (with filters)
  - POST - Create package (admin)
- [ ] Create `app/api/packages/[id]/route.ts`
  - GET - Get package details
  - PUT - Update package (admin)
  - DELETE - Delete package (admin)
- [ ] Create `app/api/packages/[id]/products/route.ts`
  - GET - Get products in package
  - POST - Add product to package (admin)

## 6.3 Package Validation Schemas

- [ ] Create `lib/validations/package.ts`
  - Create package schema
  - Update package schema

---

# PHASE 7: BACKEND - PRODUCT MANAGEMENT

## 7.1 Product Service Layer

- [ ] Create `lib/services/product.service.ts`
  - `getProductsByPackage(packageId)` - List products
  - `getProductById(id)` - Get single product
  - `createProduct(data)` - Create product
  - `updateProduct(id, data)` - Update product
  - `deleteProduct(id)` - Delete product
  - `calculateProductProfit(product)` - Calculate profit

## 7.2 Product API Routes

- [ ] Create `app/api/products/route.ts`
  - GET - List products (with filters)
  - POST - Create product (admin)
- [ ] Create `app/api/products/[id]/route.ts`
  - GET - Get product details
  - PUT - Update product (admin)
  - DELETE - Delete product (admin)

## 7.3 Product Validation Schemas

- [ ] Create `lib/validations/product.ts`
  - Create product schema
  - Update product schema

---

# PHASE 8: BACKEND - SUBSCRIPTION SYSTEM

## 8.1 Subscription Service Layer

- [ ] Create `lib/services/subscription.service.ts`
  - `getUserSubscriptions(userId)` - Get user's subscriptions
  - `hasActiveSubscription(userId, categoryId)` - Check status
  - `createSubscription(userId, categoryId)` - New subscription
  - `cancelSubscription(id)` - Cancel subscription
  - `getSubscriptionsByCategory(categoryId)` - Admin view
  - `checkSubscriptionValidity(userId, categoryId)` - Validate

## 8.2 Subscription API Routes

- [ ] Create `app/api/subscriptions/route.ts`
  - GET - List user subscriptions
  - POST - Subscribe to category
- [ ] Create `app/api/subscriptions/[id]/route.ts`
  - GET - Get subscription details
  - DELETE - Cancel subscription
- [ ] Create `app/api/subscriptions/check/route.ts`
  - POST - Check if user can access category

## 8.3 Subscription Validation

- [ ] Create `lib/validations/subscription.ts`
  - Subscribe schema
  - Check subscription schema

---

# PHASE 9: BACKEND - PURCHASE SYSTEM

## 9.1 Purchase Service Layer

- [ ] Create `lib/services/purchase.service.ts`
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

- [ ] Create `app/api/purchases/route.ts`
  - GET - List purchases (user: own, admin: all)
  - POST - Create new purchase
- [ ] Create `app/api/purchases/[id]/route.ts`
  - GET - Get purchase details with progress
- [ ] Create `app/api/purchases/[id]/progress/route.ts`
  - GET - Get detailed progress with products

## 9.3 Purchase Validation

- [ ] Create `lib/validations/purchase.ts`
  - Create purchase schema
  - Query params schema

---

# PHASE 10: BACKEND - SALES TRACKING SYSTEM

## 10.1 Sales Service Layer

- [ ] Create `lib/services/sales.service.ts`
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

- [ ] Create `app/api/sales/route.ts`
  - GET - Get sales records (admin)
- [ ] Create `app/api/sales/[purchaseId]/route.ts`
  - GET - Get sales for specific purchase
  - PUT - Update sales progress (admin only)
- [ ] Create `app/api/sales/[purchaseId]/[productId]/route.ts`
  - PUT - Update specific product sales (admin)

## 10.3 Sales Validation

- [ ] Create `lib/validations/sales.ts`
  - Update sales schema
  - Bulk update schema

---

# PHASE 11: BACKEND - SETTLEMENT SYSTEM

## 11.1 Settlement Service Layer

- [ ] Create `lib/services/settlement.service.ts`
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

- [ ] Create `app/api/settlement/run/route.ts`
  - POST - Trigger settlement (cron endpoint)
  - Protected with cron secret
- [ ] Create `app/api/settlement/history/route.ts`
  - GET - Settlement logs (admin)
- [ ] Create `app/api/settlement/[purchaseId]/route.ts`
  - POST - Manual settlement trigger (admin)

## 11.3 Cron Configuration

- [ ] Create `vercel.json` with cron configuration
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
- [ ] Implement cron secret validation

---

# PHASE 12: BACKEND - PAYMENT INTEGRATION

## 12.1 Payment Service Layer

- [ ] Create `lib/services/payment.service.ts`
  - `initializePayment(userId, amount, type)` - Start payment
  - `verifyPayment(reference)` - Verify with provider
  - `handleWebhook(payload)` - Process webhook
  - `getPaymentHistory(userId)` - Get payments

## 12.2 Payment Provider Integration

- [ ] Create `lib/payment/paystack.ts`
  - Initialize transaction
  - Verify transaction
  - Webhook signature verification
- [ ] Create `lib/payment/flutterwave.ts` (alternative)

## 12.3 Payment API Routes

- [ ] Create `app/api/payments/initialize/route.ts`
  - POST - Initialize payment
- [ ] Create `app/api/payments/verify/route.ts`
  - POST - Verify payment
- [ ] Create `app/api/webhooks/paystack/route.ts`
  - POST - Paystack webhook handler

---

# PHASE 13: BACKEND - ADMIN ANALYTICS

## 13.1 Analytics Service Layer

- [ ] Create `lib/services/analytics.service.ts`
  - `getDashboardStats()` - Overview statistics
  - `getRevenueAnalytics(period)` - Revenue data
  - `getUserGrowth(period)` - User registration trends
  - `getCategoryPerformance()` - Category stats
  - `getSettlementStats()` - Settlement overview
  - `getTopPerformingPackages()` - Best packages

## 13.2 Analytics API Routes

- [ ] Create `app/api/admin/analytics/dashboard/route.ts`
- [ ] Create `app/api/admin/analytics/revenue/route.ts`
- [ ] Create `app/api/admin/analytics/users/route.ts`
- [ ] Create `app/api/admin/analytics/categories/route.ts`

---

# PHASE 14: BACKEND - USER MANAGEMENT (ADMIN)

## 14.1 User Management Service

- [ ] Create `lib/services/user.service.ts`
  - `getAllUsers(filters)` - List users with pagination
  - `getUserById(id)` - Get user details
  - `updateUserRole(id, role)` - Change user role
  - `suspendUser(id)` - Suspend user account
  - `getUserStats(id)` - Get user statistics

## 14.2 User Management API Routes

- [ ] Create `app/api/admin/users/route.ts`
  - GET - List all users (admin)
- [ ] Create `app/api/admin/users/[id]/route.ts`
  - GET - Get user details (admin)
  - PUT - Update user (admin)
  - DELETE - Suspend user (admin)

---

# PHASE 15: BACKEND - TESTING & VALIDATION

## 15.1 API Testing

- [ ] Set up Jest or Vitest for testing
- [ ] Create test utilities and mocks
- [ ] Write unit tests for all services:
  - [ ] Wallet service tests
  - [ ] Category service tests
  - [ ] Package service tests
  - [ ] Product service tests
  - [ ] Subscription service tests
  - [ ] Purchase service tests
  - [ ] Sales service tests
  - [ ] Settlement service tests
  - [ ] Payment service tests

## 15.2 Integration Testing

- [ ] Write API route integration tests
- [ ] Test authentication flows
- [ ] Test purchase flow end-to-end
- [ ] Test settlement logic

## 15.3 Error Handling

- [ ] Create centralized error handling utility
- [ ] Create custom error classes
- [ ] Implement error logging
- [ ] Create API response helpers

---

# PHASE 16: FRONTEND - UI COMPONENTS LIBRARY

## 16.1 Install shadcn/ui Components

- [ ] Button component
- [ ] Input component
- [ ] Card component
- [ ] Dialog/Modal component
- [ ] Dropdown Menu component
- [ ] Select component
- [ ] Table component
- [ ] Tabs component
- [ ] Toast/Sonner notifications
- [ ] Avatar component
- [ ] Badge component
- [ ] Progress component
- [ ] Skeleton loader component
- [ ] Alert component
- [ ] Form component
- [ ] Calendar component
- [ ] Sheet (slide-out panel) component

## 16.2 Custom UI Components

- [ ] Create `components/ui/data-table.tsx` - Reusable data table
- [ ] Create `components/ui/page-header.tsx` - Page headers
- [ ] Create `components/ui/stat-card.tsx` - Statistics cards
- [ ] Create `components/ui/empty-state.tsx` - Empty state displays
- [ ] Create `components/ui/loading-state.tsx` - Loading states
- [ ] Create `components/ui/error-state.tsx` - Error displays
- [ ] Create `components/ui/confirm-dialog.tsx` - Confirmation modals
- [ ] Create `components/ui/search-input.tsx` - Search with debounce
- [ ] Create `components/ui/currency-display.tsx` - Format currency

---

# PHASE 17: FRONTEND - LAYOUT COMPONENTS

## 17.1 Authentication Layout

- [ ] Create `app/(auth)/layout.tsx` - Auth pages layout
- [ ] Create auth page wrapper with branding
- [ ] Add decorative elements/illustrations

## 17.2 Dashboard Layout

- [ ] Create `components/layout/sidebar.tsx` - Main navigation
  - User sidebar navigation items
  - Admin sidebar navigation items
  - Active state indicators
  - Collapsible functionality
- [ ] Create `components/layout/header.tsx` - Top header
  - User profile dropdown
  - Notifications indicator
  - Mobile menu toggle
- [ ] Create `components/layout/mobile-nav.tsx` - Mobile navigation
- [ ] Create `app/(dashboard)/layout.tsx` - Dashboard layout wrapper

## 17.3 Navigation Configuration

- [ ] Create `lib/navigation.ts` - Navigation items config
  - User navigation items
  - Admin navigation items
  - Icon mappings

---

# PHASE 18: FRONTEND - AUTHENTICATION PAGES

## 18.1 Login Page

- [ ] Create `app/(auth)/login/page.tsx`
  - Email/password form
  - Form validation with Zod
  - Error handling and display
  - Loading states
  - Link to registration
  - Beautiful gradient background

## 18.2 Registration Page

- [ ] Create `app/(auth)/register/page.tsx`
  - Full name, email, phone, password fields
  - Password strength indicator
  - Terms acceptance checkbox
  - Form validation
  - Success redirect to login

## 18.3 Auth Components

- [ ] Create `components/auth/login-form.tsx`
- [ ] Create `components/auth/register-form.tsx`
- [ ] Create `components/auth/social-auth.tsx` (optional)
- [ ] Create `components/auth/auth-card.tsx`

---

# PHASE 19: FRONTEND - LANDING PAGE

## 19.1 Landing Page Design

- [ ] Create `app/page.tsx` - Main landing page
- [ ] Hero section with CTA
- [ ] How it works section (3-4 steps)
- [ ] Features section with icons
- [ ] Testimonials/social proof (optional)
- [ ] FAQ section
- [ ] Footer with links

## 19.2 Landing Page Components

- [ ] Create `components/landing/hero.tsx`
- [ ] Create `components/landing/features.tsx`
- [ ] Create `components/landing/how-it-works.tsx`
- [ ] Create `components/landing/cta-section.tsx`
- [ ] Create `components/landing/footer.tsx`

---

# PHASE 20: FRONTEND - USER DASHBOARD

## 20.1 Dashboard Overview

- [ ] Create `app/(dashboard)/user/dashboard/page.tsx`
- [ ] Wallet balance card with deposit button
- [ ] Active packages summary
- [ ] Recent transactions
- [ ] Performance chart (earnings over time)
- [ ] Quick actions section

## 20.2 Dashboard Components

- [ ] Create `components/dashboard/wallet-card.tsx`
- [ ] Create `components/dashboard/active-packages-card.tsx`
- [ ] Create `components/dashboard/recent-transactions.tsx`
- [ ] Create `components/dashboard/earnings-chart.tsx`
- [ ] Create `components/dashboard/quick-actions.tsx`

---

# PHASE 21: FRONTEND - USER WALLET

## 21.1 Wallet Page

- [ ] Create `app/(dashboard)/user/wallet/page.tsx`
- [ ] Current balance display (prominent)
- [ ] Deposit button with modal
- [ ] Withdraw button with modal
- [ ] Transaction history table
- [ ] Transaction filters (type, date range)
- [ ] Export transactions (optional)

## 21.2 Wallet Components

- [ ] Create `components/wallet/balance-display.tsx`
- [ ] Create `components/wallet/deposit-modal.tsx`
- [ ] Create `components/wallet/withdraw-modal.tsx`
- [ ] Create `components/wallet/transaction-table.tsx`
- [ ] Create `components/wallet/transaction-row.tsx`

---

# PHASE 22: FRONTEND - CATEGORY & SUBSCRIPTION

## 22.1 Categories Listing

- [ ] Create `app/(dashboard)/user/subscriptions/page.tsx`
- [ ] Display available categories as cards
- [ ] Show subscription status per category
- [ ] Subscribe button for unsubscribed
- [ ] Price and package count per category

## 22.2 Subscription Components

- [ ] Create `components/subscriptions/category-card.tsx`
- [ ] Create `components/subscriptions/subscribe-modal.tsx`
- [ ] Create `components/subscriptions/subscription-badge.tsx`
- [ ] Create `components/subscriptions/my-subscriptions.tsx`

---

# PHASE 23: FRONTEND - PACKAGES BROWSING

## 23.1 Packages Listing

- [ ] Create `app/(dashboard)/user/packages/page.tsx`
- [ ] Package grid/list view toggle
- [ ] Filter by category
- [ ] Search packages
- [ ] Package cards with key info

## 23.2 Package Details

- [ ] Create `app/(dashboard)/user/packages/[id]/page.tsx`
- [ ] Package information display
- [ ] Products list with quantities
- [ ] Total cost and expected profit
- [ ] Purchase button
- [ ] Subscription requirement check

## 23.3 Package Components

- [ ] Create `components/packages/package-card.tsx`
- [ ] Create `components/packages/package-grid.tsx`
- [ ] Create `components/packages/package-details.tsx`
- [ ] Create `components/packages/product-list.tsx`
- [ ] Create `components/packages/purchase-modal.tsx`
- [ ] Create `components/packages/profit-calculator.tsx`

---

# PHASE 24: FRONTEND - USER PURCHASES & PROGRESS

## 24.1 My Purchases Page

- [ ] Create `app/(dashboard)/user/purchases/page.tsx`
- [ ] Active purchases section
- [ ] Completed purchases section
- [ ] Purchase status badges
- [ ] Time remaining countdown

## 24.2 Purchase Details Page

- [ ] Create `app/(dashboard)/user/purchases/[id]/page.tsx`
- [ ] Package info summary
- [ ] Overall completion progress bar
- [ ] Per-product progress breakdown
- [ ] Time remaining countdown (prominent)
- [ ] Expected payout calculation
- [ ] Status indicator

## 24.3 Purchase Components

- [ ] Create `components/purchases/purchase-card.tsx`
- [ ] Create `components/purchases/progress-bar.tsx`
- [ ] Create `components/purchases/countdown-timer.tsx`
- [ ] Create `components/purchases/product-progress-table.tsx`
- [ ] Create `components/purchases/payout-preview.tsx`

---

# PHASE 25: FRONTEND - USER SETTINGS

## 25.1 Settings Page

- [ ] Create `app/(dashboard)/user/settings/page.tsx`
- [ ] Profile information section
- [ ] Change password section
- [ ] Notification preferences (optional)
- [ ] Account actions

## 25.2 Settings Components

- [ ] Create `components/settings/profile-form.tsx`
- [ ] Create `components/settings/password-form.tsx`
- [ ] Create `components/settings/notification-settings.tsx`

---

# PHASE 26: FRONTEND - ADMIN DASHBOARD

## 26.1 Admin Dashboard Overview

- [ ] Create `app/(dashboard)/admin/dashboard/page.tsx`
- [ ] Total revenue card
- [ ] Total users card
- [ ] Active packages card
- [ ] Pending settlements card
- [ ] Revenue chart (line/area)
- [ ] Recent activity feed
- [ ] Top performing categories

## 26.2 Admin Dashboard Components

- [ ] Create `components/admin/stats-overview.tsx`
- [ ] Create `components/admin/revenue-chart.tsx`
- [ ] Create `components/admin/activity-feed.tsx`
- [ ] Create `components/admin/category-performance.tsx`

---

# PHASE 27: FRONTEND - ADMIN CATEGORY MANAGEMENT

## 27.1 Categories Management Page

- [ ] Create `app/(dashboard)/admin/categories/page.tsx`
- [ ] Categories data table
- [ ] Add category button
- [ ] Edit/Delete actions
- [ ] Status toggle

## 27.2 Category Form

- [ ] Create `app/(dashboard)/admin/categories/new/page.tsx`
- [ ] Create `app/(dashboard)/admin/categories/[id]/edit/page.tsx`
- [ ] Category form with validation

## 27.3 Category Components

- [ ] Create `components/admin/categories/category-table.tsx`
- [ ] Create `components/admin/categories/category-form.tsx`
- [ ] Create `components/admin/categories/category-actions.tsx`

---

# PHASE 28: FRONTEND - ADMIN PACKAGE MANAGEMENT

## 28.1 Packages Management Page

- [ ] Create `app/(dashboard)/admin/packages/page.tsx`
- [ ] Packages data table
- [ ] Filter by category
- [ ] Add package button
- [ ] Edit/Delete actions

## 28.2 Package Form

- [ ] Create `app/(dashboard)/admin/packages/new/page.tsx`
- [ ] Create `app/(dashboard)/admin/packages/[id]/edit/page.tsx`
- [ ] Package form with category selection
- [ ] Products management within package

## 28.3 Package Components

- [ ] Create `components/admin/packages/package-table.tsx`
- [ ] Create `components/admin/packages/package-form.tsx`
- [ ] Create `components/admin/packages/product-manager.tsx`

---

# PHASE 29: FRONTEND - ADMIN SALES MANAGEMENT

## 29.1 Sales Tracking Page

- [ ] Create `app/(dashboard)/admin/sales/page.tsx`
- [ ] Active purchases list (in selling window)
- [ ] Search by user/package
- [ ] Update sales progress interface
- [ ] Bulk update capability

## 29.2 Sales Update Interface

- [ ] Create `app/(dashboard)/admin/sales/[purchaseId]/page.tsx`
- [ ] Purchase details display
- [ ] Per-product sales update form
- [ ] Real-time completion calculation
- [ ] Save progress button

## 29.3 Sales Components

- [ ] Create `components/admin/sales/active-sales-table.tsx`
- [ ] Create `components/admin/sales/sales-update-form.tsx`
- [ ] Create `components/admin/sales/progress-indicator.tsx`

---

# PHASE 30: FRONTEND - ADMIN USER MANAGEMENT

## 30.1 Users Management Page

- [ ] Create `app/(dashboard)/admin/users/page.tsx`
- [ ] Users data table with search
- [ ] Filter by role
- [ ] View user details
- [ ] Change user role
- [ ] User statistics

## 30.2 User Details

- [ ] Create `app/(dashboard)/admin/users/[id]/page.tsx`
- [ ] User profile information
- [ ] User wallet info
- [ ] User subscriptions
- [ ] User purchases history
- [ ] User activity log

## 30.3 User Components

- [ ] Create `components/admin/users/users-table.tsx`
- [ ] Create `components/admin/users/user-details.tsx`
- [ ] Create `components/admin/users/user-actions.tsx`

---

# PHASE 31: FRONTEND - ADMIN SETTLEMENTS

## 31.1 Settlements Page

- [ ] Create `app/(dashboard)/admin/settlements/page.tsx`
- [ ] Pending settlements queue
- [ ] Settlement history table
- [ ] Manual settlement trigger
- [ ] Settlement statistics

## 31.2 Settlement Components

- [ ] Create `components/admin/settlements/pending-settlements.tsx`
- [ ] Create `components/admin/settlements/settlement-history.tsx`
- [ ] Create `components/admin/settlements/settlement-stats.tsx`

---

# PHASE 32: FRONTEND - CHARTS & DATA VISUALIZATION

## 32.1 Chart Components

- [ ] Create `components/charts/line-chart.tsx` - Revenue trends
- [ ] Create `components/charts/bar-chart.tsx` - Category comparison
- [ ] Create `components/charts/pie-chart.tsx` - Distribution
- [ ] Create `components/charts/area-chart.tsx` - Growth trends
- [ ] Create `components/charts/progress-ring.tsx` - Circular progress

## 32.2 Dashboard Charts Integration

- [ ] Integrate charts into user dashboard
- [ ] Integrate charts into admin dashboard
- [ ] Add chart loading states
- [ ] Add empty state for no data

---

# PHASE 33: FRONTEND - STATE MANAGEMENT

## 33.1 Zustand Store Setup

- [ ] Install Zustand
- [ ] Create `stores/auth-store.ts` - Auth state
- [ ] Create `stores/wallet-store.ts` - Wallet state
- [ ] Create `stores/ui-store.ts` - UI state (sidebar, modals)

## 33.2 React Query Setup

- [ ] Install TanStack Query
- [ ] Create query client configuration
- [ ] Create custom hooks for API calls:
  - [ ] `hooks/use-categories.ts`
  - [ ] `hooks/use-packages.ts`
  - [ ] `hooks/use-purchases.ts`
  - [ ] `hooks/use-wallet.ts`
  - [ ] `hooks/use-subscriptions.ts`
  - [ ] `hooks/use-admin-stats.ts`

---

# PHASE 34: FRONTEND - NOTIFICATIONS & FEEDBACK

## 34.1 Toast Notifications

- [ ] Install Sonner or React Hot Toast
- [ ] Configure toast provider
- [ ] Create toast utility functions
- [ ] Implement success/error/info toasts

## 34.2 Loading States

- [ ] Create page-level loading skeletons
- [ ] Create component-level loading states
- [ ] Add loading spinners for actions
- [ ] Implement optimistic updates

## 34.3 Error Handling

- [ ] Create error boundary component
- [ ] Create error page (`app/error.tsx`)
- [ ] Create not found page (`app/not-found.tsx`)
- [ ] Implement graceful error recovery

---

# PHASE 35: FRONTEND - RESPONSIVE DESIGN

## 35.1 Mobile Optimization

- [ ] Test and optimize all pages for mobile
- [ ] Ensure touch-friendly button sizes
- [ ] Optimize tables for mobile (horizontal scroll/cards)
- [ ] Test navigation on mobile
- [ ] Verify modal behavior on mobile

## 35.2 Tablet Optimization

- [ ] Test and adjust layouts for tablet
- [ ] Ensure sidebar behavior on tablet
- [ ] Optimize grid layouts

---

# PHASE 36: PERFORMANCE OPTIMIZATION

## 36.1 Next.js Optimizations

- [ ] Implement proper Server Components usage
- [ ] Use Suspense boundaries appropriately
- [ ] Implement streaming where beneficial
- [ ] Optimize images with next/image
- [ ] Implement proper caching strategies

## 36.2 Bundle Optimization

- [ ] Analyze bundle with @next/bundle-analyzer
- [ ] Implement code splitting
- [ ] Lazy load heavy components
- [ ] Optimize third-party imports

## 36.3 Database Optimization (MongoDB)

- [ ] Create compound indexes for complex queries
- [ ] Implement MongoDB aggregation pipelines for analytics
- [ ] Optimize queries with proper projections
- [ ] Configure connection pooling

---

# PHASE 37: SECURITY HARDENING

## 37.1 Security Implementation

- [ ] Implement rate limiting on API routes
- [ ] Add CSRF protection
- [ ] Implement input sanitization
- [ ] Add NoSQL injection prevention
- [ ] Secure headers configuration
- [ ] Environment variables security audit

## 37.2 Authentication Security

- [ ] Password hashing with bcrypt (10+ rounds)
- [ ] Session management security
- [ ] Implement account lockout after failed attempts
- [ ] Add audit logging for sensitive actions

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

| Phase | Description | Status | Completed Date |
|-------|-------------|--------|----------------|
| Phase 1 | Project Setup & Configuration | COMPLETED | 2026-01-25 |
| Phase 2 | Database Design & Prisma Schema (MongoDB) | COMPLETED | 2026-01-25 |
| Phase 3 | Authentication System | Not Started | - |
| Phase 4 | Wallet System | Not Started | - |
| Phase 5 | Category Management | Not Started | - |
| Phase 6 | Package Management | Not Started | - |
| Phase 7 | Product Management | Not Started | - |
| Phase 8 | Subscription System | Not Started | - |
| Phase 9 | Purchase System | Not Started | - |
| Phase 10 | Sales Tracking System | Not Started | - |
| Phase 11 | Settlement System | Not Started | - |
| Phase 12 | Payment Integration | Not Started | - |
| Phase 13 | Admin Analytics | Not Started | - |
| Phase 14 | User Management (Admin) | Not Started | - |
| Phase 15 | Backend Testing | Not Started | - |
| Phase 16 | UI Components Library | Not Started | - |
| Phase 17 | Layout Components | Not Started | - |
| Phase 18 | Authentication Pages | Not Started | - |
| Phase 19 | Landing Page | Not Started | - |
| Phase 20 | User Dashboard | Not Started | - |
| Phase 21 | User Wallet | Not Started | - |
| Phase 22 | Category & Subscription | Not Started | - |
| Phase 23 | Packages Browsing | Not Started | - |
| Phase 24 | User Purchases & Progress | Not Started | - |
| Phase 25 | User Settings | Not Started | - |
| Phase 26 | Admin Dashboard | Not Started | - |
| Phase 27 | Admin Category Management | Not Started | - |
| Phase 28 | Admin Package Management | Not Started | - |
| Phase 29 | Admin Sales Management | Not Started | - |
| Phase 30 | Admin User Management | Not Started | - |
| Phase 31 | Admin Settlements | Not Started | - |
| Phase 32 | Charts & Data Visualization | Not Started | - |
| Phase 33 | State Management | Not Started | - |
| Phase 34 | Notifications & Feedback | Not Started | - |
| Phase 35 | Responsive Design | Not Started | - |
| Phase 36 | Performance Optimization | Not Started | - |
| Phase 37 | Security Hardening | Not Started | - |
| Phase 38 | Testing & QA | Not Started | - |
| Phase 39 | Deployment Preparation | Not Started | - |
| Phase 40 | Post-Launch | Not Started | - |

---

## Completion Log

### Phase 1: Project Setup & Configuration - COMPLETED (2026-01-25)
**Tasks Completed:**
- [x] Initialize Next.js 15 project with TypeScript
- [x] Configure TypeScript strict mode in `tsconfig.json`
- [x] Set up path aliases (`@/components`, `@/lib`, `@/types`, etc.)
- [x] Install and configure ESLint with Prettier
- [x] Set up `.env.local` and `.env.example` files
- [x] Configure `.gitignore` properly
- [x] Create project folder structure
- [x] Install and configure shadcn/ui
- [x] Configure Tailwind CSS with custom theme colors
- [x] Install Lucide React icons
- [x] Install Recharts for data visualization

**Files Created:**
- `src/app/(auth)/layout.tsx`, `login/page.tsx`, `register/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/user/` - dashboard, packages, subscriptions, wallet, purchases, settings pages
- `src/app/(dashboard)/admin/` - dashboard, categories, packages, products, sales, users, settlements pages
- `src/lib/utils.ts`, `src/lib/constants.ts`, `src/lib/prisma.ts`
- `src/types/index.ts`
- `src/middleware.ts`
- `src/components/ui/` - 22 shadcn/ui components installed
- `.env.example`, `.env.local`, `components.json`

### Phase 2: Database Design & Prisma Schema - COMPLETED (2026-01-25)
**Tasks Completed:**
- [x] Install Prisma CLI and client
- [x] Configure MongoDB connection in `.env`
- [x] Configure Prisma for MongoDB in `prisma/schema.prisma`
- [x] Create all database models (User, Wallet, Category, Subscription, Package, Product, PackagePurchase, ProductSalesRecord, SettlementLog, PaymentTransaction)
- [x] Create database indexes for performance
- [x] Create database seed file (`prisma/seed.ts`)
- [x] Add seed script to `package.json`
- [x] Create initial admin user seed
- [x] Create sample categories and packages seed
- [x] Create `src/lib/prisma.ts` - Singleton Prisma client

**Database Models Created:**
- User (with Role enum)
- Wallet, WalletTransaction (with TransactionType enum)
- Category, Subscription (with SubscriptionStatus enum)
- Package, Product
- PackagePurchase (with PurchaseStatus enum), ProductSalesRecord
- SettlementLog, PaymentTransaction (with PaymentType, PaymentStatus enums)

---

**Last Updated:** 2026-01-25

**Development Rule:** Complete Phases 1-15 (Backend) before starting Phase 16+ (Frontend)

**Next Phase:** Phase 3 - Authentication System
