export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'completed';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  variant: 'corporate' | 'casual';
  thumbnailUrl: string;
  subject: string;
  previewText: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  templateId?: string;
  template: string;
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  submitted: number;
  createdAt: string;
  scheduledAt?: string;
}

export interface Recipient {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  campaigns: number;
  clickRate: string;
}

export interface CreateRecipientPayload {
  name: string;
  email: string;
  department?: string;
  position?: string;
  campaigns?: number;
  clickRate?: string | number;
}

export interface DirectoryRecipientInput {
  name?: string;
  email: string;
  department?: string;
  position?: string;
  campaigns?: number;
  clickRate?: string | number;
}

export interface DirectoryImportRequest {
  entries?: DirectoryRecipientInput[];
  text?: string;
}

export interface RecipientImportResult {
  source: 'csv' | 'google_sheets' | 'directory';
  added: number;
  updated: number;
  total: number;
  skipped: Array<{ email: string; reason: string }>;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  campaigns: number;
  lastActive: string;
}

export interface CreateCampaignPayload {
  name: string;
  description?: string;
  templateId: string;
  recipientCount: number;
  sendTime: 'immediate' | 'scheduled';
  scheduleDate?: string;
}

export interface UpdateCampaignPayload extends Partial<Omit<Campaign, 'id'>> {}

export interface InviteMemberPayload {
  email: string;
  role: string;
  name?: string;
}

export interface UpdateTeamMemberPayload extends Partial<Omit<TeamMember, 'id'>> {}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface SmtpTestPayload {
  to: string;
  subject?: string;
  message?: string;
}

export interface SmtpConfig {
  host: string;
  port?: number | '';
  secure: boolean;
  user?: string;
  from: string;
  hasPassword?: boolean;
}

export interface UpdateSmtpConfigPayload {
  host?: string;
  port?: number | string;
  secure?: boolean;
  user?: string;
  pass?: string;
  from?: string;
}

export interface SmtpStatus {
  configured: boolean;
  reason?: string;
  host?: string;
  from?: string;
  secure?: boolean;
  hasAuth?: boolean;
  usingEnv?: Record<string, boolean>;
  stored?: {
    host?: string | null;
    port?: number | null;
    secure?: boolean | null;
    user?: string | null;
    hasPassword?: boolean;
    from?: string | null;
  };
}
