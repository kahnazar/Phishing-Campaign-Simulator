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
  Users
} from "lucide-react";
import { Separator } from "./ui/separator";
import { LdapSettings } from "./ldap-settings";
import { useTranslation } from "../lib/i18n";

interface SettingsViewProps {
  onNavigate: (view: string) => void;
}

export function SettingsView({ onNavigate }: SettingsViewProps) {
  const { t } = useTranslation();
  
  return (
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
                  <Input id="smtp-host" placeholder="smtp.gmail.com" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">Port</Label>
                    <Input id="smtp-port" placeholder="587" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-encryption">Encryption</Label>
                    <Input id="smtp-encryption" placeholder="TLS" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">Username</Label>
                  <Input id="smtp-username" placeholder="your-email@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">Password</Label>
                  <Input id="smtp-password" type="password" placeholder="••••••••" />
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

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Test Configuration</Label>
                  <p className="text-sm text-muted-foreground">
                    Send a test email to verify your SMTP settings
                  </p>
                </div>
                <Button variant="outline">Send Test</Button>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
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
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
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
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
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
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
