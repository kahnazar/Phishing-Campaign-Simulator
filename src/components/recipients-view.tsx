import { ChangeEvent, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { 
  Upload, 
  Users, 
  Search,
  UserPlus,
  Download,
  Filter
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { useTranslation } from "../lib/i18n";
import { useAppData } from "../lib/app-data-context";
import type { Recipient } from "../types";
import { toast } from "sonner@2.0.3";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";

const groups = [
  { name: 'All Employees', count: 245, riskScore: 32 },
  { name: 'IT Department', count: 42, riskScore: 12 },
  { name: 'Sales Team', count: 58, riskScore: 48 },
  { name: 'Management', count: 18, riskScore: 25 },
  { name: 'Finance', count: 35, riskScore: 20 },
];

interface RecipientsViewProps {
  onNavigate: (view: string) => void;
}

export function RecipientsView({ onNavigate }: RecipientsViewProps) {
  const { t } = useTranslation();
  const {
    recipients,
    loading,
    createRecipient: createRecipientAction,
    importRecipientsFromCsv,
    importRecipientsFromGoogle,
    importRecipientsFromDirectory,
  } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [viewingRecipient, setViewingRecipient] = useState<Recipient | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false);
  const [directoryDialogOpen, setDirectoryDialogOpen] = useState(false);
  const [newRecipientForm, setNewRecipientForm] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
  });
  const [creatingRecipient, setCreatingRecipient] = useState(false);
  const [importing, setImporting] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
  const [directoryText, setDirectoryText] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredRecipients = recipients.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRecipient = (id: string) => {
    setSelectedRecipients(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedRecipients(prev =>
      prev.length === filteredRecipients.length ? [] : filteredRecipients.map(r => r.id)
    );
  };

  const handleViewRecipient = (recipient: Recipient) => {
    setViewingRecipient(recipient);
    setViewDialogOpen(true);
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();

  const resetNewRecipientForm = () => {
    setNewRecipientForm({
      name: "",
      email: "",
      department: "",
      position: "",
    });
  };

  const handleAddRecipientClick = () => {
    resetNewRecipientForm();
    setAddDialogOpen(true);
  };

  const handleCreateRecipient = async () => {
    const { name, email, department, position } = newRecipientForm;
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setCreatingRecipient(true);
      await createRecipientAction({
        name: name.trim(),
        email: email.trim(),
        department: department.trim() || 'General',
        position: position.trim() || 'Employee',
      });
      toast.success('Recipient added');
      setAddDialogOpen(false);
      resetNewRecipientForm();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to add recipient');
    } finally {
      setCreatingRecipient(false);
    }
  };

  const triggerCsvPicker = () => {
    fileInputRef.current?.click();
  };

  const summarizeImport = (result: { added: number; updated: number; skipped: Array<{ email: string; reason: string }>; total: number }) => {
    const parts = [];
    if (result.added > 0) {
      parts.push(`${result.added} added`);
    }
    if (result.updated > 0) {
      parts.push(`${result.updated} updated`);
    }
    const summary = parts.length ? parts.join(', ') : 'No changes';
    result.skipped.length
      ? toast(`${summary}. ${result.skipped.length} skipped.`)
      : toast.success(summary);
  };

  const handleCsvFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    try {
      setImporting(true);
      const text = await file.text();
      const result = await importRecipientsFromCsv(text, true);
      summarizeImport(result);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to import CSV');
    } finally {
      setImporting(false);
    }
  };

  const handleGoogleImport = async () => {
    if (!googleSheetUrl.trim()) {
      toast.error('Provide a Google Sheets link');
      return;
    }
    try {
      setImporting(true);
      const result = await importRecipientsFromGoogle(googleSheetUrl.trim(), true);
      summarizeImport(result);
      setGoogleSheetUrl('');
      setGoogleDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to import from Google Sheets');
    } finally {
      setImporting(false);
    }
  };

  const parseDirectoryEntries = (text: string) => {
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const parts = line.split(/[;,]/).map((part) => part.trim());
        return {
          name: parts[0],
          email: parts[1],
          department: parts[2],
          position: parts[3],
        };
      });
  };

  const handleDirectoryImport = async () => {
    const entries = parseDirectoryEntries(directoryText);
    if (!entries.length) {
      toast.error('Paste at least one directory row (Name,Email,Department,Title)');
      return;
    }
    try {
      setImporting(true);
      const result = await importRecipientsFromDirectory({ entries }, true);
      summarizeImport(result);
      setDirectoryText('');
      setDirectoryDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to import directory data');
    } finally {
      setImporting(false);
    }
  };

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

  const handleExportRecipients = () => {
    if (!recipients.length) {
      toast('Nothing to export yet');
      return;
    }
    const rows = [
      ['Name', 'Email', 'Department', 'Position', 'Campaigns', 'Click Rate'],
      ...recipients.map((recipient) => [
        recipient.name,
        recipient.email,
        recipient.department,
        recipient.position,
        String(recipient.campaigns ?? 0),
        recipient.clickRate || '0%',
      ]),
    ];
    downloadCsv(`recipients-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    toast.success('Recipients exported');
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleCsvFileChange}
      />
      {/* Fixed Header */}
      <div className="shrink-0 border-b bg-background px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t.recipientsTitle}</h1>
            <p className="text-muted-foreground">{t.recipientsSubtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={triggerCsvPicker} disabled={importing}>
              <Upload className="mr-2 size-4" />
              {t.importCSV}
            </Button>
            <Button onClick={handleAddRecipientClick}>
              <UserPlus className="mr-2 size-4" />
              {t.addRecipient}
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {groups.map((group) => (
          <Card key={group.name} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Group</p>
                  <p className="mt-1 font-medium">{group.name}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <span className="text-sm">{group.count} users</span>
                  </div>
                </div>
                <Badge 
                  variant="outline"
                  className={
                    group.riskScore > 40 ? 'bg-red-100 text-red-700' :
                    group.riskScore > 25 ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }
                >
                  {group.riskScore}% risk
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Recipients</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 size-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportRecipients}>
                <Download className="mr-2 size-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search recipients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading && (
            <div className="mb-4 rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
              Loading recipients...
            </div>
          )}

          {selectedRecipients.length > 0 && (
            <div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/50 p-3">
              <span className="text-sm font-medium">
                {selectedRecipients.length} recipient(s) selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Add to Group
                </Button>
                <Button variant="outline" size="sm">
                  Remove
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRecipients.length === filteredRecipients.length && filteredRecipients.length > 0}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>{t.name}</TableHead>
                  <TableHead>{t.email}</TableHead>
                  <TableHead>{t.department}</TableHead>
                  <TableHead>{t.position}</TableHead>
                  <TableHead>{t.campaigns}</TableHead>
                  <TableHead>{t.clickRate}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecipients.map((recipient) => (
                  <TableRow key={recipient.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRecipients.includes(recipient.id)}
                        onCheckedChange={() => toggleRecipient(recipient.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{recipient.name}</TableCell>
                    <TableCell className="text-muted-foreground">{recipient.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{recipient.department}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{recipient.position}</TableCell>
                    <TableCell>{recipient.campaigns}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          parseInt(recipient.clickRate) > 40 ? 'bg-red-100 text-red-700' :
                          parseInt(recipient.clickRate) > 25 ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }
                      >
                        {recipient.clickRate}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewRecipient(recipient)}
                      >
                        {t.viewProfile}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {!loading && filteredRecipients.length === 0 && (
            <div className="mt-6 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No recipients match your search.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={triggerCsvPicker}
              disabled={importing}
            >
              <Upload className="mb-2 size-6" />
              <span>Upload CSV File</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => setGoogleDialogOpen(true)}
              disabled={importing}
            >
              <svg className="mb-2 size-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google Sheets</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => setDirectoryDialogOpen(true)}
              disabled={importing}
            >
              <Users className="mb-2 size-6" />
              <span>Active Directory</span>
            </Button>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Recipient</DialogTitle>
            <DialogDescription>Manually add a single recipient to the directory.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="recipient-name">Full Name</Label>
              <Input
                id="recipient-name"
                value={newRecipientForm.name}
                onChange={(event) => setNewRecipientForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Alex Rivera"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recipient-email">Email</Label>
              <Input
                id="recipient-email"
                type="email"
                value={newRecipientForm.email}
                onChange={(event) => setNewRecipientForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="alex.rivera@example.com"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="recipient-department">Department</Label>
                <Input
                  id="recipient-department"
                  value={newRecipientForm.department}
                  onChange={(event) => setNewRecipientForm((prev) => ({ ...prev, department: event.target.value }))}
                  placeholder="Sales"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="recipient-position">Title</Label>
                <Input
                  id="recipient-position"
                  value={newRecipientForm.position}
                  onChange={(event) => setNewRecipientForm((prev) => ({ ...prev, position: event.target.value }))}
                  placeholder="Account Executive"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={creatingRecipient}>
              Cancel
            </Button>
            <Button onClick={handleCreateRecipient} disabled={creatingRecipient}>
              {creatingRecipient ? 'Saving…' : 'Save Recipient'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={googleDialogOpen} onOpenChange={setGoogleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import from Google Sheets</DialogTitle>
            <DialogDescription>
              Share the sheet publicly and paste the link below. The first worksheet will be imported.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="google-sheet-url">Google Sheets URL</Label>
              <Input
                id="google-sheet-url"
                value={googleSheetUrl}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                onChange={(event) => setGoogleSheetUrl(event.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Columns supported: <strong>Name</strong>, <strong>Email</strong>, <strong>Department</strong>, <strong>Title</strong>,
              optional <strong>Campaigns</strong> and <strong>Click Rate</strong>.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoogleDialogOpen(false)} disabled={importing}>
              Cancel
            </Button>
            <Button onClick={handleGoogleImport} disabled={importing}>
              {importing ? 'Importing…' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={directoryDialogOpen} onOpenChange={setDirectoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import from Active Directory</DialogTitle>
            <DialogDescription>
              Paste comma or semicolon separated rows (Name, Email, Department, Title). One entry per line.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={directoryText}
              onChange={(event) => setDirectoryText(event.target.value)}
              rows={6}
              placeholder={"Jane Doe, jane.doe@example.com, Finance, Controller\nJohn Smith; john.smith@example.com; IT; Engineer"}
            />
            <p className="text-xs text-muted-foreground">
              Existing recipients are updated automatically. Leave additional metrics blank to initialise them at zero.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDirectoryDialogOpen(false)} disabled={importing}>
              Cancel
            </Button>
            <Button onClick={handleDirectoryImport} disabled={importing}>
              {importing ? 'Importing…' : 'Import Entries'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewingRecipient?.name}</DialogTitle>
            <DialogDescription>{viewingRecipient?.email}</DialogDescription>
          </DialogHeader>
          {viewingRecipient && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <Avatar className="size-14">
                  <AvatarFallback className="text-lg">
                    {getInitials(viewingRecipient.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Department:</span>
                    <Badge variant="outline">{viewingRecipient.department}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-medium">{viewingRecipient.position}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Campaigns:</span>
                    <span className="font-medium">{viewingRecipient.campaigns}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="mb-2 text-sm font-medium">Engagement</p>
                <div className="flex items-center gap-3 text-sm">
                  <Badge
                    variant="outline"
                    className={
                      parseInt(viewingRecipient.clickRate) > 40
                        ? 'bg-red-100 text-red-700'
                        : parseInt(viewingRecipient.clickRate) > 25
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                    }
                  >
                    {viewingRecipient.clickRate} click rate
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
