import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(value: string): Promise<string> {
  return bcrypt.hash(value, SALT_ROUNDS);
}

export async function comparePassword(value: string, hashedValue: string): Promise<boolean> {
  return bcrypt.compare(value, hashedValue);
}
