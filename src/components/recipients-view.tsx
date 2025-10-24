import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
  const { recipients, loading } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

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

  return (
    <>
      {/* Fixed Header */}
      <div className="shrink-0 border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t.recipientsTitle}</h1>
            <p className="text-muted-foreground">{t.recipientsSubtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="mr-2 size-4" />
              {t.importCSV}
            </Button>
            <Button>
              <UserPlus className="mr-2 size-4" />
              {t.addRecipient}
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
              <Button variant="outline" size="sm">
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRecipients.length === filteredRecipients.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Campaigns</TableHead>
                <TableHead>Click Rate</TableHead>
                <TableHead></TableHead>
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
                    <Button variant="ghost" size="sm">
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
            <Button variant="outline" className="h-20 flex-col">
              <Upload className="mb-2 size-6" />
              <span>Upload CSV File</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <svg className="mb-2 size-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google Sheets</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="mb-2 size-6" />
              <span>Active Directory</span>
            </Button>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </>
  );
}
