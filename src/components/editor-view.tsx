import React, { useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Monitor, 
  Smartphone, 
  Eye, 
  Save,
  Layout,
  Image as ImageIcon,
  Type,
  MousePointer,
  Minus,
  Plus,
  Settings2,
  ChevronLeft,
  GripVertical,
  Trash2,
  Upload,
  Copy,
  MoveUp,
  MoveDown,
  X
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner@2.0.3";
import { ImagePickerDialog } from "./image-picker-dialog";
import { HtmlImportExportDialog } from "./html-import-export-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface EditorViewProps {
  template?: any;
  onNavigate: (view: string) => void;
}

interface Block {
  id: string;
  type: string;
  content: string;
  imageUrl?: string;
  alignment?: 'left' | 'center' | 'right';
}

const blockTypes = [
  { type: 'header', label: 'Header', icon: Layout },
  { type: 'hero', label: 'Hero Image', icon: ImageIcon },
  { type: 'text', label: 'Text Block', icon: Type },
  { type: 'button', label: 'CTA Button', icon: MousePointer },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'divider', label: 'Divider', icon: Minus },
  { type: 'footer', label: 'Footer', icon: Layout }
];

const mergeTags = [
  '{{FirstName}}',
  '{{LastName}}',
  '{{Email}}',
  '{{Company}}',
  '{{Department}}',
  '{{ManagerName}}'
];

