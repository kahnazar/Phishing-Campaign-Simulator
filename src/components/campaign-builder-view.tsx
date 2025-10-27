import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { 
  CheckCircle2, 
  Mail, 
  Users, 
  Calendar,
  ChevronRight,
  ChevronLeft,
  Eye,
  Edit
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";
import { useAppData } from "../lib/app-data-context";

interface CampaignBuilderViewProps {
  onNavigate: (view: string, data?: any) => void;
}

export function CampaignBuilderView({ onNavigate }: CampaignBuilderViewProps) {
  const { templates, createCampaign, loading } = useAppData();
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [recipientCount, setRecipientCount] = useState("100");
  const [sendTime, setSendTime] = useState<'immediate' | 'scheduled'>('scheduled');
  const [scheduleDate, setScheduleDate] = useState("2025-10-20T14:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { number: 1, title: "Details", icon: Mail },
    { number: 2, title: "Template", icon: Mail },
    { number: 3, title: "Recipients", icon: Users },
    { number: 4, title: "Schedule", icon: Calendar }
  ];

  const canProceed = () => {
    switch (step) {
      case 1: return campaignName.trim() !== '';
      case 2: return selectedTemplate !== null;
      case 3: return parseInt(recipientCount) > 0;
      case 4: return sendTime === 'immediate' || scheduleDate !== '';
      default: return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error('Please complete the required fields');
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    if (!canProceed()) {
      toast.error('Please complete all required fields');
      return;
    }
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    try {
      setIsSubmitting(true);
      await createCampaign({
        name: campaignName.trim(),
        description: campaignDescription.trim() || undefined,
        templateId: selectedTemplate,
        recipientCount: parseInt(recipientCount, 10),
        sendTime,
        scheduleDate: sendTime === 'scheduled' ? scheduleDate : undefined,
      });
      toast.success('Campaign created successfully!');
      onNavigate('campaigns');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
      <div className="space-y-6">
        <div>
          <h1>Create Campaign</h1>
          <p className="text-muted-foreground">Set up a new phishing simulation campaign in 4 steps</p>
        </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((s, index) => (
          <div key={s.number} className="flex flex-1 items-center">
            <div className="flex items-center gap-3">
              <div className={`flex size-10 items-center justify-center rounded-full transition-all ${
                s.number < step ? 'bg-primary text-primary-foreground' :
                s.number === step ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                'bg-muted text-muted-foreground'
              }`}>
                {s.number < step ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <span>{s.number}</span>
                )}
              </div>
              <div className="hidden sm:block">
                <p className={`text-sm font-medium ${s.number === step ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.title}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`mx-4 h-0.5 flex-1 transition-all ${
                s.number < step ? 'bg-primary' : 'bg-border'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step {step}: {steps[step - 1].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Campaign Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name *</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Q4 Security Awareness Training"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose of this campaign..."
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="mb-2 font-medium">Campaign Goals</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Test employee awareness of phishing attacks</li>
                  <li>• Identify high-risk users for additional training</li>
                  <li>• Track improvements over time</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Select Template */}
          {step === 2 && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Select a template for your phishing simulation. You can customize it later.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading && templates.length === 0 ? (
                  <div className="col-span-full rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Loading templates...
                  </div>
                ) : templates.length === 0 ? (
                  <div className="col-span-full rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No templates available. Please add templates to the system.
                  </div>
                ) : (
                  templates.slice(0, 8).map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`group cursor-pointer rounded-lg border-2 transition-all ${
                        selectedTemplate === template.id
                          ? 'border-primary shadow-lg ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50 hover:shadow-md'
                      }`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg bg-muted">
                        <ImageWithFallback
                          src={template.thumbnailUrl}
                          alt={template.name}
                          className="size-full object-cover transition-transform group-hover:scale-105"
                        />
                        {selectedTemplate === template.id && (
                          <div className="absolute right-2 top-2">
                            <div className="rounded-full bg-primary p-1 shadow-lg">
                              <CheckCircle2 className="size-3.5 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                        <div className="absolute left-2 top-2">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 backdrop-blur-sm">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="mb-1 text-sm font-medium line-clamp-1">{template.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {template.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {selectedTemplate && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => onNavigate('templates')}
                  >
                    Browse All Templates
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const template = templates.find(t => t.id === selectedTemplate);
                      onNavigate('editor', { template });
                    }}
                  >
                    <Edit className="mr-2 size-4" />
                    Customize Template
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Recipients */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Import Recipients</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button variant="outline" className="h-24 flex-col gap-2">
                    <Users className="size-6" />
                    <span>Upload CSV</span>
                    <span className="text-xs text-muted-foreground">Import from file</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2">
                    <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Google Sheets</span>
                    <span className="text-xs text-muted-foreground">Sync from Sheets</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient-count">Number of Recipients *</Label>
                <Input
                  id="recipient-count"
                  type="number"
                  value={recipientCount}
                  onChange={(e) => setRecipientCount(e.target.value)}
                  min="1"
                />
                <p className="text-sm text-muted-foreground">
                  You can add recipients manually or import from a file
                </p>
              </div>

              <div className="rounded-lg border">
                <div className="border-b bg-muted/50 px-4 py-3">
                  <h4 className="font-medium">Available Groups</h4>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {[
                      { name: 'All Employees', count: 245 },
                      { name: 'IT Department', count: 42 },
                      { name: 'Management', count: 18 },
                      { name: 'Sales Team', count: 58 }
                    ].map((group) => (
                      <div key={group.name} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Users className="size-4 text-muted-foreground" />
                          <span className="font-medium">{group.name}</span>
                        </div>
                        <Badge variant="secondary">{group.count} users</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Schedule */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Send Time</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div
                    onClick={() => setSendTime('immediate')}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      sendTime === 'immediate' 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 size-4 rounded-full border-2 ${
                        sendTime === 'immediate' 
                          ? 'border-primary bg-primary' 
                          : 'border-muted-foreground'
                      }`}>
                        {sendTime === 'immediate' && (
                          <div className="size-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Send Immediately</p>
                        <p className="text-sm text-muted-foreground">
                          Campaign will start right after creation
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    onClick={() => setSendTime('scheduled')}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      sendTime === 'scheduled' 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 size-4 rounded-full border-2 ${
                        sendTime === 'scheduled' 
                          ? 'border-primary bg-primary' 
                          : 'border-muted-foreground'
                      }`}>
                        {sendTime === 'scheduled' && (
                          <div className="size-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Schedule for Later</p>
                        <p className="text-sm text-muted-foreground">
                          Choose a specific date and time
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {sendTime === 'scheduled' && (
                <div className="space-y-2">
                  <Label htmlFor="send-date">Schedule Date & Time</Label>
                  <Input
                    id="send-date"
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Campaign will be sent at the specified time in your timezone
                  </p>
                </div>
              )}

              <div className="rounded-lg border bg-primary/5">
                <div className="border-b bg-primary/10 px-4 py-3">
                  <h4 className="font-medium">Campaign Summary</h4>
                </div>
                <div className="p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start justify-between">
                      <span className="text-muted-foreground">Campaign Name:</span>
                      <span className="max-w-[200px] text-right font-medium">
                        {campaignName || 'Untitled Campaign'}
                      </span>
                    </div>
                    {campaignDescription && (
                      <div className="flex items-start justify-between">
                        <span className="text-muted-foreground">Description:</span>
                        <span className="max-w-[200px] text-right font-medium line-clamp-2">
                          {campaignDescription}
                        </span>
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <span className="text-muted-foreground">Template:</span>
                      <span className="max-w-[200px] text-right font-medium">
                        {selectedTemplateData?.name || 'Not selected'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-muted-foreground">Recipients:</span>
                      <span className="font-medium">{recipientCount} users</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-muted-foreground">Send Time:</span>
                      <span className="font-medium">
                        {sendTime === 'immediate' ? 'Immediately' : new Date(scheduleDate).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge>{sendTime === 'immediate' ? 'Ready' : 'Scheduled'}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                <div className="flex gap-3">
                  <Eye className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="space-y-1">
                    <p className="font-medium text-blue-900 dark:text-blue-100">Review Before Launch</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Make sure all details are correct. You can edit the campaign after creation, but sent emails cannot be recalled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
          className="sm:w-auto"
        >
          <ChevronLeft className="mr-2 size-4" />
          Back
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => onNavigate('campaigns')}
            className="sm:w-auto"
          >
            Cancel
          </Button>
          {step < 4 ? (
            <Button onClick={handleNext} disabled={!canProceed()} className="sm:w-auto">
              Next
              <ChevronRight className="ml-2 size-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={!canProceed() || isSubmitting} className="sm:w-auto">
              <CheckCircle2 className="mr-2 size-4" />
              {isSubmitting ? 'Launching...' : 'Launch Campaign'}
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
