/**
 * Migration script that seeds the PostgreSQL database with data from
 * the legacy JSON store located in server/data/db.json.
 *
 * The script is intentionally defensive: it can be executed multiple times,
 * will not create duplicate records, and only inserts data that does not exist yet.
 *
 * Usage (will be wired into package scripts later):
 *   npx tsx server/scripts/migrate-json-to-postgres.ts
 */

import path from 'node:path';
import fs from 'node:fs/promises';
import { PrismaClient, Prisma, UserRole, CampaignStatus, CampaignRecipientStatus, AuditActionType } from '@prisma/client';

const prisma = new PrismaClient();

const LEGACY_DB_PATH = path.resolve(__dirname, '../data/db.json');

type LegacyCampaign = {
  id: string;
  name: string;
  status: string;
  templateId?: string;
  template?: string;
  recipients?: number;
  sent?: number;
  opened?: number;
  clicked?: number;
  submitted?: number;
  createdAt?: string;
  scheduledAt?: string;
};

type LegacyTemplate = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  variant?: string;
  thumbnailUrl?: string;
  subject: string;
  previewText?: string;
};

type LegacyRecipient = {
  id: string;
  name?: string;
  email: string;
  department?: string;
  position?: string;
  campaigns?: number;
  clickRate?: string;
};

type LegacyTeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  campaigns?: number;
  lastActive?: string;
};

type LegacyUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string;
};

type LegacyDbShape = {
  campaigns?: LegacyCampaign[];
  templates?: LegacyTemplate[];
  recipients?: LegacyRecipient[];
  teamMembers?: LegacyTeamMember[];
  users?: LegacyUser[];
};

async function readLegacyDatabase(): Promise<LegacyDbShape> {
  try {
    const raw = await fs.readFile(LEGACY_DB_PATH, 'utf-8');
    if (!raw.trim()) {
      return {};
    }
    return JSON.parse(raw);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn('[migrate-json-to-postgres] Legacy db.json not found, nothing to migrate.');
      return {};
    }
    throw error;
  }
}

function coerceUserRole(role?: string): UserRole {
  switch (role?.toLowerCase()) {
    case 'admin':
      return UserRole.ADMIN;
    case 'manager':
      return UserRole.MANAGER;
    case 'viewer':
      return UserRole.VIEWER;
    case 'auditor':
      return UserRole.AUDITOR;
    default:
      return UserRole.VIEWER;
  }
}

function coerceCampaignStatus(status?: string): CampaignStatus {
  switch (status?.toLowerCase()) {
    case 'draft':
      return CampaignStatus.DRAFT;
    case 'scheduled':
      return CampaignStatus.SCHEDULED;
    case 'running':
      return CampaignStatus.RUNNING;
    case 'completed':
      return CampaignStatus.COMPLETED;
    case 'cancelled':
    case 'canceled':
      return CampaignStatus.CANCELLED;
    default:
      return CampaignStatus.DRAFT;
  }
}

function coercePercentage(value?: string): number {
  if (!value) {
    return 0;
  }
  const numeric = Number(value.replace('%', '').trim());
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return Math.max(0, Math.min(100, numeric)) / 100;
}

function toDateOrNull(value?: string): Date | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function migrateUsers(users: LegacyUser[] = []) {
  if (!users.length) {
    return;
  }

  await Promise.all(
    users.map(async (user) => {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          name: user.name,
          role: coerceUserRole(user.role),
          passwordHash: user.passwordHash,
        },
        create: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: coerceUserRole(user.role),
          passwordHash: user.passwordHash,
        },
      });
    })
  );
}

async function migrateTeamMembers(teamMembers: LegacyTeamMember[] = []) {
  if (!teamMembers.length) {
    return;
  }

  await Promise.all(
    teamMembers.map(async (member) => {
      const role = coerceUserRole(member.role);

      await prisma.user.upsert({
        where: { email: member.email },
        update: {
          name: member.name,
          role,
        },
        create: {
          id: member.id,
          email: member.email,
          name: member.name,
          role,
          passwordHash: '',
        },
      });

      const user = await prisma.user.findUnique({ where: { email: member.email } });
      if (!user) {
        return;
      }

      await prisma.teamMember.upsert({
        where: { userId: user.id },
        update: {
          name: member.name,
          email: member.email,
          teamName: null,
          role,
          campaignCount: member.campaigns ?? 0,
          lastActiveLabel: member.lastActive ?? null,
        },
        create: {
          id: member.id,
          userId: user.id,
          name: member.name,
          email: member.email,
          role,
          campaignCount: member.campaigns ?? 0,
          lastActiveLabel: member.lastActive ?? null,
        },
      });
    })
  );
}

