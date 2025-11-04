import type { CampaignStatus, UserRole } from '@prisma/client';

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

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
  status: CampaignStatus | string;
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
