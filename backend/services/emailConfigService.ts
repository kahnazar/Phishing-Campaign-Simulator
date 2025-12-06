import { query } from '../config/database';

export type EmailConfig = {
  id: string;
  userId: string | null;
  host: string;
  port: number;
  secure: boolean;
  username: string | null;
  password: string | null;
  fromEmail: string | null;
  fromName: string | null;
  rateLimitPerMinute: number;
  lastVerifiedAt: Date | null;
  metadata: any | null;
  useLocalSmtp: boolean; // Новое поле для локального SMTP
  createdAt: Date;
  updatedAt: Date;
};

type UpdateEmailConfigInput = {
  host?: string;
  port?: number | string;
  secure?: boolean | string;
  user?: string;
  pass?: string;
  from?: string;
  fromName?: string;
  rateLimitPerMinute?: number;
  useLocalSmtp?: boolean | string;
};

type SanitizedEmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  from?: string;
  password?: string;
  hasPassword: boolean;
  rateLimitPerMinute: number;
  useLocalSmtp?: boolean;
};

function coerceBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value === 'true' || value === '1';
  }
  return Boolean(value);
}

function coercePort(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const port = Number(value);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error('SMTP port must be a valid number');
  }
  return port;
}

export async function getStoredEmailConfig(userId?: string): Promise<EmailConfig | null> {
  if (userId) {
    const result = await query<EmailConfig>(
      'SELECT * FROM email_configs WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [userId]
    );
    return result.rows[0] || null;
  }
  const result = await query<EmailConfig>(
    'SELECT * FROM email_configs ORDER BY updated_at DESC LIMIT 1'
  );
  return result.rows[0] || null;
}

export async function findEmailConfig(userId?: string): Promise<EmailConfig | null> {
  return getStoredEmailConfig(userId);
}

