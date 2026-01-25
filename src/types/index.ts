// User Types
export type Role = "USER" | "ADMIN"

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: Role
  emailVerified?: Date
  image?: string
  createdAt: Date
  updatedAt: Date
}

// Wallet Types
export type TransactionType = "CREDIT" | "DEBIT"

export interface Wallet {
  id: string
  userId: string
  balance: number
  createdAt: Date
  updatedAt: Date
}

export interface WalletTransaction {
  id: string
  walletId: string
  type: TransactionType
  amount: number
  description: string
  reference?: string
  createdAt: Date
}

// Category Types
export interface Category {
  id: string
  name: string
  description?: string
  packagePrice: number
  subscriptionFee: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Subscription Types
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED"

export interface Subscription {
  id: string
  userId: string
  categoryId: string
  status: SubscriptionStatus
  startDate: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

// Package Types
export interface Package {
  id: string
  categoryId: string
  name: string
  description?: string
  imageUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Product Types
export interface Product {
  id: string
  packageId: string
  name: string
  quantity: number
  costPrice: number
  sellingPrice: number
  createdAt: Date
  updatedAt: Date
}

// Purchase Types
export type PurchaseStatus = "ACTIVE" | "SETTLED" | "REFUNDED"

export interface PackagePurchase {
  id: string
  userId: string
  packageId: string
  purchasePrice: number
  expectedProfit: number
  status: PurchaseStatus
  sellingWindowStart: Date
  sellingWindowEnd: Date
  completionPercent: number
  settledAt?: Date
  payoutAmount?: number
  createdAt: Date
  updatedAt: Date
}

// Sales Record Types
export interface ProductSalesRecord {
  id: string
  purchaseId: string
  productId: string
  totalQuantity: number
  soldQuantity: number
  lastUpdatedBy?: string
  createdAt: Date
  updatedAt: Date
}

// Settlement Types
export interface SettlementLog {
  id: string
  purchaseId: string
  status: string
  payout: number
  commission: number
  completionPct: number
  processedAt: Date
}

// Payment Types
export type PaymentType = "DEPOSIT" | "SUBSCRIPTION"
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED"

export interface PaymentTransaction {
  id: string
  userId: string
  type: PaymentType
  amount: number
  status: PaymentStatus
  reference: string
  provider: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Query Parameter Types
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface FilterParams {
  search?: string
  status?: string
  categoryId?: string
  startDate?: string
  endDate?: string
}
