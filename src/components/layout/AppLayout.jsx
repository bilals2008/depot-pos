// File: ogs-client/depot/src/components/layout/AppLayout.jsx
import AppSidebar from "./AppSidebar";

const AppLayout = ({ children, activePath, onNavigate, onOpenPos }) => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar activePath={activePath} onNavigate={onNavigate} onOpenPos={onOpenPos} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
