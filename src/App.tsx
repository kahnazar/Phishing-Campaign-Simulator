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
import { useAppData } from "./lib/app-data-context";

export default function App() {
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
      case "training":
        return <DashboardView onNavigate={handleNavigate} />;
      default:
        return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  return (
    <I18nProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar currentView={currentView} onNavigate={handleNavigate} />
          <SidebarInset className="flex-1">
            <div className="h-screen flex flex-col overflow-hidden">
              {error && (
                <div className="border-b border-destructive/40 bg-destructive/10 px-6 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {renderView()}
            </div>
          </SidebarInset>
        </div>
        <Toaster />
      </SidebarProvider>
    </I18nProvider>
  );
}
