import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Mail, 
  Users, 
  Target, 
  TrendingUp, 
  Play,
  Calendar,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Progress } from "./ui/progress";
import { useTranslation } from "../lib/i18n";
import { useAppData } from "../lib/app-data-context";

interface DashboardViewProps {
  onNavigate: (view: string, data?: any) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const { t } = useTranslation();
  const { campaigns, loading } = useAppData();

  const totalRecipients = campaigns.reduce((sum, c) => sum + c.recipients, 0);
  const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + c.opened, 0);
  const totalClicked = campaigns.reduce((sum, c) => sum + c.clicked, 0);
  const totalSubmitted = campaigns.reduce((sum, c) => sum + c.submitted, 0);

  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0';
  const submitRate = totalSent > 0 ? ((totalSubmitted / totalSent) * 100).toFixed(1) : '0';

  const stats = [
    { label: t.totalRecipients, value: totalRecipients.toString(), icon: Users, color: 'text-blue-600' },
    { label: t.emailsSent, value: totalSent.toString(), icon: Mail, color: 'text-green-600' },
    { label: t.openRate, value: `${openRate}%`, icon: TrendingUp, color: 'text-purple-600' },
    { label: t.clickRate, value: `${clickRate}%`, icon: Target, color: 'text-orange-600' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="size-3" />;
      case 'completed': return <CheckCircle2 className="size-3" />;
      case 'scheduled': return <Calendar className="size-3" />;
      default: return <AlertCircle className="size-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'scheduled': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      {/* Fixed Header */}
      <div className="shrink-0 border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t.dashboardTitle}</h1>
            <p className="text-muted-foreground">{t.dashboardSubtitle}</p>
          </div>
          <Button onClick={() => onNavigate('builder')}>
            <Mail className="mr-2 size-4" />
            {t.newCampaign}
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {loading && campaigns.length === 0 && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Loading dashboard data...
              </CardContent>
            </Card>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
                </div>
                <div className={`rounded-lg bg-muted p-3 ${stat.color}`}>
                  <stat.icon className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign) => {
                const clickRate = campaign.sent > 0 
                  ? ((campaign.clicked / campaign.sent) * 100).toFixed(0) 
                  : '0';
                
                return (
                  <div key={campaign.id} className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <Badge variant="outline" className={getStatusColor(campaign.status)}>
                          {getStatusIcon(campaign.status)}
                          <span className="ml-1 capitalize">{campaign.status}</span>
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{campaign.recipients} recipients</span>
                        <span>•</span>
                        <span>{campaign.template}</span>
                      </div>
                      {campaign.sent > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Click Rate</span>
                            <span className="font-medium">{clickRate}%</span>
                          </div>
                          <Progress value={parseInt(clickRate)} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.performanceMetrics}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{t.emailOpens}</span>
                  <span className="text-sm text-muted-foreground">{totalOpened}/{totalSent}</span>
                </div>
                <Progress value={parseFloat(openRate)} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{t.linkClicks}</span>
                  <span className="text-sm text-muted-foreground">{totalClicked}/{totalSent}</span>
                </div>
                <Progress value={parseFloat(clickRate)} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{t.dataSubmissions}</span>
                  <span className="text-sm text-muted-foreground">{totalSubmitted}/{totalSent}</span>
                </div>
                <Progress value={parseFloat(submitRate)} className="h-2" />
              </div>
              
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="size-4 text-primary" />
                  <span className="font-medium">{t.riskScore}</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold">{submitRate}%</span>
                  <span className="text-sm text-muted-foreground">{t.ofUsersFellForPhishing}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.quickActions}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button variant="outline" className="justify-start" onClick={() => onNavigate('builder')}>
              <Mail className="mr-2 size-4" />
              {t.createCampaign}
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => onNavigate('templates')}>
              <FolderOpen className="mr-2 size-4" />
              {t.browseTemplates}
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => onNavigate('recipients')}>
              <Users className="mr-2 size-4" />
              {t.manageRecipients}
            </Button>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </>
  );
}

function FolderOpen(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
