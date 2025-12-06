import { query } from '../config/database';

export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';

export type Campaign = {
  id: string;
  name: string;
  description: string | null;
  status: CampaignStatus;
  templateId: string | null;
  createdById: string | null;
  scheduledAt: Date | null;
  launchedAt: Date | null;
  completedAt: Date | null;
  recipientsCount: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  submittedCount: number;
  failureCount: number;
  metadata: any | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CampaignWithTemplate = Campaign & {
  template?: { name: string } | null;
};

export async function findAllCampaigns(): Promise<CampaignWithTemplate[]> {
  const result = await query<Campaign & { template_name: string | null }>(
    `SELECT c.*, t.name as template_name
     FROM campaigns c
     LEFT JOIN templates t ON c.template_id = t.id
     ORDER BY c.created_at DESC`
  );
  return result.rows.map(row => ({
    ...row,
    template: row.template_name ? { name: row.template_name } : null,
  }));
}

export async function findCampaignById(id: string): Promise<CampaignWithTemplate | null> {
  const result = await query<Campaign & { template_name: string | null }>(
    `SELECT c.*, t.name as template_name
     FROM campaigns c
     LEFT JOIN templates t ON c.template_id = t.id
     WHERE c.id = $1`,
    [id]
  );
  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    ...row,
    template: row.template_name ? { name: row.template_name } : null,
  };
}

export async function createCampaign(data: {
  name: string;
  description?: string | null;
  status?: CampaignStatus;
  templateId?: string | null;
  createdById?: string | null;
  scheduledAt?: Date | null;
  recipientsCount?: number;
}): Promise<Campaign> {
  const result = await query<Campaign>(
    `INSERT INTO campaigns (name, description, status, template_id, created_by_id, scheduled_at, recipients_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.name,
      data.description ?? null,
      data.status ?? 'DRAFT',
      data.templateId ?? null,
      data.createdById ?? null,
      data.scheduledAt ?? null,
      data.recipientsCount ?? 0,
    ]
  );
  return result.rows[0];
}

export async function updateCampaign(id: string, data: Partial<{
  name: string;
  description: string | null;
  status: CampaignStatus;
  templateId: string | null;
  scheduledAt: Date | null;
  recipientsCount: number;
}>): Promise<Campaign> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(data.description);
  }
  if (data.status !== undefined) {
    updates.push(`status = $${paramCount++}`);
    values.push(data.status);
  }
  if (data.templateId !== undefined) {
    updates.push(`template_id = $${paramCount++}`);
    values.push(data.templateId);
  }
  if (data.scheduledAt !== undefined) {
    updates.push(`scheduled_at = $${paramCount++}`);
    values.push(data.scheduledAt);
  }
  if (data.recipientsCount !== undefined) {
    updates.push(`recipients_count = $${paramCount++}`);
    values.push(data.recipientsCount);
  }

  if (updates.length === 0) {
    const campaign = await findCampaignById(id);
    if (!campaign) throw new Error('Campaign not found');
    return campaign;
  }

  values.push(id);
  const result = await query<Campaign>(
    `UPDATE campaigns SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteCampaign(id: string): Promise<void> {
  await query('DELETE FROM campaigns WHERE id = $1', [id]);
}

