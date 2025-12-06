import { query } from '../config/database';

export type Template = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  variant: string | null;
  tags: string[];
  thumbnailUrl: string | null;
  subject: string;
  previewText: string | null;
  htmlContent: string | null;
  textContent: string | null;
  createdById: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function findAllTemplates(): Promise<Template[]> {
  const result = await query<Template>(
    'SELECT * FROM templates ORDER BY created_at DESC'
  );
  return result.rows;
}

export async function findTemplateById(id: string): Promise<Template | null> {
  const result = await query<Template>(
    'SELECT * FROM templates WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function createTemplate(data: {
  name: string;
  description?: string | null;
  category?: string | null;
  variant?: string | null;
  tags?: string[];
  thumbnailUrl?: string | null;
  subject: string;
  previewText?: string | null;
  htmlContent?: string | null;
  textContent?: string | null;
  createdById?: string | null;
  active?: boolean;
}): Promise<Template> {
  const result = await query<Template>(
    `INSERT INTO templates (name, description, category, variant, tags, thumbnail_url, subject, preview_text, html_content, text_content, created_by_id, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      data.name,
      data.description ?? null,
      data.category ?? null,
      data.variant ?? null,
      data.tags ?? [],
      data.thumbnailUrl ?? null,
      data.subject,
      data.previewText ?? null,
      data.htmlContent ?? null,
      data.textContent ?? null,
      data.createdById ?? null,
      data.active ?? true,
    ]
  );
  return result.rows[0];
}

export async function updateTemplate(id: string, data: Partial<{
  name: string;
  description: string | null;
  category: string | null;
  variant: string | null;
  tags: string[];
  thumbnailUrl: string | null;
  subject: string;
  previewText: string | null;
  htmlContent: string | null;
  textContent: string | null;
  active: boolean;
}>): Promise<Template> {
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
  if (data.category !== undefined) {
    updates.push(`category = $${paramCount++}`);
    values.push(data.category);
  }
  if (data.variant !== undefined) {
    updates.push(`variant = $${paramCount++}`);
    values.push(data.variant);
  }
  if (data.tags !== undefined) {
    updates.push(`tags = $${paramCount++}`);
    values.push(data.tags);
  }
  if (data.thumbnailUrl !== undefined) {
    updates.push(`thumbnail_url = $${paramCount++}`);
    values.push(data.thumbnailUrl);
  }
  if (data.subject !== undefined) {
    updates.push(`subject = $${paramCount++}`);
    values.push(data.subject);
  }
  if (data.previewText !== undefined) {
    updates.push(`preview_text = $${paramCount++}`);
    values.push(data.previewText);
  }
  if (data.htmlContent !== undefined) {
    updates.push(`html_content = $${paramCount++}`);
    values.push(data.htmlContent);
  }
  if (data.textContent !== undefined) {
    updates.push(`text_content = $${paramCount++}`);
    values.push(data.textContent);
  }
  if (data.active !== undefined) {
    updates.push(`active = $${paramCount++}`);
    values.push(data.active);
  }

  if (updates.length === 0) {
    const template = await findTemplateById(id);
    if (!template) throw new Error('Template not found');
    return template;
  }

  values.push(id);
  const result = await query<Template>(
    `UPDATE templates SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteTemplate(id: string): Promise<void> {
  await query('DELETE FROM templates WHERE id = $1', [id]);
}

