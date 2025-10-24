import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Upload, Link as LinkIcon, Search } from "lucide-react";

interface ImagePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  currentUrl?: string;
}

const sampleImages = [
  'https://images.unsplash.com/photo-1600376691342-236eab114592?w=800&q=80',
  'https://images.unsplash.com/photo-1652508682936-f76c04760e5d?w=800&q=80',
  'https://images.unsplash.com/photo-1584543515885-b8981dbf0b5d?w=800&q=80',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
  'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80'
];

export function ImagePickerDialog({ open, onOpenChange, onSelect, currentUrl }: ImagePickerDialogProps) {
  const [customUrl, setCustomUrl] = useState(currentUrl || '');

  useEffect(() => {
    if (open) {
      setCustomUrl(currentUrl || '');
    }
  }, [open, currentUrl]);

  const handleSelect = (url: string) => {
    onSelect(url);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Image</DialogTitle>
          <DialogDescription>
            Choose an image from the gallery or paste a URL
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="gallery">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">
              <Search className="mr-2 size-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="mr-2 size-4" />
              Custom URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {sampleImages.map((url, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(url)}
                  className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-primary hover:shadow-lg"
                >
                  <img src={url} alt={`Option ${index + 1}`} className="size-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/20">
                    <Button variant="secondary" size="sm" className="opacity-0 transition-opacity group-hover:opacity-100">
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {customUrl && (
              <div className="rounded-lg border p-4">
                <p className="mb-2 text-sm text-muted-foreground">Preview:</p>
                <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                  <img src={customUrl} alt="Preview" className="size-full object-cover" />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSelect(customUrl)} disabled={!customUrl}>
                Use This Image
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
