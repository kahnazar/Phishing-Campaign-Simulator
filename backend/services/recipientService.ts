import { query } from '../config/database';

export type Recipient = {
  id: string;
  email: string;
  name: string | null;
  department: string | null;
  position: string | null;
  campaignCount: number;
  clickRate: number;
  lastEngagedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function findAllRecipients(): Promise<Recipient[]> {
  const result = await query<Recipient>(
    'SELECT * FROM recipients ORDER BY created_at DESC'
  );
  return result.rows;
}

export async function findRecipientById(id: string): Promise<Recipient | null> {
  const result = await query<Recipient>(
    'SELECT * FROM recipients WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function findRecipientByEmail(email: string): Promise<Recipient | null> {
  const result = await query<Recipient>(
    'SELECT * FROM recipients WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  return result.rows[0] || null;
}

export async function createRecipient(data: {
  email: string;
  name?: string | null;
  department?: string | null;
  position?: string | null;
  campaignCount?: number;
  clickRate?: number;
}): Promise<Recipient> {
  const result = await query<Recipient>(
    `INSERT INTO recipients (email, name, department, position, campaign_count, click_rate)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.email.toLowerCase(),
      data.name ?? null,
      data.department ?? null,
      data.position ?? null,
      data.campaignCount ?? 0,
      data.clickRate ?? 0,
    ]
  );
  return result.rows[0];
}

export async function updateRecipient(id: string, data: Partial<{
  email: string;
  name: string | null;
  department: string | null;
  position: string | null;
  campaignCount: number;
  clickRate: number;
}>): Promise<Recipient> {
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
  if (data.department !== undefined) {
    updates.push(`department = $${paramCount++}`);
    values.push(data.department);
  }
  if (data.position !== undefined) {
    updates.push(`position = $${paramCount++}`);
    values.push(data.position);
  }
  if (data.campaignCount !== undefined) {
    updates.push(`campaign_count = $${paramCount++}`);
    values.push(data.campaignCount);
  }
  if (data.clickRate !== undefined) {
    updates.push(`click_rate = $${paramCount++}`);
    values.push(data.clickRate);
  }

  if (updates.length === 0) {
    const recipient = await findRecipientById(id);
    if (!recipient) throw new Error('Recipient not found');
    return recipient;
  }

  values.push(id);
  const result = await query<Recipient>(
    `UPDATE recipients SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function upsertRecipient(data: {
  email: string;
  name?: string | null;
  department?: string | null;
  position?: string | null;
  campaignCount?: number;
  clickRate?: number;
}): Promise<{ recipient: Recipient; created: boolean }> {
  const existing = await findRecipientByEmail(data.email);
  
  if (existing) {
    const updated = await updateRecipient(existing.id, {
      name: data.name ?? existing.name,
      department: data.department ?? existing.department,
      position: data.position ?? existing.position,
      campaignCount: data.campaignCount ?? existing.campaignCount,
      clickRate: data.clickRate ?? existing.clickRate,
    });
    return { recipient: updated, created: false };
  } else {
    const created = await createRecipient(data);
    return { recipient: created, created: true };
  }
}

export async function deleteRecipient(id: string): Promise<void> {
  await query('DELETE FROM recipients WHERE id = $1', [id]);
}

