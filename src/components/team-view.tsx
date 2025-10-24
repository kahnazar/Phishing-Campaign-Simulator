import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTranslation } from "../lib/i18n";
import { 
  UserPlus, 
  Shield, 
  Eye,
  Edit2,
  Trash2,
  Search,
  X
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner@2.0.3";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useAppData } from "../lib/app-data-context";
import type { TeamMember } from "../types";

const roles = [
  {
    name: 'Admin',
    description: 'Full access to all features and settings',
    permissions: ['Create campaigns', 'Edit templates', 'Manage users', 'View reports', 'System settings'],
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  },
  {
    name: 'Manager',
    description: 'Create and manage campaigns',
    permissions: ['Create campaigns', 'Edit templates', 'View reports', 'Manage recipients'],
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  },
  {
    name: 'Viewer',
    description: 'Read-only access to reports',
    permissions: ['View reports', 'View campaigns'],
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  },
  {
    name: 'Auditor',
    description: 'Access to audit logs and compliance data',
    permissions: ['View audit logs', 'Export reports', 'View campaigns'],
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  }
];

interface TeamViewProps {
  onNavigate: (view: string) => void;
}

export function TeamView({ onNavigate }: TeamViewProps) {
  const { t } = useTranslation();
  const {
    teamMembers,
    inviteTeamMember,
    updateTeamMember,
    deleteTeamMember,
    loading,
  } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<TeamMember | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Viewer");

  const filteredMembers = teamMembers.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember({ ...member });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMember) {
      return;
    }
    
    try {
      await updateTeamMember(editingMember.id, {
        name: editingMember.name,
        email: editingMember.email,
        role: editingMember.role,
        campaigns: editingMember.campaigns,
        lastActive: editingMember.lastActive,
      });
      setEditDialogOpen(false);
      toast.success(`${editingMember.name}'s role updated to ${editingMember.role}`);
      setEditingMember(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update team member');
    }
  };

  const handleViewMember = (member: TeamMember) => {
    setViewingMember(member);
    setViewDialogOpen(true);
  };

  const handleDeleteMember = (member: TeamMember) => {
    setDeletingMember(member);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingMember) {
      return;
    }

    try {
      await deleteTeamMember(deletingMember.id);
      setDeleteDialogOpen(false);
      toast.success(`${deletingMember.name} removed from team`);
      setDeletingMember(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove team member');
    }
  };

  const handleInvite = async () => {
    if (!newMemberEmail) {
      toast.error('Please enter an email address');
      return;
    }
    
    try {
      await inviteTeamMember({
        email: newMemberEmail,
        role: newMemberRole,
      });
      setInviteDialogOpen(false);
      setNewMemberEmail("");
      setNewMemberRole("Viewer");
      toast.success(`Invitation sent to ${newMemberEmail}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to send invitation');
    }
  };

  const getRoleInfo = (roleName: string) => {
    return roles.find(r => r.name === roleName);
  };

  return (
    <>
      {/* Fixed Header */}
      <div className="shrink-0 border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t.teamTitle}</h1>
            <p className="text-muted-foreground">{t.teamSubtitle}</p>
          </div>
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="mr-2 size-4" />
            {t.inviteMember}
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {roles.map((role) => (
          <Card key={role.name}>
            <CardContent className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <Shield className="size-5 text-muted-foreground" />
                <Badge variant="outline" className={role.color}>
                  {role.name}
                </Badge>
              </div>
              <h4 className="mb-1 font-medium">{role.name}</h4>
              <p className="text-sm text-muted-foreground">{role.description}</p>
              <div className="mt-4 space-y-1">
                {role.permissions.slice(0, 3).map((perm, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="size-1 rounded-full bg-muted-foreground" />
                    {perm}
                  </div>
                ))}
                {role.permissions.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{role.permissions.length - 3} more
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members ({teamMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.searchTeam}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading && teamMembers.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                Loading team members...
              </div>
            ) : (
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">{t.name}</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[200px]">{t.email}</TableHead>
                    <TableHead className="min-w-[100px]">{t.role}</TableHead>
                    <TableHead className="hidden lg:table-cell">{t.campaigns}</TableHead>
                    <TableHead className="hidden xl:table-cell">{t.status}</TableHead>
                    <TableHead className="min-w-[120px]">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => {
                    const roleInfo = getRoleInfo(member.role);
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">{member.name}</span>
                              <span className="text-xs text-muted-foreground md:hidden">{member.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{member.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={roleInfo?.color}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{member.campaigns}</TableCell>
                        <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                          {member.lastActive}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewMember(member)}
                              className="size-8"
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditMember(member)}
                              className="size-8"
                            >
                              <Edit2 className="size-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteMember(member)}
                              className="size-8"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {!loading && filteredMembers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="mb-3 size-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No team members found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left text-sm font-medium">Permission</th>
                  {roles.map(role => (
                    <th key={role.name} className="p-3 text-center text-sm font-medium">
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  'Create campaigns',
                  'Edit templates',
                  'Manage users',
                  'View reports',
                  'System settings',
                  'Manage recipients',
                  'View audit logs',
                  'Export reports'
                ].map((permission) => (
                  <tr key={permission} className="border-b">
                    <td className="p-3 text-sm">{permission}</td>
                    {roles.map(role => (
                      <td key={role.name} className="p-3 text-center">
                        {role.permissions.includes(permission) ? (
                          <div className="mx-auto flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <span className="text-xs">✓</span>
                          </div>
                        ) : (
                          <div className="mx-auto size-5 rounded-full bg-muted" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>

      {/* Edit Member Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update role and permissions for {editingMember?.name}
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar>
                  <AvatarFallback>{getInitials(editingMember.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{editingMember.name}</p>
                  <p className="text-sm text-muted-foreground">{editingMember.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editingMember.role}
                  onValueChange={(value) => setEditingMember({ ...editingMember, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.name} value={role.name}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${role.color} text-xs`}>
                            {role.name}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {role.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editingMember && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="mb-2 text-sm font-medium">Permissions:</p>
                  <div className="space-y-1">
                    {getRoleInfo(editingMember.role)?.permissions.map((perm, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="size-1.5 rounded-full bg-primary" />
                        {perm}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Member Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Team Member Details</DialogTitle>
          </DialogHeader>
          {viewingMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <Avatar className="size-16">
                  <AvatarFallback className="text-lg">{getInitials(viewingMember.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{viewingMember.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewingMember.email}</p>
                  <Badge variant="outline" className={`${getRoleInfo(viewingMember.role)?.color} mt-2`}>
                    {viewingMember.role}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Campaigns Created</p>
                  <p className="text-2xl font-semibold">{viewingMember.campaigns}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Last Active</p>
                  <p className="font-medium">{viewingMember.lastActive}</p>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="mb-2 text-sm font-medium">Permissions:</p>
                <div className="space-y-1">
                  {getRoleInfo(viewingMember.role)?.permissions.map((perm, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="size-1.5 rounded-full bg-primary" />
                      {perm}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setViewDialogOpen(false);
              if (viewingMember) handleEditMember(viewingMember);
            }}>
              <Edit2 className="mr-2 size-4" />
              Edit Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deletingMember?.name}</strong> from the team? 
              This action cannot be undone and they will lose access to all campaigns and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your PhishLab workspace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.name} value={role.name}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${role.color} text-xs`}>
                          {role.name}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {role.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="mb-2 text-sm font-medium">Selected role permissions:</p>
              <div className="space-y-1">
                {getRoleInfo(newMemberRole)?.permissions.map((perm, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="size-1.5 rounded-full bg-primary" />
                    {perm}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite}>
              <UserPlus className="mr-2 size-4" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
