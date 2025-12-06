import { scryptSync, timingSafeEqual, randomBytes } from 'node:crypto';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64);
  const key = derived.toString('hex');
  return `${salt}:${key}`;
}

export function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
  if (!storedHash) {
    return false;
  }

  const [salt, key] = storedHash.split(':');
  if (!salt || !key) {
    return false;
  }

  const derived = scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');

  if (derived.length !== keyBuffer.length) {
    return false;
  }

  return timingSafeEqual(derived, keyBuffer);
}
