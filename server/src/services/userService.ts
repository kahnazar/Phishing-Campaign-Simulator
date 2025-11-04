import prisma from '../config/database';

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function sanitizeUser<T extends { passwordHash?: string | null }>(
  user: T | null
): Omit<T, 'passwordHash'> | null {
  if (!user) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user;
  return safe;
}
