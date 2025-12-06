import type { Template } from './templateService';
import type { Campaign, CampaignWithTemplate } from './campaignService';
import type { Recipient } from './recipientService';
import type { TeamMemberWithUser } from './teamService';
import type { UserRole } from './userService';

export type ApiTemplate = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  tags: string[];
  variant?: string | null;
  thumbnailUrl?: string | null;
  subject: string;
  previewText?: string | null;
  htmlContent?: string | null;
  textContent?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiCampaign = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  templateId?: string | null;
  template?: string | null;
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  submitted: number;
  createdAt?: string;
  scheduledAt?: string | null;
  launchedAt?: string | null;
  completedAt?: string | null;
};

export type ApiRecipient = {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  campaigns: number;
  clickRate: string;
  lastEngagedAt?: string | null;
};

export type ApiTeamMember = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  campaigns: number;
  lastActive: string | null;
};

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
    createdAt: template.createdAt?.toISOString(),
    updatedAt: template.updatedAt?.toISOString(),
  };
}

export function mapCampaign(campaign: CampaignWithTemplate): ApiCampaign {
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
    createdAt: campaign.createdAt?.toISOString(),
    scheduledAt: campaign.scheduledAt?.toISOString() ?? null,
    launchedAt: campaign.launchedAt?.toISOString() ?? null,
    completedAt: campaign.completedAt?.toISOString() ?? null,
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
    lastEngagedAt: recipient.lastEngagedAt?.toISOString() ?? null,
  };
}

export function mapTeamMember(teamMember: TeamMemberWithUser): ApiTeamMember {
  return {
    id: teamMember.id,
    name: teamMember.name,
    email: teamMember.email,
    role: teamMember.user?.role ?? teamMember.role,
    campaigns: teamMember.campaignCount ?? 0,
    lastActive: teamMember.lastActiveLabel ?? null,
  };
}

