// File: ogs-client/depot/src/components/pos/Layout.jsx
import { ScrollArea } from "@/components/ui/scroll-area";

const Layout = ({ children, sidebar }) => {
  return (
    <div className="flex h-screen w-full bg-muted/40 overflow-hidden">
      {/* Sidebar (Cart) */}
      <aside className="w-100 shrink-0 border-r bg-background flex flex-col h-full shadow-xl z-20">
        {sidebar}
      </aside>

      {/* Main Content (Product Grid) */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background/50">
        {children}
      </main>
    </div>
  );
};

export default Layout;
