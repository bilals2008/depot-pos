// File: ogs-client/depot/src/App.jsx
import { useEffect, useState } from "react"; // Added useEffect
// import { useNavigate } from "react-router-dom"; // REMOVED: Project uses manual state routing.
// Actually App uses state-based routing 'activePath' passed to AppLayout. 
// We need to update 'activePath'.

import AppLayout from "./components/layout/AppLayout";
import InventoryPage from "./pages/InventoryPage";
import ReportsPage from "./pages/ReportsPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import StockHistoryPage from "./pages/StockHistoryPage";


import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/CartContext";
import { SalesProvider } from "@/context/SalesContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NavigationProvider, useNavigation } from "@/context/NavigationContext";

import WelcomeScreen from "./components/WelcomeScreen";
import HomePage from "./pages/HomePage";
import SalesPage from "./pages/SalesPage"; 
import ReturnsPage from "./pages/ReturnsPage";
import SettingsPage from "./pages/SettingsPage";

function AppContent() {
  const [activePath, setActivePath] = useState("/");
  const [showWelcome, setShowWelcome] = useState(true);
  const { pushToHistory } = useNavigation();

  // Track history
  useEffect(() => {
    pushToHistory(activePath);
  }, [activePath, pushToHistory]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if inside an input/textarea (optional, but F-keys are usually global)
      // F1 = POS (Drawer), F2 = Inventory, F3 = Reports
      if (e.key === "F1") {
        e.preventDefault();
        setActivePath("/sales"); // Navigate to Sales Page
      } else if (e.key === "F2") {
        e.preventDefault();
        setActivePath("/inventory");
      } else if (e.key === "F3") {
        e.preventDefault();
        setActivePath("/reports");

      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const renderPage = () => {
    switch (activePath) {
      case "/":
        return <HomePage onNavigate={setActivePath} />;
      case "/sales":
        return <SalesPage onNavigate={setActivePath} />;
      case "/inventory":
        return <InventoryPage onNavigate={setActivePath} />;
      case "/reports":
        return <ReportsPage />;
      case "/returns":
        return <ReturnsPage onNavigate={setActivePath} />; 
      case "/sales-history":
        return <SalesHistoryPage onNavigate={setActivePath} />; 
      case "/stock-history":
        return <StockHistoryPage onNavigate={setActivePath} />;
      case "/settings":
        return <SettingsPage />;

      default:
        return <HomePage onNavigate={setActivePath} />;
    }
  };

  return (
    <>
      {showWelcome && <WelcomeScreen onComplete={() => setShowWelcome(false)} />}
      <AppLayout activePath={activePath} onNavigate={setActivePath}>
        {renderPage()}
        <Toaster />
      </AppLayout>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <NavigationProvider>
          <SalesProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </SalesProvider>
        </NavigationProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
