import { NextResponse } from "next/server";

export function successResponse<T>(data: T, init?: { status?: number }) {
  return NextResponse.json(data, { status: init?.status ?? 200 });
}

export function errorResponse(
  message: string,
  init?: {
    status?: number;
    details?: unknown;
    code?: string;
  },
) {
  return NextResponse.json(
    {
      error: message,
      ...(init?.code ? { code: init.code } : {}),
      ...(init?.details !== undefined ? { details: init.details } : {}),
    },
    { status: init?.status ?? 500 },
  );
}
