import { query } from '../config/database';
import type { UserRole } from './userService';

export type TeamMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  teamName: string | null;
  role: UserRole;
  campaignCount: number;
  lastActiveAt: Date | null;
  lastActiveLabel: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TeamMemberWithUser = TeamMember & {
  user?: { role: UserRole } | null;
};

export async function findAllTeamMembers(): Promise<TeamMemberWithUser[]> {
  const result = await query<TeamMember & { user_role: UserRole | null }>(
    `SELECT tm.*, u.role as user_role
     FROM team_members tm
     LEFT JOIN users u ON tm.user_id = u.id
     ORDER BY tm.created_at DESC`
  );
  return result.rows.map(row => ({
    ...row,
    user: row.user_role ? { role: row.user_role } : null,
  }));
}

export async function findTeamMemberById(id: string): Promise<TeamMemberWithUser | null> {
  const result = await query<TeamMember & { user_role: UserRole | null }>(
    `SELECT tm.*, u.role as user_role
     FROM team_members tm
     LEFT JOIN users u ON tm.user_id = u.id
     WHERE tm.id = $1`,
    [id]
  );
  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    ...row,
    user: row.user_role ? { role: row.user_role } : null,
  };
}

export async function findTeamMemberByUserId(userId: string): Promise<TeamMember | null> {
  const result = await query<TeamMember>(
    'SELECT * FROM team_members WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

export async function createTeamMember(data: {
  userId: string;
  name: string;
  email: string;
  teamName?: string | null;
  role: UserRole;
  campaignCount?: number;
  lastActiveLabel?: string | null;
}): Promise<TeamMember> {
  const result = await query<TeamMember>(
    `INSERT INTO team_members (user_id, name, email, team_name, role, campaign_count, last_active_label)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.userId,
      data.name,
      data.email.toLowerCase(),
      data.teamName ?? null,
      data.role,
      data.campaignCount ?? 0,
      data.lastActiveLabel ?? null,
    ]
  );
  return result.rows[0];
}

export async function updateTeamMember(id: string, data: Partial<{
  name: string;
  email: string;
  teamName: string | null;
  role: UserRole;
  campaignCount: number;
  lastActiveLabel: string | null;
}>): Promise<TeamMember> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.email !== undefined) {
    updates.push(`email = $${paramCount++}`);
    values.push(data.email.toLowerCase());
  }
  if (data.teamName !== undefined) {
    updates.push(`team_name = $${paramCount++}`);
    values.push(data.teamName);
  }
  if (data.role !== undefined) {
    updates.push(`role = $${paramCount++}`);
    values.push(data.role);
  }
  if (data.campaignCount !== undefined) {
    updates.push(`campaign_count = $${paramCount++}`);
    values.push(data.campaignCount);
  }
  if (data.lastActiveLabel !== undefined) {
    updates.push(`last_active_label = $${paramCount++}`);
    values.push(data.lastActiveLabel);
  }

  if (updates.length === 0) {
    const member = await findTeamMemberById(id);
    if (!member) throw new Error('Team member not found');
    return member;
  }

  values.push(id);
  const result = await query<TeamMember>(
    `UPDATE team_members SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteTeamMember(id: string): Promise<void> {
  await query('DELETE FROM team_members WHERE id = $1', [id]);
}

