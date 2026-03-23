type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

function sanitizeString(value: string) {
  return value.replace(/<script.*?>.*?<\/script>/gi, "").trim();
}

export function sanitizeInput<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item)) as T;
  }

  if (input && typeof input === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (key.startsWith("$") || key.includes(".")) {
        continue;
      }
      output[key] = sanitizeInput(value);
    }
    return output as T;
  }

  if (typeof input === "string") {
    return sanitizeString(input) as T;
  }

  return input;
}
