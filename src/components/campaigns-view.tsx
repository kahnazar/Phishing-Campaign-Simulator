import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { 
  Mail, 
  Play,
  Pause,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy
} from "lucide-react";
import { Progress } from "./ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";
import { useTranslation } from "../lib/i18n";
import { useAppData } from "../lib/app-data-context";
import { toast } from "sonner@2.0.3";

interface CampaignsViewProps {
  onNavigate: (view: string, data?: any) => void;
}

export function CampaignsView({ onNavigate }: CampaignsViewProps) {
  const { t } = useTranslation();
  const { campaigns, loading, deleteCampaign } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.template.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="size-3" />;
      case 'completed': return <CheckCircle2 className="size-3" />;
      case 'scheduled': return <Calendar className="size-3" />;
      default: return <Pause className="size-3" />;
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

  const stats = [
    { label: 'Total Campaigns', value: campaigns.length },
    { label: 'Active', value: campaigns.filter(c => c.status === 'running').length },
    { label: 'Scheduled', value: campaigns.filter(c => c.status === 'scheduled').length },
    { label: 'Completed', value: campaigns.filter(c => c.status === 'completed').length }
  ];

  const handleDeleteCampaign = async (id: string) => {
    try {
      await deleteCampaign(id);
      toast.success('Campaign deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete campaign');
    }
  };

  return (
    <>
      {/* Fixed Header */}
      <div className="shrink-0 border-b bg-background px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t.campaignsTitle}</h1>
            <p className="text-muted-foreground">{t.campaignsSubtitle}</p>
          </div>
          <Button onClick={() => onNavigate('builder')}>
            <Mail className="mr-2 size-4" />
            {t.newCampaign}
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Campaigns</CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("running")}>
                    Running
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("scheduled")}>
                    Scheduled
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                    Draft
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCampaigns.map((campaign) => {
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
                <div key={campaign.id} className="rounded-lg border p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <Badge variant="outline" className={getStatusColor(campaign.status)}>
                          {getStatusIcon(campaign.status)}
                          <span className="ml-1 capitalize">{campaign.status}</span>
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="size-3" />
                          {campaign.template}
                        </span>
                        <span>•</span>
                        <span>{campaign.recipients} {t.recipientCountLabel}</span>
                        {campaign.scheduledAt && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3" />
                              {new Date(campaign.scheduledAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>

                      {campaign.sent > 0 && (
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Opens</span>
                              <span className="font-medium">{openRate}%</span>
                            </div>
                            <Progress value={parseInt(openRate)} className="h-2" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Clicks</span>
                              <span className="font-medium">{clickRate}%</span>
                            </div>
                            <Progress value={parseInt(clickRate)} className="h-2" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Submits</span>
                              <span className="font-medium">{submitRate}%</span>
                            </div>
                            <Progress value={parseInt(submitRate)} className="h-2" />
                          </div>
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onNavigate('reports')}>
                          <CheckCircle2 className="mr-2 size-4" />
                          View Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNavigate('editor')}>
                          <Edit className="mr-2 size-4" />
                          Edit Campaign
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 size-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCampaigns.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
              <Mail className="mb-4 size-12 text-muted-foreground" />
              <h3>No campaigns found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
              <Button className="mt-4" onClick={() => onNavigate('builder')}>
                Create Campaign
              </Button>
            </div>
          )}
          {loading && campaigns.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-sm text-muted-foreground">
              Loading campaigns...
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </div>
    </>
  );
}
