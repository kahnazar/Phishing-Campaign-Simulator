import {
  LayoutDashboard,
  Mail,
  FolderOpen,
  Users,
  BarChart3,
  Settings,
  Shield,
  BookOpen,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "./ui/sidebar";
import { useTranslation } from "../lib/i18n";
import { useAuth } from "../lib/auth-context";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { LanguageSelector } from "./language-selector";

interface AppSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function AppSidebar({ currentView, onNavigate }: AppSidebarProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "Admin";
  const filteredSettings = [
    { title: t.settings, icon: Settings, id: "settings" },
    ...(isAdmin ? [{ title: t.team, icon: Shield, id: "team" } as const] : []),
    { title: t.training, icon: BookOpen, id: "training" },
  ];

  const initials = (user?.name || user?.email || "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  
  const menuItems = [
    { title: t.dashboard, icon: LayoutDashboard, id: "dashboard" },
    { title: t.campaigns, icon: Mail, id: "campaigns" },
    { title: t.templates, icon: FolderOpen, id: "templates" },
    { title: t.recipients, icon: Users, id: "recipients" },
    { title: t.reports, icon: BarChart3, id: "reports" },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="size-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">PhishLab</p>
              <p className="text-xs text-muted-foreground">Security Training</p>
            </div>
          </div>
          <LanguageSelector />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={currentView === item.id}
                    onClick={() => onNavigate(item.id)}
                  >
                    <item.icon className="size-4" />
                    <span className="capitalize">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredSettings.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={currentView === item.id}
                    onClick={() => onNavigate(item.id)}
                  >
                    <item.icon className="size-4" />
                    <span className="capitalize">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.name ?? user?.email ?? "User"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title={t.signOut}
            aria-label={t.signOut}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
