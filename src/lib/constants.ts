// Business Rules Constants
export const BUSINESS_RULES = {
  SELLING_WINDOW_DAYS: 7,
  SUCCESS_THRESHOLD_PERCENT: 70,
  PLATFORM_COMMISSION_PERCENT: 10,
} as const

// Status Values
export const PURCHASE_STATUS = {
  ACTIVE: "ACTIVE",
  SETTLED: "SETTLED",
  REFUNDED: "REFUNDED",
} as const

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
} as const

export const TRANSACTION_TYPE = {
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
} as const

export const USER_ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const

// API Response Messages
export const MESSAGES = {
  UNAUTHORIZED: "You are not authorized to perform this action",
  NOT_FOUND: "Resource not found",
  INVALID_INPUT: "Invalid input data",
  SERVER_ERROR: "An unexpected error occurred",
  SUCCESS: "Operation completed successfully",
} as const
