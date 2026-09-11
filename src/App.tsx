import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { DriveEraserModule } from './components/driveEraser/DriveEraserModule';
import { FileEraserModule } from './components/fileEraser/FileEraserModule';
import { FileCarverModule } from './components/carver/FileCarverModule';
import { ComplianceAuditModule } from './components/compliance/ComplianceAuditModule';
import { DocumentationModule } from './components/docs/DocumentationModule';
import { LoginPage } from './components/auth/LoginPage';
import { UIProvider } from './context/UIContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function MainAppLayout() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated || showLoginModal) {
    return (
      <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex flex-col">
        <Navbar currentTab={activeTab} onOpenLogin={() => setShowLoginModal(true)} />
        <main className="flex-1 flex items-center justify-center p-4">
          <LoginPage onSuccess={() => setShowLoginModal(false)} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar currentTab={activeTab} onOpenLogin={() => setShowLoginModal(true)} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        {/* Sidebar Navigation */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Dynamic Main Stage */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeTab === 'dashboard' && (
            <OverviewDashboard onNavigate={setActiveTab} />
          )}

          {activeTab === 'drive_eraser' && (
            <DriveEraserModule />
          )}

          {activeTab === 'file_eraser' && (
            <FileEraserModule />
          )}

          {activeTab === 'file_carver' && (
            <FileCarverModule />
          )}

          {activeTab === 'compliance_audit' && (
            <ComplianceAuditModule />
          )}

          {activeTab === 'documentation' && (
            <DocumentationModule />
          )}
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <MainAppLayout />
      </AuthProvider>
    </UIProvider>
  );
}

export default App;

