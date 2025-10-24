import { 
  LayoutDashboard, 
  Mail, 
  FolderOpen, 
  Users, 
  BarChart3, 
  Settings, 
  Shield,
  BookOpen
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
import { LanguageSelector } from "./language-selector";

interface AppSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function AppSidebar({ currentView, onNavigate }: AppSidebarProps) {
  const { t } = useTranslation();
  
  const menuItems = [
    { title: t.dashboard, icon: LayoutDashboard, id: "dashboard" },
    { title: t.campaigns, icon: Mail, id: "campaigns" },
    { title: t.templates, icon: FolderOpen, id: "templates" },
    { title: t.recipients, icon: Users, id: "recipients" },
    { title: t.reports, icon: BarChart3, id: "reports" },
  ];

  const settingsItems = [
    { title: t.settings, icon: Settings, id: "settings" },
    { title: t.team, icon: Shield, id: "team" },
    { title: t.training, icon: BookOpen, id: "training" },
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
              {settingsItems.map((item) => (
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
    </Sidebar>
  );
}
