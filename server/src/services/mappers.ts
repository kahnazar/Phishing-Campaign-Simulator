import type { Campaign, Template, Recipient, TeamMember } from '@prisma/client';
import type { ApiCampaign, ApiRecipient, ApiTeamMember, ApiTemplate } from '../types/api';

export function mapTemplate(template: Template): ApiTemplate {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags ?? [],
    variant: template.variant,
    thumbnailUrl: template.thumbnailUrl,
    subject: template.subject,
    previewText: template.previewText,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
    createdAt: template.createdAt?.toISOString?.() ?? undefined,
    updatedAt: template.updatedAt?.toISOString?.() ?? undefined,
  };
}

export function mapCampaign(campaign: Campaign & { template?: Template | null }): ApiCampaign {
  return {
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    status: campaign.status,
    templateId: campaign.templateId,
    template: campaign.template?.name ?? null,
    recipients: campaign.recipientsCount ?? 0,
    sent: campaign.sentCount ?? 0,
    opened: campaign.openedCount ?? 0,
    clicked: campaign.clickedCount ?? 0,
    submitted: campaign.submittedCount ?? 0,
    createdAt: campaign.createdAt?.toISOString?.(),
    scheduledAt: campaign.scheduledAt?.toISOString?.() ?? null,
    launchedAt: campaign.launchedAt?.toISOString?.() ?? null,
    completedAt: campaign.completedAt?.toISOString?.() ?? null,
  };
}

export function mapRecipient(recipient: Recipient): ApiRecipient {
  return {
    id: recipient.id,
    name: recipient.name ?? 'Recipient',
    email: recipient.email,
    department: recipient.department ?? 'General',
    position: recipient.position ?? 'Employee',
    campaigns: recipient.campaignCount ?? 0,
    clickRate: `${Math.round((recipient.clickRate ?? 0) * 100)}%`,
    lastEngagedAt: recipient.lastEngagedAt?.toISOString?.() ?? null,
  };
}

export function mapTeamMember(teamMember: TeamMember): ApiTeamMember {
  return {
    id: teamMember.id,
    name: teamMember.name,
    email: teamMember.email,
    role: teamMember.role,
    campaigns: teamMember.campaignCount ?? 0,
    lastActive: teamMember.lastActiveLabel ?? null,
  };
}
