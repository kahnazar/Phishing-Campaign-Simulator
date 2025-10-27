import { useState } from "react";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { DashboardView } from "./components/dashboard-view";
import { TemplatesView } from "./components/templates-view";
import { CampaignsView } from "./components/campaigns-view";
import { CampaignBuilderView } from "./components/campaign-builder-view";
import { EditorView } from "./components/editor-view";
import { ReportsView } from "./components/reports-view";
import { RecipientsView } from "./components/recipients-view";
import { SettingsView } from "./components/settings-view";
import { TeamView } from "./components/team-view";
import { Toaster } from "./components/ui/sonner";
import { I18nProvider } from "./lib/i18n";
import { useAuth } from "./lib/auth-context";
import { LoginView } from "./components/login-view";
import { useAppData } from "./lib/app-data-context";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <div className="size-10 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
      <p className="text-sm text-muted-foreground">Preparing PhishLab…</p>
    </div>
  );
}

function AuthenticatedApp() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [viewData, setViewData] = useState<any>(null);
  const { error } = useAppData();

  const handleNavigate = (view: string, data?: any) => {
    setCurrentView(view);
    setViewData(data);
  };

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView onNavigate={handleNavigate} />;
      case "campaigns":
        return <CampaignsView onNavigate={handleNavigate} />;
      case "templates":
        return <TemplatesView onNavigate={handleNavigate} />;
      case "builder":
        return <CampaignBuilderView onNavigate={handleNavigate} />;
      case "editor":
        return <EditorView template={viewData?.template || viewData} onNavigate={handleNavigate} />;
      case "recipients":
        return <RecipientsView onNavigate={handleNavigate} />;
      case "reports":
        return <ReportsView onNavigate={handleNavigate} />;
      case "settings":
        return <SettingsView onNavigate={handleNavigate} />;
      case "team":
        return <TeamView onNavigate={handleNavigate} />;
      default:
        return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden bg-background">
        <AppSidebar currentView={currentView} onNavigate={handleNavigate} />
        <SidebarInset className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
          <div className="flex flex-1 flex-col">
            {error && (
              <div className="border-b border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:px-6">
                {error}
              </div>
            )}
            {renderView()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  const { user, initializing } = useAuth();

  return (
    <I18nProvider>
      {initializing ? <LoadingScreen /> : user ? <AuthenticatedApp /> : <LoginView />}
      <Toaster />
    </I18nProvider>
  );
}