async function migrateTemplates(templates: LegacyTemplate[] = []) {
  if (!templates.length) {
    return;
  }

  await Promise.all(
    templates.map(async (template) => {
      await prisma.template.upsert({
        where: { id: template.id },
        update: {
          name: template.name,
          description: template.description ?? null,
          category: template.category ?? null,
          variant: template.variant ?? null,
          tags: template.tags ?? [],
          thumbnailUrl: template.thumbnailUrl ?? null,
          subject: template.subject,
          previewText: template.previewText ?? null,
        },
        create: {
          id: template.id,
          name: template.name,
          description: template.description ?? null,
          category: template.category ?? null,
          variant: template.variant ?? null,
          tags: template.tags ?? [],
          thumbnailUrl: template.thumbnailUrl ?? null,
          subject: template.subject,
          previewText: template.previewText ?? null,
        },
      });
    })
  );
}

async function migrateRecipients(recipients: LegacyRecipient[] = []) {
  if (!recipients.length) {
    return;
  }

  await Promise.all(
    recipients.map(async (recipient) => {
      await prisma.recipient.upsert({
        where: { email: recipient.email },
        update: {
          name: recipient.name ?? null,
          department: recipient.department ?? null,
          position: recipient.position ?? null,
          campaignCount: recipient.campaigns ?? 0,
          clickRate: coercePercentage(recipient.clickRate),
        },
        create: {
          id: recipient.id,
          email: recipient.email,
          name: recipient.name ?? null,
          department: recipient.department ?? null,
          position: recipient.position ?? null,
          campaignCount: recipient.campaigns ?? 0,
          clickRate: coercePercentage(recipient.clickRate),
        },
      });
    })
  );
}

async function migrateCampaigns(campaigns: LegacyCampaign[] = []) {
  if (!campaigns.length) {
    return;
  }

  await Promise.all(
    campaigns.map(async (campaign) => {
      const createdAt = toDateOrNull(campaign.createdAt) ?? new Date();
      const scheduledAt = toDateOrNull(campaign.scheduledAt);

      await prisma.campaign.upsert({
        where: { id: campaign.id },
        update: {
          name: campaign.name,
          status: coerceCampaignStatus(campaign.status),
          templateId: campaign.templateId ?? null,
          scheduledAt,
          createdAt,
          recipientsCount: campaign.recipients ?? 0,
          sentCount: campaign.sent ?? 0,
          openedCount: campaign.opened ?? 0,
          clickedCount: campaign.clicked ?? 0,
          submittedCount: campaign.submitted ?? 0,
        },
        create: {
          id: campaign.id,
          name: campaign.name,
          status: coerceCampaignStatus(campaign.status),
          templateId: campaign.templateId ?? null,
          scheduledAt,
          createdAt,
          recipientsCount: campaign.recipients ?? 0,
          sentCount: campaign.sent ?? 0,
          openedCount: campaign.opened ?? 0,
          clickedCount: campaign.clicked ?? 0,
          submittedCount: campaign.submitted ?? 0,
        },
      });
    })
  );
}

async function migrateAuditSeed(users: LegacyUser[] = []) {
  if (!users.length) {
    return;
  }

  await Promise.all(
    users.map(async (user) => {
      await prisma.auditLog.upsert({
        where: {
          id: `bootstrap-${user.id}`,
        },
        update: {},
        create: {
          id: `bootstrap-${user.id}`,
          userId: user.id,
          action: AuditActionType.SECURITY_EVENT,
          resourceType: 'user',
          resourceId: user.id,
          metadata: {
            reason: 'bootstrap-import',
          } satisfies Prisma.JsonObject,
        },
      });
    })
  );
}

async function runMigration() {
  const legacyDb = await readLegacyDatabase();

  await prisma.$transaction(async () => {
    await migrateUsers(legacyDb.users ?? []);
    await migrateTeamMembers(legacyDb.teamMembers ?? []);
    await migrateTemplates(legacyDb.templates ?? []);
    await migrateRecipients(legacyDb.recipients ?? []);
    await migrateCampaigns(legacyDb.campaigns ?? []);
    await migrateAuditSeed(legacyDb.users ?? []);
  });
}

async function main() {
  console.info('[migrate-json-to-postgres] Starting migration...');
  await runMigration();
  console.info('[migrate-json-to-postgres] Migration completed successfully.');
}

main()
  .catch((error) => {
    console.error('[migrate-json-to-postgres] Migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
