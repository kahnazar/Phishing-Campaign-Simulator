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

interface ReportsViewProps {
  onNavigate: (view: string) => void;
}

export function ReportsView({ onNavigate }: ReportsViewProps) {
  const { t } = useTranslation();
  const { campaigns, loading } = useAppData();
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

  return (
    <>
      {/* Fixed Header */}
      <div className="shrink-0 border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t.reportsTitle}</h1>
            <p className="text-muted-foreground">{t.reportsSubtitle}</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 size-4" />
            {t.exportReport}
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>Click Rate</TableHead>
                <TableHead>Submit Rate</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const openRate = campaign.sent > 0 
                  ? ((campaign.opened / campaign.sent) * 100).toFixed(0) 
                  : '0';
                const clickRate = campaign.sent > 0 
                  ? ((campaign.clicked / campaign.sent) * 100).toFixed(0) 
                  : '0';
                const submitRate = campaign.sent > 0 
                  ? ((campaign.submitted / campaign.sent) * 100).toFixed(0) 
                  : '0';

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
                          <span>{openRate}%</span>
                        </div>
                        <Progress value={parseInt(openRate)} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{clickRate}%</span>
                        </div>
                        <Progress value={parseInt(clickRate)} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{submitRate}%</span>
                        </div>
                        <Progress value={parseInt(submitRate)} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
    </>
  );
}
