import { scryptSync, timingSafeEqual } from 'node:crypto';

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
