import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import {
  Server,
  Link as LinkIcon,
  RefreshCw,
  Check,
  X,
  UserPlus,
  UserMinus,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";

interface LdapUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  hasLicense: boolean;
  lastSync: string;
}

const mockLdapUsers: LdapUser[] = [
  { id: '1', firstName: '', lastName: '', email: 'admin@platform.uz', department: 'IT', hasLicense: false, lastSync: '2025-10-14 10:30' },
  { id: '2', firstName: 'Alina', lastName: 'Offbox', email: 'alina@offbox.uz', department: 'Marketing', hasLicense: false, lastSync: '2025-10-14 10:30' },
  { id: '3', firstName: 'Daniyar', lastName: 'Yarmukhamedov', email: 'testUser@asd.uz', department: 'Engineering', hasLicense: false, lastSync: '2025-10-14 10:30' },
  { id: '4', firstName: 'Alex', lastName: 'Rivera', email: 'alex.rivera@company.com', department: 'HR', hasLicense: false, lastSync: '2025-10-14 10:30' },
  { id: '5', firstName: 'Jordan', lastName: 'Kim', email: 'jordan.kim@company.com', department: 'Finance', hasLicense: false, lastSync: '2025-10-14 10:30' },
];

export function LdapSettings() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<LdapUser[]>(mockLdapUsers);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // LDAP Configuration
  const [ldapConfig, setLdapConfig] = useState({
    server: '',
    port: '389',
    baseDN: '',
    bindDN: '',
    bindPassword: '',
    userFilter: '(objectClass=person)',
    groupFilter: '(objectClass=group)',
    defaultRole: 'Viewer',
    organizationId: 'f5d42995-a225-4594-9d18-250a2a777339',
    organizationName: 'Default',
    organizationCode: '',
    autoSync: false,
    syncInterval: '24'
  });

  const handleConnect = async () => {
    if (!ldapConfig.server || !ldapConfig.baseDN) {
      toast.error('Please fill in Server URL and Base DN');
      return;
    }

    setIsConnecting(true);
    
    // Simulate connection
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      toast.success('Successfully connected to Active Directory');
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast.success('Disconnected from Active Directory');
  };

  const handleSync = async () => {
    if (!isConnected) {
      toast.error('Please connect to LDAP first');
      return;
    }

    setIsSyncing(true);
    
    // Simulate sync
    setTimeout(() => {
      setIsSyncing(false);
      toast.success(`Synced ${users.length} users from Active Directory`);
      // Update last sync time
      setUsers(prev => prev.map(u => ({
        ...u,
        lastSync: new Date().toLocaleString()
      })));
    }, 3000);
  };

  const handleTestConnection = async () => {
    if (!ldapConfig.server) {
      toast.error('Please enter server URL');
      return;
    }

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Testing connection...',
        success: 'Connection test successful',
        error: 'Connection test failed',
      }
    );
  };

  const handleGrantLicense = () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users to grant licenses');
      return;
    }

    setUsers(prev => prev.map(u => 
      selectedUsers.includes(u.id) ? { ...u, hasLicense: true } : u
    ));
    
    toast.success(`Granted licenses to ${selectedUsers.length} user(s)`);
    setSelectedUsers([]);
  };

  const handleRevokeLicense = () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users to revoke licenses');
      return;
    }

    setUsers(prev => prev.map(u => 
      selectedUsers.includes(u.id) ? { ...u, hasLicense: false } : u
    ));
    
    toast.success(`Revoked licenses from ${selectedUsers.length} user(s)`);
    setSelectedUsers([]);
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const licensedCount = users.filter(u => u.hasLicense).length;
  const totalCount = users.length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1">LDAP / Active Directory Integration</h3>
        <p className="text-sm text-muted-foreground">
          Connect to your organization's directory service to automatically sync users
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex size-12 items-center justify-center rounded-lg ${
                isConnected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'
              }`}>
                <Server className={`size-6 ${
                  isConnected ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                }`} />
              </div>
              <div>
                <p className="font-medium">
                  {isConnected ? 'Connected to Active Directory' : 'Not Connected'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConnected 
                    ? `${licensedCount} of ${totalCount} users licensed` 
                    : 'Configure connection settings below'}
                </p>
              </div>
            </div>
            <Badge variant={isConnected ? 'default' : 'secondary'} className="gap-1.5">
              {isConnected ? (
                <>
                  <Check className="size-3" />
                  Active
                </>
              ) : (
                <>
                  <X className="size-3" />
                  Inactive
                </>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Unit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-id">Organization Unit ID</Label>
              <Input
                id="org-id"
                value={ldapConfig.organizationId}
                disabled
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-name">
                Organization Unit Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="org-name"
                value={ldapConfig.organizationName}
                onChange={(e) => setLdapConfig({ ...ldapConfig, organizationName: e.target.value })}
                placeholder="Default"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-code">Organization Unit Code</Label>
              <Input
                id="org-code"
                value={ldapConfig.organizationCode}
                onChange={(e) => setLdapConfig({ ...ldapConfig, organizationCode: e.target.value })}
                placeholder="Enter organization code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-role">Default Role</Label>
              <Select
                value={ldapConfig.defaultRole}
                onValueChange={(value) => setLdapConfig({ ...ldapConfig, defaultRole: value })}
              >
                <SelectTrigger id="default-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                  <SelectItem value="Auditor">Auditor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">LDAP Server Configuration</p>
                <p className="text-sm text-muted-foreground">Configure connection to your directory server</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ldap-server">
                  Server URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ldap-server"
                  value={ldapConfig.server}
                  onChange={(e) => setLdapConfig({ ...ldapConfig, server: e.target.value })}
                  placeholder="ldap://dc.company.com"
                  disabled={isConnected}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ldap-port">Port</Label>
                <Input
                  id="ldap-port"
                  value={ldapConfig.port}
                  onChange={(e) => setLdapConfig({ ...ldapConfig, port: e.target.value })}
                  placeholder="389"
                  disabled={isConnected}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="base-dn">
                  Base DN <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="base-dn"
                  value={ldapConfig.baseDN}
                  onChange={(e) => setLdapConfig({ ...ldapConfig, baseDN: e.target.value })}
                  placeholder="DC=company,DC=com"
                  disabled={isConnected}
                />
              </div>

              {showAdvanced && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bind-dn">Bind DN</Label>
                    <Input
                      id="bind-dn"
                      value={ldapConfig.bindDN}
                      onChange={(e) => setLdapConfig({ ...ldapConfig, bindDN: e.target.value })}
                      placeholder="CN=admin,DC=company,DC=com"
                      disabled={isConnected}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bind-password">Bind Password</Label>
                    <div className="relative">
                      <Input
                        id="bind-password"
                        type={showPassword ? 'text' : 'password'}
                        value={ldapConfig.bindPassword}
                        onChange={(e) => setLdapConfig({ ...ldapConfig, bindPassword: e.target.value })}
                        placeholder="Enter password"
                        disabled={isConnected}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 size-10"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isConnected}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-filter">User Filter</Label>
                    <Input
                      id="user-filter"
                      value={ldapConfig.userFilter}
                      onChange={(e) => setLdapConfig({ ...ldapConfig, userFilter: e.target.value })}
                      placeholder="(objectClass=person)"
                      disabled={isConnected}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-filter">Group Filter</Label>
                    <Input
                      id="group-filter"
                      value={ldapConfig.groupFilter}
                      onChange={(e) => setLdapConfig({ ...ldapConfig, groupFilter: e.target.value })}
                      placeholder="(objectClass=group)"
                      disabled={isConnected}
                    />
                  </div>
                </>
              )}
            </div>

            {showAdvanced && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-sync">Automatic Synchronization</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically sync users on a schedule
                      </p>
                    </div>
                    <Switch
                      id="auto-sync"
                      checked={ldapConfig.autoSync}
                      onCheckedChange={(checked) => setLdapConfig({ ...ldapConfig, autoSync: checked })}
                    />
                  </div>

                  {ldapConfig.autoSync && (
                    <div className="space-y-2">
                      <Label htmlFor="sync-interval">Sync Interval (hours)</Label>
                      <Input
                        id="sync-interval"
                        type="number"
                        value={ldapConfig.syncInterval}
                        onChange={(e) => setLdapConfig({ ...ldapConfig, syncInterval: e.target.value })}
                        min="1"
                        max="168"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {!isConnected ? (
              <>
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting || !ldapConfig.server || !ldapConfig.baseDN}
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="mr-2 size-4" />
                      Connect to Active Directory
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={!ldapConfig.server}
                >
                  Test Connection
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSync}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 size-4" />
                      Sync Now
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
              </>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
            <AlertCircle className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Users from LDAP will be created with the default role specified above. 
              You can change individual roles after synchronization.
            </p>
          </div>

          <Button
            variant="link"
            className="px-0"
            onClick={() => setDetailsDialogOpen(true)}
          >
            User Details Information
          </Button>
        </CardContent>
      </Card>

      {/* User License Management */}
      {isConnected && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Synced Users</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Selected {selectedUsers.length} element{selectedUsers.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleGrantLicense}
                  disabled={selectedUsers.length === 0}
                >
                  <UserPlus className="mr-2 size-4" />
                  Grant License
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRevokeLicense}
                  disabled={selectedUsers.length === 0}
                >
                  <UserMinus className="mr-2 size-4" />
                  Revoke License
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === users.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Id</TableHead>
                  <TableHead>Has License?</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleSelectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <Badge variant={user.hasLicense ? 'default' : 'secondary'}>
                        {user.hasLicense ? 'YES' : 'NO_LICENSE'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.firstName || '-'}</TableCell>
                    <TableCell>{user.lastName || '-'}</TableCell>
                    <TableCell className="font-mono text-sm">{user.email}</TableCell>
                    <TableCell>{user.department}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* User Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details Information</DialogTitle>
            <DialogDescription>
              Configuration for user attributes mapping from LDAP
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 text-sm">
              <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                <span className="text-muted-foreground">First Name Attribute:</span>
                <span className="font-mono">givenName</span>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                <span className="text-muted-foreground">Last Name Attribute:</span>
                <span className="font-mono">sn</span>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                <span className="text-muted-foreground">Email Attribute:</span>
                <span className="font-mono">mail</span>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                <span className="text-muted-foreground">Department Attribute:</span>
                <span className="font-mono">department</span>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                <span className="text-muted-foreground">Username Attribute:</span>
                <span className="font-mono">sAMAccountName</span>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                These attributes are used to map LDAP user fields to PhishLab user profiles. 
                Make sure your LDAP schema includes these attributes or contact support to customize the mapping.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
