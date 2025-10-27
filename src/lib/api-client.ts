import type {
  AuthUser,
  Campaign,
  CreateCampaignPayload,
  InviteMemberPayload,
  LoginPayload,
  LoginResponse,
  Recipient,
  TeamMember,
  Template,
  UpdateCampaignPayload,
  UpdateTeamMemberPayload,
  SmtpTestPayload,
  SmtpConfig,
  UpdateSmtpConfigPayload,
  SmtpStatus,
  CreateRecipientPayload,
  RecipientImportResult,
  DirectoryRecipientInput,
  DirectoryImportRequest,
} from '../types';

const API_BASE = '/api';
let authToken: string | null = null;

function buildHeaders(init?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = init ? { ...init } : {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }
  return response.json() as Promise<T>;
}

export const apiClient = {
  setAuthToken(token: string | null) {
    authToken = token;
  },

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<LoginResponse>(response);
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: buildHeaders(),
    });
    return handleResponse<AuthUser>(response);
  },

  async getTemplates(): Promise<Template[]> {
    const response = await fetch(`${API_BASE}/templates`, {
      headers: buildHeaders(),
    });
    return handleResponse<Template[]>(response);
  },

  async getCampaigns(): Promise<Campaign[]> {
    const response = await fetch(`${API_BASE}/campaigns`, {
      headers: buildHeaders(),
    });
    return handleResponse<Campaign[]>(response);
  },

  async createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
    const response = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return handleResponse<Campaign>(response);
  },

  async updateCampaign(id: string, payload: UpdateCampaignPayload): Promise<Campaign> {
    const response = await fetch(`${API_BASE}/campaigns/${id}`, {
      method: 'PUT',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return handleResponse<Campaign>(response);
  },

  async deleteCampaign(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/campaigns/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Failed to delete campaign');
    }
  },

  async getRecipients(): Promise<Recipient[]> {
    const response = await fetch(`${API_BASE}/recipients`, {
      headers: buildHeaders(),
    });
    return handleResponse<Recipient[]>(response);
  },

  async createRecipient(payload: CreateRecipientPayload): Promise<Recipient> {
    const response = await fetch(`${API_BASE}/recipients`, {
      method: 'POST',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return handleResponse<Recipient>(response);
  },

  async importRecipientsFromCsv(csv: string, updateExisting = true): Promise<RecipientImportResult> {
    const response = await fetch(`${API_BASE}/recipients/import/csv`, {
      method: 'POST',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ csv, updateExisting }),
    });
    return handleResponse<RecipientImportResult>(response);
  },

  async importRecipientsFromGoogle(sheetUrl: string, updateExisting = true): Promise<RecipientImportResult> {
    const response = await fetch(`${API_BASE}/recipients/import/google`, {
      method: 'POST',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ sheetUrl, updateExisting }),
    });
    return handleResponse<RecipientImportResult>(response);
  },

  async importRecipientsFromDirectory(
    payload: DirectoryImportRequest,
    updateExisting = true,
  ): Promise<RecipientImportResult> {
    const body: Record<string, unknown> = { updateExisting };
    if (Array.isArray(payload.entries) && payload.entries.length > 0) {
      body.entries = payload.entries;
    }
    if (payload.text && payload.text.trim()) {
      body.text = payload.text;
    }
    const response = await fetch(`${API_BASE}/recipients/import/directory`, {
      method: 'POST',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    });
    return handleResponse<RecipientImportResult>(response);
  },

  async getTeamMembers(): Promise<TeamMember[]> {
    const response = await fetch(`${API_BASE}/team`, {
      headers: buildHeaders(),
    });
    return handleResponse<TeamMember[]>(response);
  },

  async inviteTeamMember(payload: InviteMemberPayload): Promise<TeamMember> {
    const response = await fetch(`${API_BASE}/team`, {
      method: 'POST',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return handleResponse<TeamMember>(response);
  },

  async updateTeamMember(id: string, payload: UpdateTeamMemberPayload): Promise<TeamMember> {
    const response = await fetch(`${API_BASE}/team/${id}`, {
      method: 'PUT',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return handleResponse<TeamMember>(response);
  },

  async deleteTeamMember(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/team/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Failed to delete team member');
    }
  },

  async getEmailStatus(): Promise<SmtpStatus> {
    const response = await fetch(`${API_BASE}/email/status`, {
      headers: buildHeaders(),
    });
    return handleResponse<SmtpStatus>(response);
  },

  async sendTestEmail(payload: SmtpTestPayload): Promise<any> {
    const response = await fetch(`${API_BASE}/email/test`, {
      method: 'POST',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  async getEmailConfig(): Promise<SmtpConfig> {
    const response = await fetch(`${API_BASE}/email/config`, {
      headers: buildHeaders(),
    });
    return handleResponse<SmtpConfig>(response);
  },

  async updateEmailConfig(payload: UpdateSmtpConfigPayload): Promise<SmtpConfig> {
    const response = await fetch(`${API_BASE}/email/config`, {
      method: 'PUT',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return handleResponse<SmtpConfig>(response);
  },
};
