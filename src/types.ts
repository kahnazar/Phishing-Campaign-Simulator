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
