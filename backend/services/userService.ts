import { query } from '../config/database';

export type UserRole = 'ADMIN' | 'MANAGER' | 'VIEWER' | 'AUDITOR';

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SafeUser = Omit<User, 'passwordHash'>;

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  return result.rows[0] || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export function sanitizeUser(user: User | null): SafeUser | null {
  if (!user) {
    return null;
  }
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function createUser(data: {
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
}): Promise<User> {
  const result = await query<User>(
    `INSERT INTO users (email, name, role, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.email.toLowerCase(), data.name, data.role, data.passwordHash]
  );
  return result.rows[0];
}

export async function updateUser(id: string, data: Partial<{
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  lastLoginAt: Date | null;
}>): Promise<User> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.email !== undefined) {
    updates.push(`email = $${paramCount++}`);
    values.push(data.email.toLowerCase());
  }
  if (data.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.role !== undefined) {
    updates.push(`role = $${paramCount++}`);
    values.push(data.role);
  }
  if (data.passwordHash !== undefined) {
    updates.push(`password_hash = $${paramCount++}`);
    values.push(data.passwordHash);
  }
  if (data.lastLoginAt !== undefined) {
    updates.push(`last_login_at = $${paramCount++}`);
    values.push(data.lastLoginAt);
  }

  if (updates.length === 0) {
    const user = await findUserById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  values.push(id);
  const result = await query<User>(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
}

