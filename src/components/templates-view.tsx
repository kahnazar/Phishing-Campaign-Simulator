import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Edit, Eye, Plus, Upload } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useTranslation } from "../lib/i18n";
import { useAppData } from "../lib/app-data-context";

interface TemplatesViewProps {
  onNavigate: (view: string, data?: any) => void;
}

export function TemplatesView({ onNavigate }: TemplatesViewProps) {
  const { t } = useTranslation();
  const { templates, loading } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadedHtml, setUploadedHtml] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Enable horizontal scroll with mouse wheel
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      }
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    return () => scrollContainer.removeEventListener('wheel', handleWheel);
  }, []);

  const categories = ["all", ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      toast.error('Please upload an HTML file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setUploadedHtml(content);
      setUploadDialogOpen(true);
      toast.success('HTML file loaded successfully');
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleUseUploadedTemplate = () => {
    if (uploadedHtml) {
      onNavigate('editor', { customHtml: uploadedHtml });
      setUploadDialogOpen(false);
      setUploadedHtml(null);
    }
  };

  return (
    <>
      {/* Fixed Header */}
      <div className="shrink-0 border-b bg-background px-4 py-4 sm:px-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t.templatesTitle}</h1>
            <p className="text-muted-foreground">{t.templatesSubtitle}</p>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".html,.htm"
              onChange={handleFileUpload}
              className="hidden"
              id="html-template-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('html-template-upload')?.click()}
            >
              <Upload className="mr-2 size-4" />
              {t.uploadHTML}
            </Button>
            <Button onClick={() => onNavigate('editor')}>
              <Plus className="mr-2 size-4" />
              {t.createNew}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.searchTemplates}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {loading && templates.length === 0 && (
          <div className="col-span-full flex items-center justify-center rounded-lg border border-dashed py-16 text-sm text-muted-foreground">
            Loading templates...
          </div>
        )}
        {!loading && filteredTemplates.map((template) => (
          <Card key={template.id} className="group overflow-hidden transition-shadow hover:shadow-md">
            <div className="relative aspect-[3/2] overflow-hidden bg-muted">
              <ImageWithFallback
                src={template.thumbnailUrl}
                alt={template.name}
                className="size-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute right-1.5 top-1.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 backdrop-blur-sm">
                  {template.category}
                </Badge>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute bottom-2 left-2 right-2 flex gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 flex-1 text-[11px] px-2"
                    onClick={() => onNavigate('editor', { template })}
                  >
                    <Edit className="mr-1 size-2.5" />
                    {t.edit}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 w-7 p-0"
                    onClick={() => {}}
                  >
                    <Eye className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
            <CardContent className="p-2.5">
              <h4 className="mb-1 line-clamp-1 text-xs">{template.name}</h4>
              <p className="text-[10px] text-muted-foreground line-clamp-1 mb-1.5">
                {template.description}
              </p>
              <div className="flex flex-wrap gap-0.5">
                {template.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[9px] px-1 py-0 h-4">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 2 && (
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                    +{template.tags.length - 2}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && filteredTemplates.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <Search className="mb-4 size-12 text-muted-foreground" />
            <h3>{t.noTemplatesFound}</h3>
            <p className="text-muted-foreground">{t.tryAdjustingFilters}</p>
          </div>
        )}
        </div>
      </div>

      {/* Upload Preview Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{t.previewUploadedTemplate}</DialogTitle>
            <DialogDescription>
              {t.reviewHTMLTemplate}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border">
              <div className="border-b bg-muted/50 p-3">
                <Badge variant="outline">{t.htmlPreview}</Badge>
              </div>
              <iframe
                srcDoc={uploadedHtml || ''}
                className="h-[400px] w-full border-0"
                title="Template Preview"
                sandbox="allow-same-origin"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleUseUploadedTemplate}>
                <Edit className="mr-2 size-4" />
                {t.useInEditor}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
