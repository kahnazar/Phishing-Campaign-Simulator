import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { 
  Code, 
  Upload, 
  Download,
  FileCode,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface HtmlImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentHtml?: string;
  onImport: (html: string) => void;
}

export function HtmlImportExportDialog({
  open,
  onOpenChange,
  currentHtml = "",
  onImport
}: HtmlImportExportDialogProps) {
  const [htmlCode, setHtmlCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleImport = () => {
    if (!htmlCode.trim()) {
      toast.error('Please enter HTML code');
      return;
    }

    try {
      // Basic HTML validation
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlCode, 'text/html');
      const parseError = doc.querySelector('parsererror');
      
      if (parseError) {
        toast.error('Invalid HTML code');
        return;
      }

      onImport(htmlCode);
      toast.success('HTML imported successfully');
      onOpenChange(false);
      setHtmlCode("");
    } catch (error) {
      toast.error('Failed to parse HTML');
    }
  };

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
      setHtmlCode(content);
      toast.success('File loaded successfully');
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleExportDownload = () => {
    if (!currentHtml) {
      toast.error('No HTML to export');
      return;
    }

    const blob = new Blob([currentHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `phishlab-template-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('HTML file downloaded');
  };

  const handleCopyToClipboard = () => {
    if (!currentHtml) {
      toast.error('No HTML to copy');
      return;
    }

    try {
      // Fallback method for copying
      const textArea = document.createElement('textarea');
      textArea.value = currentHtml;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success('HTML copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Try modern clipboard API
        navigator.clipboard.writeText(currentHtml).then(() => {
          setCopied(true);
          toast.success('HTML copied to clipboard');
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
          toast.error('Failed to copy HTML');
        });
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (error) {
      toast.error('Failed to copy HTML');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import / Export HTML</DialogTitle>
          <DialogDescription>
            Import your own HTML template or export the current design
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">
              <Upload className="mr-2 size-4" />
              Import HTML
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="mr-2 size-4" />
              Export HTML
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload HTML File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="html-file-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('html-file-upload')?.click()}
                    className="w-full"
                  >
                    <FileCode className="mr-2 size-4" />
                    Choose HTML File
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or paste HTML code
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="html-code">HTML Code</Label>
                <Textarea
                  id="html-code"
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  placeholder="<html>&#10;  <head>&#10;    <title>Email Template</title>&#10;  </head>&#10;  <body>&#10;    <!-- Your email content -->&#10;  </body>&#10;</html>"
                  className="min-h-[300px] font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Paste your complete HTML email template here
                </p>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                <div className="flex gap-3">
                  <Code className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      HTML Template Tips
                    </p>
                    <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                      <li>• Use inline CSS for better email client compatibility</li>
                      <li>• Ensure images use absolute URLs or base64 encoding</li>
                      <li>• Test your template across different email clients</li>
                      <li>• Include merge tags like {`{{FirstName}}`} for personalization</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!htmlCode.trim()}>
                <Upload className="mr-2 size-4" />
                Import Template
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Current Template HTML</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyToClipboard}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 size-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 size-3" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
                <div className="relative rounded-lg border bg-muted/30">
                  <ScrollArea className="h-[400px]">
                    <pre className="p-4 text-sm">
                      <code className="font-mono text-foreground/90" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {currentHtml}
                      </code>
                    </pre>
                  </ScrollArea>
                </div>
                <p className="text-sm text-muted-foreground">
                  This is the generated HTML from your current template design
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={handleCopyToClipboard}
                  disabled={!currentHtml}
                >
                  <Copy className="mr-2 size-4" />
                  Copy to Clipboard
                </Button>
                <Button
                  onClick={handleExportDownload}
                  disabled={!currentHtml}
                >
                  <Download className="mr-2 size-4" />
                  Download HTML File
                </Button>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> The exported HTML includes all inline styles and is 
                  ready to use in email campaigns. Make sure to test it in different email 
                  clients before sending to ensure compatibility.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for file input
function Input({
  className,
  type,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={className}
      {...props}
    />
  );
}
