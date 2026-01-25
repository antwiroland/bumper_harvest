
# Architectural Flow – Next.js Full-Stack Package Sales Platform

## Overview
This document describes the full architectural flow of the platform using **Next.js as a full-stack framework**.  
The platform allows users to subscribe to package categories, purchase packages, track sales progress, and receive automated settlements.

---

## High-Level Architecture

```
[ Client (Web / Mobile Browser) ]
            |
            v
[ Next.js Frontend (App Router) ]
            |
            v
[ Next.js Backend (Route Handlers / Server Actions) ]
            |
            v
[ Database (PostgreSQL) ]
            |
            v
[ Cron / Background Jobs ]
```

---

## Technology Stack

### Frontend
- Next.js 14 (App Router)
- React Server Components
- Tailwind CSS
- Chart.js / Recharts

### Backend (Inside Next.js)
- Route Handlers (`app/api/*`)
- Server Actions
- Prisma ORM
- Zod Validation
- Auth.js / NextAuth (JWT)

### Database
- PostgreSQL
- Redis (optional for locks)

### Payments
- Paystack / Flutterwave / Hubtel
- Webhooks via API routes

---

## Folder Structure

```
app/
├── (auth)/
├── dashboard/
│   ├── user/
│   ├── admin/
├── packages/
├── api/
│   ├── categories/
│   ├── packages/
│   ├── subscriptions/
│   ├── purchases/
│   ├── sales/
│   ├── settlement/
│   └── wallet/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── rules.ts
│   └── scheduler.ts
└── middleware.ts
```

---

## Core System Flows

### Authentication Flow
- User registers or logs in
- JWT session created
- Middleware enforces role-based access (ADMIN / USER)

---

### Category & Package Management (Admin)
1. Admin creates a category
   - Defines package price and subscription fee
2. Admin creates packages under category
3. Admin adds products with:
   - Quantity
   - Cost price
   - Selling price
4. System calculates:
   - Total cost
   - Expected profit

---

### Subscription Flow
1. User subscribes to a category
2. Payment processed
3. Subscription activated
4. Access to packages unlocked

---

### Package Purchase Flow
1. User selects a package
2. System validates:
   - Active subscription
   - Sufficient wallet balance
3. Wallet debited
4. PackagePurchase created
5. Selling window starts (7 days)

Users may purchase multiple packages; each purchase is tracked independently.

---

### Sales Tracking (Admin)
- Admin updates sold quantities during selling window only
- Sold quantity is capped at total quantity
- Completion percentage is auto-calculated
- No updates allowed after selling window closes

---

### User Progress View
Users can view:
- Products in package
- Sold vs total quantities
- Completion percentage
- Time remaining
- Expected payout

---

## Settlement Logic

### Trigger
- Cron job runs periodically
- Finds purchases where selling window has expired

### Success Condition
```
Completion Percentage >= 70%
```

### Failure Condition
```
Completion Percentage < 70%
```

---

### Settlement Outcomes

#### Successful Sale
```
Payout = Package Price + Profit − (10% of Profit)
```
- User wallet credited
- Platform keeps commission
- Status set to SETTLED

#### Failed Sale
```
Payout = Package Price
```
- Full refund to user
- No commission
- Status set to REFUNDED

---

## Scheduling

### Vercel Cron (Recommended)
```
{
  "crons": [
    {
      "path": "/api/settlement/run",
      "schedule": "0 * * * *"
    }
  ]
}
```

---

## Security & Integrity Rules
- No sales updates after selling window
- Sold quantity cannot exceed total quantity
- Subscription required for purchase
- Settlement runs exactly once per purchase
- All wallet actions are auditable

---

## Summary
This architecture ensures:
- Capital protection for users
- Automated, rule-based settlements
- High transparency
- Scalability
- Clean separation of concerns within a single Next.js codebase
