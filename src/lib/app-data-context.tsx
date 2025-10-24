import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { apiClient } from './api-client';
import type {
  Campaign,
  CreateCampaignPayload,
  InviteMemberPayload,
  Recipient,
  TeamMember,
  Template,
  UpdateCampaignPayload,
  UpdateTeamMemberPayload,
} from '../types';

interface AppDataContextValue {
  loading: boolean;
  error?: string;
  templates: Template[];
  campaigns: Campaign[];
  recipients: Recipient[];
  teamMembers: TeamMember[];
  refreshAll: () => Promise<void>;
  createCampaign: (payload: CreateCampaignPayload) => Promise<Campaign>;
  updateCampaign: (id: string, payload: UpdateCampaignPayload) => Promise<Campaign>;
  deleteCampaign: (id: string) => Promise<void>;
  inviteTeamMember: (payload: InviteMemberPayload) => Promise<TeamMember>;
  updateTeamMember: (id: string, payload: UpdateTeamMemberPayload) => Promise<TeamMember>;
  deleteTeamMember: (id: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [templatesData, campaignsData, recipientsData, teamData] = await Promise.all([
        apiClient.getTemplates(),
        apiClient.getCampaigns(),
        apiClient.getRecipients(),
        apiClient.getTeamMembers(),
      ]);

      setTemplates(templatesData);
      setCampaigns(campaignsData);
      setRecipients(recipientsData);
      setTeamMembers(teamData);
      setError(undefined);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const createCampaign = useCallback(async (payload: CreateCampaignPayload) => {
    const created = await apiClient.createCampaign(payload);
    setCampaigns((prev) => [...prev, created]);
    return created;
  }, []);

  const updateCampaign = useCallback(async (id: string, payload: UpdateCampaignPayload) => {
    const updated = await apiClient.updateCampaign(id, payload);
    setCampaigns((prev) => prev.map((campaign) => (campaign.id === id ? updated : campaign)));
    return updated;
  }, []);

  const deleteCampaign = useCallback(async (id: string) => {
    await apiClient.deleteCampaign(id);
    setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
  }, []);

  const inviteTeamMember = useCallback(async (payload: InviteMemberPayload) => {
    const created = await apiClient.inviteTeamMember(payload);
    setTeamMembers((prev) => [...prev, created]);
    return created;
  }, []);

  const updateTeamMember = useCallback(async (id: string, payload: UpdateTeamMemberPayload) => {
    const updated = await apiClient.updateTeamMember(id, payload);
    setTeamMembers((prev) => prev.map((member) => (member.id === id ? updated : member)));
    return updated;
  }, []);

  const deleteTeamMember = useCallback(async (id: string) => {
    await apiClient.deleteTeamMember(id);
    setTeamMembers((prev) => prev.filter((member) => member.id !== id));
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      loading,
      error,
      templates,
      campaigns,
      recipients,
      teamMembers,
      refreshAll,
      createCampaign,
      updateCampaign,
      deleteCampaign,
      inviteTeamMember,
      updateTeamMember,
      deleteTeamMember,
    }),
    [
      loading,
      error,
      templates,
      campaigns,
      recipients,
      teamMembers,
      refreshAll,
      createCampaign,
      updateCampaign,
      deleteCampaign,
      inviteTeamMember,
      updateTeamMember,
      deleteTeamMember,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