export function EditorView({ template, onNavigate }: EditorViewProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [emailSubject, setEmailSubject] = useState(template?.subject || 'Your subject line here');
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [htmlDialogOpen, setHtmlDialogOpen] = useState(false);
const [customHtml, setCustomHtml] = useState<string | null>((template as any)?.customHtml || null);
const [tags, setTags] = useState<string[]>(Array.isArray((template as any)?.tags) && (template as any)?.tags.length
  ? (template as any)?.tags
  : ['Security', 'Password', 'Urgent']);
const [addingTag, setAddingTag] = useState(false);
const [tagInput, setTagInput] = useState('');
const tagInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (addingTag && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [addingTag]);

const [blocks, setBlocks] = useState<Block[]>([
  { id: '1', type: 'header', content: 'Company Logo' },
    { id: '2', type: 'hero', content: 'Hero Image', imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80' },
    { id: '3', type: 'text', content: 'Dear {{FirstName}},\n\nYour password will expire in 24 hours. Please reset it immediately to maintain access to your account.', alignment: 'left' },
    { id: '4', type: 'button', content: 'Reset Password Now', alignment: 'center' },
    { id: '5', type: 'divider', content: '' },
    { id: '6', type: 'footer', content: '© 2025 Company. All rights reserved.' }
  ]);

  const addBlock = (type: string) => {
    const defaultContent: Record<string, Partial<Block>> = {
      header: { content: 'Company Logo' },
      hero: { content: 'Hero Image', imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80' },
      text: { content: 'Enter your text here...', alignment: 'left' },
      button: { content: 'Click Here', alignment: 'center' },
      image: { content: 'Image', imageUrl: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=800&q=80' },
      divider: { content: '' },
      footer: { content: '© 2025 Company. All rights reserved.' }
    };

    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: defaultContent[type]?.content || `New ${type} block`,
      imageUrl: defaultContent[type]?.imageUrl,
      alignment: defaultContent[type]?.alignment as any
    };
    
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlock(newBlock.id);
    toast.success('Block added');
  };

  const moveBlock = (dragIndex: number, hoverIndex: number) => {
    setBlocks(prev => {
      const newBlocks = [...prev];
      const [draggedBlock] = newBlocks.splice(dragIndex, 1);
      newBlocks.splice(hoverIndex, 0, draggedBlock);
      return newBlocks;
    });
  };

  const moveBlockUp = (id: string) => {
    const index = blocks.findIndex(b => b.id === id);
    if (index > 0) {
      moveBlock(index, index - 1);
    }
  };

  const moveBlockDown = (id: string) => {
    const index = blocks.findIndex(b => b.id === id);
    if (index < blocks.length - 1) {
      moveBlock(index, index + 1);
    }
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedBlock === id) {
      setSelectedBlock(null);
    }
    toast.success('Block deleted');
  };

  const duplicateBlock = (id: string) => {
    const blockToDuplicate = blocks.find(b => b.id === id);
    if (blockToDuplicate) {
      const newBlock = {
        ...blockToDuplicate,
        id: Date.now().toString()
      };
      const index = blocks.findIndex(b => b.id === id);
      setBlocks(prev => {
        const newBlocks = [...prev];
        newBlocks.splice(index + 1, 0, newBlock);
        return newBlocks;
      });
      toast.success('Block duplicated');
    }
  };

  const handleAddTag = () => {
    const value = tagInput.trim();
    if (!value) {
      toast.error('Введите название тега');
      return;
    }
    if (tags.includes(value)) {
      toast.error('Такой тег уже добавлен');
      return;
    }
    setTags((prev) => [...prev, value]);
    toast.success('Тег добавлен');
    setTagInput('');
    setAddingTag(false);
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
    toast.success('Тег удалён');
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    } else if (event.key === 'Escape') {
      setAddingTag(false);
      setTagInput('');
    }
  };

  const insertMergeTag = (tag: string) => {
    const block = blocks.find(b => b.id === selectedBlock);
    if (block && (block.type === 'text' || block.type === 'button')) {
      updateBlock(selectedBlock!, { content: block.content + ' ' + tag });
    }
  };

  const generateHtml = () => {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
  </style>
</head>
<body>
  <div class="email-container">
`;

    if (tags.length) {
      html += `    <div style="padding: 12px 24px; font-size: 12px; color: #6b7280; background-color: #f9fafb;">
      Tags: ${tags
        .map(
          (tag) =>
            `<span style="display:inline-block;margin-right:8px;margin-bottom:4px;padding:4px 10px;border-radius:9999px;background:#e5e7eb;color:#111827;">${tag}</span>`
        )
        .join(' ')}
    </div>\n`;
    }

    blocks.forEach(block => {
      switch (block.type) {
        case 'header':
          html += `    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e5e7eb; background-color: #ffffff; padding: 16px;">
      <div style="width: 32px; height: 32px; border-radius: 4px; background-color: #5561F1;"></div>
      <div style="display: flex; gap: 16px; font-size: 14px; color: #6b7280;">
        <a href="#" style="color: #6b7280; text-decoration: none;">Home</a>
        <a href="#" style="color: #6b7280; text-decoration: none;">Products</a>
        <a href="#" style="color: #6b7280; text-decoration: none;">Contact</a>
      </div>
    </div>\n`;
          break;
        case 'hero':
          html += `    <div style="position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; background: linear-gradient(to bottom right, #dbeafe, #f3e8ff);">
      ${block.imageUrl ? `<img src="${block.imageUrl}" alt="Hero" style="width: 100%; height: 100%; object-fit: cover;" />` : ''}
    </div>\n`;
          break;
        case 'text':
          html += `    <div class="${block.alignment ? 'text-' + block.alignment : 'text-left'}" style="background-color: #ffffff; padding: 24px; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">
      ${block.content}
    </div>\n`;
          break;
        case 'button':
          html += `    <div class="${block.alignment ? 'text-' + block.alignment : 'text-center'}" style="background-color: #ffffff; padding: 24px;">
      <a href="#" style="display: inline-block; border-radius: 8px; background-color: #5561F1; padding: 12px 24px; font-size: 14px; color: #ffffff; text-decoration: none;">${block.content}</a>
    </div>\n`;
          break;
        case 'image':
          html += `    <div style="background-color: #ffffff; padding: 24px;">
      <div style="position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 8px; background-color: #f3f4f6;">
        ${block.imageUrl ? `<img src="${block.imageUrl}" alt="Content" style="width: 100%; height: 100%; object-fit: cover;" />` : ''}
      </div>
    </div>\n`;
          break;
        case 'divider':
          html += `    <div style="background-color: #ffffff; padding: 12px 24px;">
      <div style="height: 1px; background-color: #e5e7eb;"></div>
    </div>\n`;
          break;
        case 'footer':
          html += `    <div style="background-color: #f3f4f6; padding: 24px; text-align: center; font-size: 12px; color: #6b7280;">
      ${block.content}
    </div>\n`;
          break;
      }
    });

    html += `  </div>
</body>
</html>`;

    return html;
  };

  const handleHtmlImport = (html: string) => {
    setCustomHtml(html);
    toast.success('HTML template imported. Preview updated.');
  };

  const handleBlockDoubleClick = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (block && (block.type === 'text' || block.type === 'button' || block.type === 'footer')) {
      setEditingBlockId(blockId);
      setSelectedBlock(blockId);
    }
  };

  const renderBlock = (block: Block, isEditing: boolean = false) => {
    const alignmentClass = block.alignment === 'center' ? 'text-center' : 
                          block.alignment === 'right' ? 'text-right' : 'text-left';
    
    switch (block.type) {
      case 'header':
        return (
          <div className="flex items-center justify-between border-b bg-white p-4">
            <div className="size-8 rounded bg-primary" />
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#">Home</a>
              <a href="#">Products</a>
              <a href="#">Contact</a>
            </div>
          </div>
        );
      case 'hero':
        return (
          <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
            {block.imageUrl && (
              <img src={block.imageUrl} alt="Hero" className="size-full object-cover" />
            )}
          </div>
        );
      case 'image':
        return (
          <div className="bg-white p-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              {block.imageUrl && (
                <img src={block.imageUrl} alt="Content" className="size-full object-cover" />
              )}
            </div>
          </div>
        );
      case 'text':
        return (
          <div className={`bg-white p-6 ${alignmentClass}`}>
            {isEditing ? (
              <Textarea
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                onBlur={() => setEditingBlockId(null)}
                autoFocus
                className="min-h-32 w-full text-sm leading-relaxed"
              />
            ) : (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {block.content}
              </div>
            )}
          </div>
        );
      case 'button':
        return (
          <div className={`bg-white p-6 ${alignmentClass}`}>
            {isEditing ? (
              <Input
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                onBlur={() => setEditingBlockId(null)}
                autoFocus
                className="inline-block max-w-xs"
              />
            ) : (
              <button className="rounded-lg bg-primary px-6 py-3 text-sm text-primary-foreground">
                {block.content}
              </button>
            )}
          </div>
        );
      case 'divider':
        return (
          <div className="bg-white px-6 py-3">
            <div className="h-px bg-border" />
          </div>
        );
      case 'footer':
        return (
          <div className="bg-muted p-6 text-center">
            {isEditing ? (
              <Input
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                onBlur={() => setEditingBlockId(null)}
                autoFocus
                className="text-xs"
              />
            ) : (
              <div className="text-xs text-muted-foreground">
                {block.content}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const selectedBlockData = blocks.find(b => b.id === selectedBlock);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Left Sidebar - Blocks & Properties */}
        <Card className="w-full shrink-0 xl:w-80">
          <Tabs defaultValue="blocks" className="h-full">
            <div className="border-b p-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="blocks">Blocks</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
              </TabsList>
            </div>
            
          <TabsContent value="blocks" className="m-0 h-[50vh] xl:h-[calc(100vh-18rem)]">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-4">
                <p className="mb-3 text-sm font-medium">Add Blocks</p>
                {blockTypes.map((blockType) => (
                  <Button
                    key={blockType.type}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addBlock(blockType.type)}
                  >
                    <blockType.icon className="mr-2 size-4" />
                    {blockType.label}
                  </Button>
                ))}
                
                <Separator className="my-4" />
                
                <p className="mb-3 text-sm font-medium">Merge Tags</p>
                <div className="space-y-1">
                  {mergeTags.map((tag) => (
                    <Button
                      key={tag}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start font-mono text-xs"
                      onClick={() => insertMergeTag(tag)}
                      disabled={!selectedBlock}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="properties" className="m-0 h-[50vh] xl:h-[calc(100vh-18rem)]">
            <ScrollArea className="h-full">
              <div className="space-y-4 p-4">
                {selectedBlockData ? (
                  <>
                    <div className="space-y-2">
                      <Label>Block Type</Label>
                      <Input value={blockTypes.find(t => t.type === selectedBlockData.type)?.label || selectedBlockData.type} disabled />
                    </div>
                    
                    {(selectedBlockData.type === 'text' || selectedBlockData.type === 'button' || selectedBlockData.type === 'footer') && (
                      <div className="space-y-2">
                        <Label>Content</Label>
                        <Textarea
                          value={selectedBlockData.content}
                          onChange={(e) => updateBlock(selectedBlockData.id, { content: e.target.value })}
                          className="min-h-32"
                          placeholder="Edit block content..."
                        />
                      </div>
                    )}

                    {(selectedBlockData.type === 'hero' || selectedBlockData.type === 'image') && (
                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input
                          value={selectedBlockData.imageUrl || ''}
                          onChange={(e) => updateBlock(selectedBlockData.id, { imageUrl: e.target.value })}
                          placeholder="https://..."
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setImagePickerOpen(true)}
                        >
                          <Upload className="mr-2 size-3" />
                          Change Image
                        </Button>
                        {selectedBlockData.imageUrl && (
                          <div className="rounded-lg border p-2">
                            <img 
                              src={selectedBlockData.imageUrl} 
                              alt="Preview" 
                              className="w-full rounded object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {(selectedBlockData.type === 'text' || selectedBlockData.type === 'button') && (
                      <div className="space-y-2">
                        <Label>Alignment</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button 
                            variant={selectedBlockData.alignment === 'left' ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => updateBlock(selectedBlockData.id, { alignment: 'left' })}
                          >
                            Left
                          </Button>
                          <Button 
                            variant={selectedBlockData.alignment === 'center' ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => updateBlock(selectedBlockData.id, { alignment: 'center' })}
                          >
                            Center
                          </Button>
                          <Button 
                            variant={selectedBlockData.alignment === 'right' ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => updateBlock(selectedBlockData.id, { alignment: 'right' })}
                          >
                            Right
                          </Button>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-2">
                      <Label>Actions</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => duplicateBlock(selectedBlockData.id)}
                        >
                          <Copy className="mr-1 size-3" />
                          Duplicate
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => moveBlockUp(selectedBlockData.id)}
                          disabled={blocks.findIndex(b => b.id === selectedBlockData.id) === 0}
                        >
                          <MoveUp className="mr-1 size-3" />
                          Move Up
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => moveBlockDown(selectedBlockData.id)}
                          disabled={blocks.findIndex(b => b.id === selectedBlockData.id) === blocks.length - 1}
                        >
                          <MoveDown className="mr-1 size-3" />
                          Move Down
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteBlock(selectedBlockData.id)}
                        >
                          <Trash2 className="mr-1 size-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-3 rounded-full bg-muted p-3">
                      <Settings2 className="size-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">No block selected</p>
                    <p className="text-xs text-muted-foreground">
                      Click on a block to edit
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Center - Editor Canvas */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={() => onNavigate('templates')}>
            <ChevronLeft className="mr-2 size-4" />
            Back to Templates
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setHtmlDialogOpen(true)}
            >
              <Settings2 className="mr-2 size-4" />
              Import/Export HTML
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toast.success('Test email sent to your inbox')}
            >
              <Eye className="mr-2 size-4" />
              Test Send
            </Button>
            <Button 
              size="sm"
              onClick={() => toast.success('Template saved successfully')}
            >
              <Save className="mr-2 size-4" />
              Save Template
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6 space-y-4">
              <div className="space-y-2">
                <Label>Email Subject</Label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Your email subject..."
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge 
                    variant={previewMode === 'desktop' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="mr-1 size-3" />
                    Desktop
                  </Badge>
                  <Badge 
                    variant={previewMode === 'mobile' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="mr-1 size-3" />
                    Mobile
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {blocks.length} blocks • Double-click to edit
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg border bg-muted">
              <div 
                className={`mx-auto transition-all ${
                  previewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-2xl'
                }`}
              >
                <ScrollArea className="h-[600px]">
                  {customHtml ? (
                    <div className="bg-white">
                      <div className="flex items-center justify-between border-b bg-muted/50 p-3">
                        <Badge variant="outline">Custom HTML Template</Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setCustomHtml(null);
                            toast.success('Switched to block editor');
                          }}
                        >
                          <X className="mr-2 size-3" />
                          Clear Custom HTML
                        </Button>
                      </div>
                      <iframe
                        srcDoc={customHtml}
                        className="h-[550px] w-full border-0"
                        title="HTML Preview"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  ) : (
                    <DndProvider backend={HTML5Backend}>
                      <div className="space-y-0">
                        {blocks.map((block, index) => (
                          <DraggableBlock
                            key={block.id}
                            block={block}
                            index={index}
                            isSelected={selectedBlock === block.id}
                            isEditing={editingBlockId === block.id}
                            onSelect={() => setSelectedBlock(block.id)}
                            onDoubleClick={() => handleBlockDoubleClick(block.id)}
                            onDelete={() => deleteBlock(block.id)}
                            onDuplicate={() => duplicateBlock(block.id)}
                            moveBlock={moveBlock}
                            renderBlock={renderBlock}
                          />
                        ))}
                      </div>
                    </DndProvider>
                  )}
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar - Settings */}
      <Card className="w-full shrink-0 xl:w-64">
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <Settings2 className="size-4" />
            <h3 className="font-medium">Email Settings</h3>
          </div>
        </div>
        <ScrollArea className="h-[50vh] xl:h-[calc(100vh-14rem)]">
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label>Sender Name</Label>
              <Input defaultValue="IT Department" />
            </div>
            <div className="space-y-2">
              <Label>Sender Email</Label>
              <Input defaultValue="it@company.com" />
            </div>
            <div className="space-y-2">
              <Label>Reply-To</Label>
              <Input defaultValue="noreply@company.com" />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Template Tags</Label>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <TooltipProvider key={tag}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="secondary"
                          className="flex cursor-pointer items-center gap-1"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag}
                          <X className="size-3 opacity-70" />
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top">Remove tag</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
              {addingTag ? (
                <div className="flex items-center gap-2">
                  <Input
                    ref={tagInputRef}
                    value={tagInput}
                    placeholder="New tag"
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleAddTag}>
                    Add
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setAddingTag(false); setTagInput(''); }}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setAddingTag(true)}
                >
                  <Plus className="mr-2 size-3" />
                  Add Tag
                </Button>
              )}
            </div>

            <Separator />

            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                This template will track opens, clicks, and form submissions automatically.
              </p>
            </div>
          </div>
        </ScrollArea>
      </Card>

      <ImagePickerDialog
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        onSelect={(url) => {
          if (selectedBlock) {
            const block = blocks.find(b => b.id === selectedBlock);
            if (block && (block.type === 'hero' || block.type === 'image')) {
              updateBlock(selectedBlock, { imageUrl: url });
            }
          }
        }}
        currentUrl={selectedBlockData?.imageUrl}
      />

      <HtmlImportExportDialog
        open={htmlDialogOpen}
        onOpenChange={setHtmlDialogOpen}
        currentHtml={customHtml || generateHtml()}
        onImport={handleHtmlImport}
      />
      </div>
    </div>
  );
}

// Draggable Block Component
interface DraggableBlockProps {
  block: Block;
  index: number;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
  renderBlock: (block: Block, isEditing: boolean) => React.ReactNode;
}

const DraggableBlock = ({ 
  block, 
  index, 
  isSelected, 
  isEditing,
  onSelect, 
  onDoubleClick,
  onDelete,
  onDuplicate,
  moveBlock, 
  renderBlock 
}: DraggableBlockProps) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'block',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'block',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveBlock(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className={`group relative cursor-pointer transition-all ${
        isDragging ? 'opacity-30' : ''
      } ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''} hover:ring-2 hover:ring-primary/50`}
    >
      {/* Drag Handle */}
      <div className="absolute left-2 top-2 z-10 hidden rounded bg-background/90 p-1.5 shadow-sm backdrop-blur-sm group-hover:block">
        <GripVertical className="size-4 text-muted-foreground" />
      </div>
      
      {/* Quick Actions */}
      {isSelected && (
        <div className="absolute right-2 top-2 z-10 flex gap-1 rounded bg-background/90 p-1 shadow-sm backdrop-blur-sm">
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="size-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      )}
      
      <div ref={preview}>
        {renderBlock(block, isEditing)}
      </div>
    </div>
  );
};
