# Complete User Stories – Package Category Sales Platform

## 1. Project Overview

The platform enables users to subscribe to package categories, purchase packages within those categories, and earn profits from company-managed product sales. Each package contains multiple products with defined cost and selling prices. Sales occur within a fixed selling window, after which the system automatically settles payouts based on predefined success and failure rules.

The platform guarantees capital protection for users and earns a 10% commission on profits from successful sales.

---

## 2. Actors

- **User** – Subscribes to categories, purchases packages, tracks progress, and receives payouts
- **Admin** – Manages categories, packages, products, and sales updates
- **System** – Enforces rules, calculates progress, and performs automated settlements

---

## 3. Epic 1: User Account & Wallet Management

### User Story 1.1 – User Registration

**As a** user  
**I want** to create an account  
**So that** I can access subscriptions, packages, and my wallet

**Acceptance Criteria**

- User can register with valid credentials
- A wallet is automatically created for the user
- Initial wallet balance is zero

---

### User Story 1.2 – Wallet Transactions

**As a** system  
**I want** to manage wallet credits and debits  
**So that** all financial activities are transparent and auditable

**Acceptance Criteria**

- Wallet supports debit and credit operations
- Each transaction is recorded with timestamp and description
- Wallet balance updates immediately

---

## 4. Epic 2: Category Subscription Management

### User Story 2.1 – Admin Creates Package Categories

**As an** admin  
**I want** to create package categories  
**So that** packages can share the same pricing and subscription rules

**Acceptance Criteria**

- Category includes name, package price, and subscription fee
- All packages under a category inherit the same package price

---

### User Story 2.2 – User Subscribes to a Category

**As a** user  
**I want** to subscribe to a package category  
**So that** I can purchase packages within that category

**Acceptance Criteria**

- User can view available categories
- User can pay the subscription fee
- Subscription becomes active immediately
- User cannot purchase packages without an active subscription

---

## 5. Epic 3: Package & Product Management

### User Story 3.1 – Admin Creates Packages

**As an** admin  
**I want** to create packages under a category  
**So that** users can invest in grouped products

**Acceptance Criteria**

- Package belongs to one category
- Package price is inherited from the category
- Package contains one or more products

---

### User Story 3.2 – Admin Adds Products to a Package

**As an** admin  
**I want** to add products to a package  
**So that** the system can calculate expected profits

**Acceptance Criteria**

- Each product has name, quantity, cost price, and selling price
- Total cost and expected profit are auto-calculated
- Expected profit is visible before purchase

---

## 6. Epic 4: Package Purchase & Selling Window

### User Story 4.1 – User Purchases a Package

**As a** user  
**I want** to purchase a package  
**So that** the company can sell products on my behalf

**Acceptance Criteria**

- User has an active category subscription
- Wallet has sufficient balance
- User can purchase multiple packages
- Each purchase is tracked independently
- Selling window starts immediately after purchase

---

### User Story 4.2 – Selling Window Management

**As a** system  
**I want** to manage a fixed selling window  
**So that** sales are time-bound and measurable

**Acceptance Criteria**

- Selling window duration is 7 days
- Selling start and end timestamps are stored
- Selling countdown is visible to users

---

## 7. Epic 5: Sales Tracking & Progress

### User Story 5.1 – Admin Updates Sales Progress

**As an** admin  
**I want** to update sold quantities  
**So that** sales progress reflects real performance

**Acceptance Criteria**

- Updates allowed only during selling window
- Sold quantity cannot exceed total quantity
- Completion percentage is recalculated automatically
- All updates are audited

---

### User Story 5.2 – User Views Sales Progress

**As a** user  
**I want** to see the sales progress of my package  
**So that** I understand the likelihood of success

**Acceptance Criteria**

- User sees sold vs total quantities
- Completion percentage is clearly displayed
- Time remaining is visible

---

## 8. Epic 6: Success & Failure Rules

### User Story 6.1 – Determine Sale Outcome

**As a** system  
**I want** to evaluate sales at the end of the selling window  
**So that** outcomes are rule-based and fair

**Acceptance Criteria**

- Sale is successful if completion ≥ 70%
- Sale fails if completion < 70%
- No sales updates allowed after selling window ends

---

## 9. Epic 7: Settlement & Refunds

### User Story 7.1 – Successful Sale Settlement

**As a** system  
**I want** to settle successful package sales  
**So that** users receive capital plus profit

**Acceptance Criteria**

- User receives package price + profit − 10% commission
- Platform records commission
- Purchase status is updated to SETTLED

---

### User Story 7.2 – Failed Sale Refund

**As a** system  
**I want** to refund users when sales fail  
**So that** their capital is protected

**Acceptance Criteria**

- User receives full package price
- No commission is taken
- Purchase status is updated to REFUNDED

---

## 10. Epic 8: Automation & Integrity

### User Story 8.1 – Automatic Settlement

**As a** system  
**I want** to automatically process expired selling windows  
**So that** payouts are timely and consistent

**Acceptance Criteria**

- Scheduler runs automatically
- Each purchase is settled exactly once
- Only expired active purchases are processed

---

### User Story 8.2 – Data Integrity Enforcement

**As a** system  
**I want** to enforce strict business rules  
**So that** the platform remains fair and secure

**Acceptance Criteria**

- No updates after selling window
- Sold quantities are capped
- Status transitions are irreversible
- All financial actions are auditable

---

## 11. Definition of Done

- All user stories meet acceptance criteria
- Business rules are enforced at system and database levels
- Multiple package purchases per user are supported
- Automated settlement works without manual intervention

---

**This document represents the complete functional user stories for the platform MVP.**
