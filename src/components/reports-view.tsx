import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  Mail, 
  Eye, 
  MousePointer, 
  FileText,
  TrendingUp,
  TrendingDown,
  Download
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useTranslation } from "../lib/i18n";
import { useAppData } from "../lib/app-data-context";
import { toast } from "sonner@2.0.3";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import type { Campaign } from "../types";

interface ReportsViewProps {
  onNavigate: (view: string) => void;
}

export function ReportsView({ onNavigate }: ReportsViewProps) {
  const { t } = useTranslation();
  const { campaigns, loading } = useAppData();
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + c.opened, 0);
  const totalClicked = campaigns.reduce((sum, c) => sum + c.clicked, 0);
  const totalSubmitted = campaigns.reduce((sum, c) => sum + c.submitted, 0);

  const metrics = [
    {
      label: 'Total Sent',
      value: totalSent,
      icon: Mail,
      change: '+12%',
      trending: 'up' as const
    },
    {
      label: 'Email Opens',
      value: totalOpened,
      percentage: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0',
      icon: Eye,
      change: '+8%',
      trending: 'up' as const
    },
    {
      label: 'Link Clicks',
      value: totalClicked,
      percentage: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0',
      icon: MousePointer,
      change: '-3%',
      trending: 'down' as const
    },
    {
      label: 'Submissions',
      value: totalSubmitted,
      percentage: totalSent > 0 ? ((totalSubmitted / totalSent) * 100).toFixed(1) : '0',
      icon: FileText,
      change: '-5%',
      trending: 'down' as const
    }
  ];

  const downloadCsv = (filename: string, rows: string[][]) => {
    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const safe = value ?? '';
            if (/[",\n]/.test(safe)) {
              return `"${safe.replace(/"/g, '""')}"`;
            }
            return safe;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportReport = () => {
    if (!campaigns.length) {
      toast('No campaign data to export yet');
      return;
    }
    const rows = [
      ['Campaign', 'Template', 'Status', 'Recipients', 'Sent', 'Opened', 'Clicked', 'Submitted', 'Open Rate', 'Click Rate', 'Submit Rate'],
      ...campaigns.map((campaign) => {
        const openRate = campaign.sent > 0 ? `${Math.round((campaign.opened / campaign.sent) * 100)}%` : '0%';
        const clickRate = campaign.sent > 0 ? `${Math.round((campaign.clicked / campaign.sent) * 100)}%` : '0%';
        const submitRate = campaign.sent > 0 ? `${Math.round((campaign.submitted / campaign.sent) * 100)}%` : '0%';
        return [
          campaign.name,
          campaign.template,
          campaign.status,
          String(campaign.recipients),
          String(campaign.sent),
          String(campaign.opened),
          String(campaign.clicked),
          String(campaign.submitted),
          openRate,
          clickRate,
          submitRate,
        ];
      }),
    ];

    downloadCsv(`campaign-report-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    toast.success('Campaign report exported');
  };

  const getCampaignRates = (campaign: Campaign) => {
    const sent = campaign.sent || campaign.recipients || 0;
    if (!sent) {
      return { open: 0, click: 0, submit: 0 };
    }
    return {
      open: Math.round((campaign.opened / sent) * 100),
      click: Math.round((campaign.clicked / sent) * 100),
      submit: Math.round((campaign.submitted / sent) * 100),
    };
  };

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDetailsDialogOpen(true);
  };

  const handleOpenInCampaigns = () => {
    if (selectedCampaign) {
      onNavigate('campaigns', { campaignId: selectedCampaign.id });
    } else {
      onNavigate('campaigns');
    }
    setDetailsDialogOpen(false);
  };

  return (
    <>
      {/* Fixed Header */}
      <div className="shrink-0 border-b bg-background px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t.reportsTitle}</h1>
            <p className="text-muted-foreground">{t.reportsSubtitle}</p>
          </div>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 size-4" />
            {t.exportReport}
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="space-y-6">

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-3xl font-semibold">{metric.value}</p>
                    {metric.percentage && (
                      <span className="text-sm text-muted-foreground">({metric.percentage}%)</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    {metric.trending === 'up' ? (
                      <TrendingUp className="size-3 text-green-600" />
                    ) : (
                      <TrendingDown className="size-3 text-red-600" />
                    )}
                    <span className={metric.trending === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {metric.change}
                    </span>
                    <span className="text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <metric.icon className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && campaigns.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Loading campaign performance...
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>{t.campaigns}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.recipients}</TableHead>
                  <TableHead>{t.openRate}</TableHead>
                  <TableHead>{t.clickRate}</TableHead>
                  <TableHead>{t.dataSubmissions}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const rates = getCampaignRates(campaign);

                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground">{campaign.template}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            campaign.status === 'running' ? 'bg-green-100 text-green-700' :
                            campaign.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            campaign.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.recipients}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{rates.open}%</span>
                          </div>
                          <Progress value={rates.open} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{rates.click}%</span>
                          </div>
                          <Progress value={rates.click} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{rates.submit}%</span>
                          </div>
                          <Progress value={rates.submit} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(campaign)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Timeline Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">First 24 Hours</p>
                  <Progress value={75} className="h-2" />
                </div>
                <span className="text-sm font-medium">75%</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Day 2-3</p>
                  <Progress value={15} className="h-2" />
                </div>
                <span className="text-sm font-medium">15%</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">After Day 3</p>
                  <Progress value={10} className="h-2" />
                </div>
                <span className="text-sm font-medium">10%</span>
              </div>
            </div>
            <div className="mt-6 rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Most users interact with phishing emails within the first 24 hours. This data helps optimize sending schedules.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { dept: 'Sales', risk: 45, count: 23 },
                { dept: 'Marketing', risk: 32, count: 15 },
                { dept: 'Finance', risk: 28, count: 8 },
                { dept: 'IT', risk: 12, count: 3 },
                { dept: 'HR', risk: 25, count: 7 }
              ].map((item) => (
                <div key={item.dept}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">{item.dept}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{item.count} clicked</span>
                      <Badge variant="outline">{item.risk}%</Badge>
                    </div>
                  </div>
                  <Progress value={item.risk} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
        </div>
      </div>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCampaign?.name || 'Campaign details'}</DialogTitle>
            <DialogDescription>
              {selectedCampaign?.template || 'Detailed performance metrics'}
            </DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground">Recipients</p>
                  <p className="text-lg font-semibold">{selectedCampaign.recipients}</p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline">{selectedCampaign.status}</Badge>
                </div>
              </div>
              {(() => {
                const rates = getCampaignRates(selectedCampaign);
                return (
                  <div className="space-y-4">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>Open Rate</span>
                        <span className="font-medium">{rates.open}%</span>
                      </div>
                      <Progress value={rates.open} className="h-2" />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>Click Rate</span>
                        <span className="font-medium">{rates.click}%</span>
                      </div>
                      <Progress value={rates.click} className="h-2" />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>Data Submissions</span>
                        <span className="font-medium">{rates.submit}%</span>
                      </div>
                      <Progress value={rates.submit} className="h-2" />
                    </div>
                  </div>
                );
              })()}
              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p>
                  Sent emails: <span className="font-medium text-foreground">{selectedCampaign.sent}</span>
                </p>
                <p>
                  Opened: <span className="font-medium text-foreground">{selectedCampaign.opened}</span>
                </p>
                <p>
                  Clicked: <span className="font-medium text-foreground">{selectedCampaign.clicked}</span>
                </p>
                <p>
                  Submitted: <span className="font-medium text-foreground">{selectedCampaign.submitted}</span>
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleOpenInCampaigns}>
              Open in Campaigns
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
