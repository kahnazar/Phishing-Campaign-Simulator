import prisma from '../config/database';

type UpdateEmailConfigInput = {
  host?: string;
  port?: number | string;
  secure?: boolean | string;
  user?: string;
  pass?: string;
  from?: string;
  fromName?: string;
  rateLimitPerMinute?: number;
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

export async function getStoredEmailConfig(userId?: string) {
  return prisma.emailConfig.findFirst({
    where: userId ? { userId } : undefined,
    orderBy: [{ updatedAt: 'desc' }],
  });
}

export async function updateEmailConfig(update: UpdateEmailConfigInput, userId?: string) {
  const existing = await getStoredEmailConfig(userId);

  const port = coercePort(update.port) ?? existing?.port ?? 587;
  const secure = coerceBoolean(update.secure);

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
  };

  if (!sanitized.host) {
    throw new Error('SMTP host is required');
  }

  const record = existing
    ? await prisma.emailConfig.update({
        where: { id: existing.id },
        data: sanitized,
      })
    : await prisma.emailConfig.create({
        data: {
          ...sanitized,
          userId,
        },
      });

  return record;
}

export function assembleEffectiveEmailConfig(stored?: Awaited<ReturnType<typeof getStoredEmailConfig>>): SanitizedEmailConfig {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    SMTP_RATE_LIMIT,
  } = process.env;

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

  if (!host) {
    throw new Error('SMTP host is required (set via environment variables or UI)');
  }

  if (!from) {
    throw new Error('SMTP from address is required (set SMTP_FROM or configure in UI)');
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
  };
}