export async function createEmailConfig(data: {
  userId?: string | null;
  host: string;
  port?: number;
  secure?: boolean;
  username?: string | null;
  password?: string | null;
  fromEmail?: string | null;
  fromName?: string | null;
  rateLimitPerMinute?: number;
  useLocalSmtp?: boolean;
}): Promise<EmailConfig> {
  const result = await query<EmailConfig>(
    `INSERT INTO email_configs (user_id, host, port, secure, username, password, from_email, from_name, rate_limit_per_minute, use_local_smtp)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      data.userId ?? null,
      data.host,
      data.port ?? 587,
      data.secure ?? false,
      data.username ?? null,
      data.password ?? null,
      data.fromEmail ?? null,
      data.fromName ?? null,
      data.rateLimitPerMinute ?? 100,
      data.useLocalSmtp ?? false,
    ]
  );
  return result.rows[0];
}

async function updateEmailConfigById(id: string, data: Partial<{
  host: string;
  port: number;
  secure: boolean;
  username: string | null;
  password: string | null;
  fromEmail: string | null;
  fromName: string | null;
  rateLimitPerMinute: number;
  useLocalSmtp?: boolean;
}>): Promise<EmailConfig> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.host !== undefined) {
    updates.push(`host = $${paramCount++}`);
    values.push(data.host);
  }
  if (data.port !== undefined) {
    updates.push(`port = $${paramCount++}`);
    values.push(data.port);
  }
  if (data.secure !== undefined) {
    updates.push(`secure = $${paramCount++}`);
    values.push(data.secure);
  }
  if (data.username !== undefined) {
    updates.push(`username = $${paramCount++}`);
    values.push(data.username);
  }
  if (data.password !== undefined) {
    updates.push(`password = $${paramCount++}`);
    values.push(data.password);
  }
  if (data.fromEmail !== undefined) {
    updates.push(`from_email = $${paramCount++}`);
    values.push(data.fromEmail);
  }
  if (data.fromName !== undefined) {
    updates.push(`from_name = $${paramCount++}`);
    values.push(data.fromName);
  }
  if (data.rateLimitPerMinute !== undefined) {
    updates.push(`rate_limit_per_minute = $${paramCount++}`);
    values.push(data.rateLimitPerMinute);
  }
  if (data.useLocalSmtp !== undefined) {
    updates.push(`use_local_smtp = $${paramCount++}`);
    values.push(data.useLocalSmtp);
  }

  if (updates.length === 0) {
    const config = await findEmailConfigById(id);
    if (!config) throw new Error('Email config not found');
    return config;
  }

  values.push(id);
  const result = await query<EmailConfig>(
    `UPDATE email_configs SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function findEmailConfigById(id: string): Promise<EmailConfig | null> {
  const result = await query<EmailConfig>(
    'SELECT * FROM email_configs WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function upsertEmailConfig(data: {
  userId?: string | null;
  host: string;
  port?: number;
  secure?: boolean;
  username?: string | null;
  password?: string | null;
  fromEmail?: string | null;
  fromName?: string | null;
  rateLimitPerMinute?: number;
}): Promise<EmailConfig> {
  const existing = await findEmailConfig(data.userId ?? undefined);
  
  if (existing) {
    return updateEmailConfigById(existing.id, {
      host: data.host,
      port: data.port ?? existing.port,
      secure: data.secure ?? existing.secure,
      username: data.username ?? existing.username,
      password: data.password !== undefined ? data.password : existing.password,
      fromEmail: data.fromEmail ?? existing.fromEmail,
      fromName: data.fromName ?? existing.fromName,
      rateLimitPerMinute: data.rateLimitPerMinute ?? existing.rateLimitPerMinute,
    });
  } else {
    return createEmailConfig(data);
  }
}

export async function updateEmailConfig(update: UpdateEmailConfigInput, userId?: string): Promise<EmailConfig> {
  const existing = await getStoredEmailConfig(userId);

  const port = coercePort(update.port) ?? existing?.port ?? 587;
  const secure = coerceBoolean(update.secure);

  const useLocalSmtp = coerceBoolean(update.useLocalSmtp);
  
  const sanitized = {
    host: update.host ?? existing?.host,
    port,
    secure: secure ?? existing?.secure ?? port === 465,
    username: update.user ?? existing?.username ?? null,
    fromEmail: update.from ?? existing?.fromEmail ?? null,
    fromName: update.fromName ?? existing?.fromName ?? null,
    rateLimitPerMinute: update.rateLimitPerMinute ?? existing?.rateLimitPerMinute ?? 100,
    password: update.pass === ''
      ? null
      : update.pass
        ? update.pass
        : existing?.password ?? null,
    useLocalSmtp: useLocalSmtp ?? existing?.useLocalSmtp ?? false,
  };

  // Для локального SMTP host не обязателен
  if (!sanitized.useLocalSmtp && !sanitized.host) {
    throw new Error('SMTP host is required');
  }
  
  // Для локального SMTP устанавливаем дефолтные значения
  if (sanitized.useLocalSmtp) {
    sanitized.host = sanitized.host || 'localhost';
    sanitized.port = sanitized.port || 1025;
    sanitized.secure = false;
  }

  if (existing) {
    return updateEmailConfigById(existing.id, {
      ...sanitized,
      useLocalSmtp: sanitized.useLocalSmtp,
    });
  } else {
    return createEmailConfig({
      userId,
      ...sanitized,
    });
  }
}


export function assembleEffectiveEmailConfig(stored?: EmailConfig | null): SanitizedEmailConfig {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    SMTP_RATE_LIMIT,
    USE_LOCAL_SMTP,
  } = process.env;

  const useLocalSmtp = coerceBoolean(USE_LOCAL_SMTP) ?? stored?.useLocalSmtp ?? false;

  // Если используется локальный SMTP, возвращаем конфигурацию для localhost
  if (useLocalSmtp) {
    return {
      host: 'localhost',
      port: 1025,
      secure: false,
      user: undefined,
      from: stored?.fromEmail ?? 'noreply@phishlab.local',
      password: undefined,
      hasPassword: false,
      rateLimitPerMinute: stored?.rateLimitPerMinute ?? 100,
      useLocalSmtp: true,
    };
  }

  const secureEnv = coerceBoolean(SMTP_SECURE);
  const portEnv = coercePort(SMTP_PORT);
  const rateLimitEnv = SMTP_RATE_LIMIT ? Number(SMTP_RATE_LIMIT) : undefined;

  const host = SMTP_HOST ?? stored?.host ?? '';
  const port = portEnv ?? stored?.port ?? 587;
  const secure = secureEnv ?? stored?.secure ?? port === 465;
  const user = SMTP_USER ?? stored?.username ?? undefined;
  const pass = SMTP_PASS ?? stored?.password ?? undefined;
  const from = SMTP_FROM ?? stored?.fromEmail ?? undefined;
  const rateLimitPerMinute = rateLimitEnv ?? stored?.rateLimitPerMinute ?? 100;

  const password = SMTP_PASS ?? stored?.password ?? undefined;

  // Для локального SMTP не требуем host и from
  if (!useLocalSmtp) {
    if (!host) {
      throw new Error('SMTP host is required (set via environment variables or UI)');
    }

    if (!from) {
      throw new Error('SMTP from address is required (set SMTP_FROM or configure in UI)');
    }
  }

  return {
    host,
    port,
    secure,
    user,
    from,
    password,
    hasPassword: Boolean(password),
    rateLimitPerMinute,
    useLocalSmtp: false,
  };
}

export async function getEmailConfigForClient(userId?: string) {
  const stored = await getStoredEmailConfig(userId);
  return {
    host: stored?.host ?? '',
    port: stored?.port ?? 587,
    secure: stored?.secure ?? false,
    user: stored?.username ?? '',
    from: stored?.fromEmail ?? '',
    hasPassword: Boolean(stored?.password),
    rateLimitPerMinute: stored?.rateLimitPerMinute ?? 100,
    useLocalSmtp: stored?.useLocalSmtp ?? false,
  };
}

