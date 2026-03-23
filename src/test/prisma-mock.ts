import { vi } from "vitest";

export function createPrismaMock() {
  return {
    $transaction: vi.fn(async (callbackOrQueries: unknown) => {
      if (typeof callbackOrQueries === "function") {
        return (callbackOrQueries as (tx: unknown) => unknown)(createPrismaMock());
      }
      return callbackOrQueries;
    }),
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    wallet: {
      findUnique: vi.fn(),
      aggregate: vi.fn(),
      update: vi.fn(),
    },
    walletTransaction: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    category: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    package: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    subscription: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    packagePurchase: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    productSalesRecord: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      createMany: vi.fn(),
    },
    settlementLog: {
      count: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn(),
    },
    paymentTransaction: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    session: {
      deleteMany: vi.fn(),
    },
    account: {
      deleteMany: vi.fn(),
    },
  };
}
