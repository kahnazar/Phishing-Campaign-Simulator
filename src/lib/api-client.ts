import type {
  Campaign,
  CreateCampaignPayload,
  Recipient,
  TeamMember,
  Template,
  UpdateCampaignPayload,
  InviteMemberPayload,
  UpdateTeamMemberPayload,
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }
  return response.json() as Promise<T>;
}

export const apiClient = {
  async getTemplates(): Promise<Template[]> {
    const response = await fetch(`${API_BASE}/templates`);
    return handleResponse<Template[]>(response);
  },
  async getCampaigns(): Promise<Campaign[]> {
    const response = await fetch(`${API_BASE}/campaigns`);
    return handleResponse<Campaign[]>(response);
  },
  async createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
    const response = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Campaign>(response);
  },
  async updateCampaign(id: string, payload: UpdateCampaignPayload): Promise<Campaign> {
    const response = await fetch(`${API_BASE}/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Campaign>(response);
  },
  async deleteCampaign(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/campaigns/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Failed to delete campaign');
    }
  },
  async getRecipients(): Promise<Recipient[]> {
    const response = await fetch(`${API_BASE}/recipients`);
    return handleResponse<Recipient[]>(response);
  },
  async getTeamMembers(): Promise<TeamMember[]> {
    const response = await fetch(`${API_BASE}/team`);
    return handleResponse<TeamMember[]>(response);
  },
  async inviteTeamMember(payload: InviteMemberPayload): Promise<TeamMember> {
    const response = await fetch(`${API_BASE}/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<TeamMember>(response);
  },
  async updateTeamMember(id: string, payload: UpdateTeamMemberPayload): Promise<TeamMember> {
    const response = await fetch(`${API_BASE}/team/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<TeamMember>(response);
  },
  async deleteTeamMember(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/team/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Failed to delete team member');
    }
  },
};
