import { ChangeEvent, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Mail,
  Globe,
  Bell,
  Shield,
  Database,
  Users,
  Send,
} from "lucide-react";
import { Separator } from "./ui/separator";
import { LdapSettings } from "./ldap-settings";
import { useTranslation } from "../lib/i18n";
import { apiClient } from "../lib/api-client";
import { toast } from "sonner@2.0.3";
import { Textarea } from "./ui/textarea";
import type { SmtpStatus, UpdateSmtpConfigPayload } from "../types";

interface SettingsViewProps {
  onNavigate: (view: string) => void;
}

export function SettingsView({ onNavigate }: SettingsViewProps) {
  const { t } = useTranslation();
  const [smtpStatus, setSmtpStatus] = useState<SmtpStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [smtpForm, setSmtpForm] = useState({
    host: '',
    port: '',
    secure: true,
    user: '',
    pass: '',
    from: '',
  });
  const [hasStoredPassword, setHasStoredPassword] = useState(false);
  const [clearStoredPassword, setClearStoredPassword] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSubject, setTestSubject] = useState('PhishLab SMTP Test');
  const [testMessage, setTestMessage] = useState('This is a test email from PhishLab.');
  const [sendingTest, setSendingTest] = useState(false);
  const envKeyLabels: Record<string, string> = {
    host: 'SMTP_HOST',
    port: 'SMTP_PORT',
    secure: 'SMTP_SECURE',
    user: 'SMTP_USER',
    pass: 'SMTP_PASS',
    from: 'SMTP_FROM',
  };

  const loadStatus = async () => {
    try {
      setStatusLoading(true);
      const status = await apiClient.getEmailStatus();
      setSmtpStatus(status);
      if (status?.from) {
        setTestEmail((prev) => (prev ? prev : status.from || prev));
      }
    } catch (error) {
      console.error(error);
      setSmtpStatus({ configured: false, reason: error instanceof Error ? error.message : 'Unable to load SMTP status' });
    } finally {
      setStatusLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const config = await apiClient.getEmailConfig();
      setSmtpForm({
        host: config.host || '',
        port: config.port ? String(config.port) : '',
        secure: config.secure ?? false,
        user: config.user || '',
        pass: '',
        from: config.from || '',
      });
      setHasStoredPassword(Boolean(config.hasPassword));
      setClearStoredPassword(false);
      if (config.from) {
        setTestEmail((prev) => (prev ? prev : config.from || prev));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    void (async () => {
      await Promise.all([loadStatus(), loadConfig()]);
    })();
  }, []);

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Enter recipient email address');
      return;
    }
    try {
      setSendingTest(true);
      const result = await apiClient.sendTestEmail({ to: testEmail, subject: testSubject, message: testMessage });
      toast.success(`Test email sent (message ID: ${result?.messageId || 'n/a'})`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSavingConfig(true);
      const hostValue = smtpForm.host.trim();
      const userValue = smtpForm.user.trim();
      const fromValue = smtpForm.from.trim();
      const portValue = smtpForm.port.trim();

      const payload: UpdateSmtpConfigPayload = {
        host: hostValue,
        secure: smtpForm.secure,
        user: userValue,
        from: fromValue,
      };

      if (portValue === '') {
        payload.port = '';
      } else {
        payload.port = Number(portValue);
      }

      if (clearStoredPassword) {
        payload.pass = '';
      } else if (smtpForm.pass) {
        payload.pass = smtpForm.pass;
      }

      const updated = await apiClient.updateEmailConfig(payload);
      setSmtpForm({
        host: updated.host || '',
        port: updated.port ? String(updated.port) : '',
        secure: updated.secure ?? false,
        user: updated.user || '',
        pass: '',
        from: updated.from || '',
      });
      setHasStoredPassword(Boolean(updated.hasPassword));
      setClearStoredPassword(false);
      toast.success('SMTP settings saved');
      await loadStatus();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to save SMTP settings');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleFieldChange = (field: 'host' | 'port' | 'user' | 'pass' | 'from') => (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setSmtpForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'pass') {
      setClearStoredPassword(false);
      setHasStoredPassword(false);
    }
  };

  const handleSecureToggle = (checked: boolean) => {
    setSmtpForm((prev) => ({ ...prev, secure: checked }));
  };

  const handleClearPassword = () => {
    setClearStoredPassword(true);
    setHasStoredPassword(false);
    setSmtpForm((prev) => ({ ...prev, pass: '' }));
  };

  const handleResetConfig = () => {
    void loadConfig();
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
      <div className="space-y-6">
        <div>
          <h1>{t.settingsTitle}</h1>
          <p className="text-muted-foreground">{t.settingsSubtitle}</p>
        </div>

      <Tabs defaultValue="smtp" className="space-y-6">
        <TabsList>
          <TabsTrigger value="smtp">
            <Mail className="mr-2 size-4" />
            SMTP
          </TabsTrigger>
          <TabsTrigger value="domain">
            <Globe className="mr-2 size-4" />
            Domain
          </TabsTrigger>
          <TabsTrigger value="ldap">
            <Users className="mr-2 size-4" />
            Active Directory
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 size-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 size-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    placeholder="smtp.gmail.com"
                    value={smtpForm.host}
                    onChange={handleFieldChange('host')}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">Port</Label>
                    <Input
                      id="smtp-port"
                      placeholder="587"
                      value={smtpForm.port}
                      onChange={handleFieldChange('port')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-secure">Secure (TLS/SSL)</Label>
                    <div className="flex items-center gap-3 rounded-md border px-3 py-2">
                      <Switch
                        id="smtp-secure"
                        checked={smtpForm.secure}
                        onCheckedChange={handleSecureToggle}
                      />
                      <span className="text-sm text-muted-foreground">
                        {smtpForm.secure ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">Username</Label>
                  <Input
                    id="smtp-username"
                    placeholder="your-email@company.com"
                    value={smtpForm.user}
                    onChange={handleFieldChange('user')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="smtp-password"
                      type="password"
                      placeholder={hasStoredPassword && !clearStoredPassword ? '•••••••• (stored)' : 'Optional password'}
                      value={smtpForm.pass}
                      onChange={handleFieldChange('pass')}
                    />
                    {hasStoredPassword && !clearStoredPassword && (
                      <Button type="button" variant="outline" size="sm" onClick={handleClearPassword}>
                        Clear
                      </Button>
                    )}
                  </div>
                  {hasStoredPassword && !clearStoredPassword && (
                    <p className="text-xs text-muted-foreground">
                      A password is stored on the server. Leave blank to keep it.
                    </p>
                  )}
                  {clearStoredPassword && (
                    <p className="text-xs text-muted-foreground text-destructive">
                      Password will be removed on save.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-from">From Address</Label>
                  <Input
                    id="smtp-from"
                    placeholder="noreply@company.com"
                    value={smtpForm.from}
                    onChange={handleFieldChange('from')}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Alternative Providers</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Button variant="outline" className="justify-start">
                    <Mail className="mr-2 size-4" />
                    SendGrid
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Database className="mr-2 size-4" />
                    Amazon SES
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Mail className="mr-2 size-4" />
                    Mailgun
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={handleResetConfig} disabled={savingConfig}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void handleSaveConfig()} disabled={savingConfig}>
                  {savingConfig ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SMTP Status & Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                {statusLoading ? (
                  <p>Checking SMTP configuration…</p>
                ) : smtpStatus?.configured ? (
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">SMTP configured</p>
                    <p className="text-muted-foreground">Host: {smtpStatus.host}</p>
                    <p className="text-muted-foreground">From: {smtpStatus.from}</p>
                    <p className="text-muted-foreground">Secure: {smtpStatus.secure ? 'Yes' : 'No'}</p>
                    <p className="text-muted-foreground">Auth: {smtpStatus.hasAuth ? 'Username & password set' : 'No authentication (open relay)'}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-medium text-destructive">SMTP not configured</p>
                    <p className="text-muted-foreground">{smtpStatus?.reason || 'Missing environment variables. Update your deployment to include SMTP credentials.'}</p>
                  </div>
                )}
                {!statusLoading && smtpStatus?.stored && (
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    <p>Stored host: {smtpStatus.stored.host || '—'}</p>
                    <p>Stored from: {smtpStatus.stored.from || '—'}</p>
                    <p>Stored port: {smtpStatus.stored.port ?? '—'}</p>
                    <p>Stored auth: {smtpStatus.stored.hasPassword ? 'Password stored' : 'No password stored'}</p>
                  </div>
                )}
                {!statusLoading && smtpStatus?.usingEnv && Object.values(smtpStatus.usingEnv).some(Boolean) && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Environment overrides: {Object.entries(smtpStatus.usingEnv)
                      .filter(([, value]) => value)
                      .map(([key]) => envKeyLabels[key] || key)
                      .join(', ') || 'None'}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="test-to">Recipient</Label>
                  <Input
                    id="test-to"
                    type="email"
                    value={testEmail}
                    onChange={(event) => setTestEmail(event.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-subject">Subject</Label>
                  <Input
                    id="test-subject"
                    value={testSubject}
                    onChange={(event) => setTestSubject(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-message">Message</Label>
                <Textarea
                  id="test-message"
                  value={testMessage}
                  onChange={(event) => setTestMessage(event.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" onClick={() => void handleSendTestEmail()} disabled={sendingTest}>
                  <Send className="mr-2 size-4" />
                  {sendingTest ? 'Sending…' : 'Send Test Email'}
                </Button>
                <Button variant="outline" type="button" onClick={() => void loadStatus()} disabled={statusLoading}>
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain">
          <Card>
            <CardHeader>
              <CardTitle>Domain Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="landing-domain">Landing Page Domain</Label>
                  <Input id="landing-domain" placeholder="phishing-test.company.com" />
                  <p className="text-sm text-muted-foreground">
                    Domain used for phishing landing pages
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tracking-domain">Tracking Domain</Label>
                  <Input id="tracking-domain" placeholder="track.company.com" />
                  <p className="text-sm text-muted-foreground">
                    Domain used for link tracking
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">SSL Certificate</h4>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Valid SSL Certificate</p>
                    <p className="text-sm text-muted-foreground">Expires: Dec 31, 2025</p>
                  </div>
                  <Button variant="outline" size="sm">Renew</Button>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={handleResetConfig} disabled={savingConfig}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void handleSaveConfig()} disabled={savingConfig}>
                  {savingConfig ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ldap">
          <LdapSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Campaign Started</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when a campaign begins
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Campaign Completed</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when a campaign finishes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>High Risk User Detected</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when a user submits credentials
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Summary</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly report of all campaigns
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input 
                  id="notification-email" 
                  type="email"
                  placeholder="admin@company.com" 
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={handleResetConfig} disabled={savingConfig}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void handleSaveConfig()} disabled={savingConfig}>
                  {savingConfig ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Log all user actions and system events
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require 2FA for Admins</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce two-factor authentication
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-lock Sessions</Label>
                    <p className="text-sm text-muted-foreground">
                      Lock inactive sessions after 30 minutes
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">API Access</h4>
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="api-key" 
                      value="sk_live_••••••••••••••••••••••••" 
                      readOnly
                    />
                    <Button variant="outline">Regenerate</Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={handleResetConfig} disabled={savingConfig}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void handleSaveConfig()} disabled={savingConfig}>
                  {savingConfig ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
