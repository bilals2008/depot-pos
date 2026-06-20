// File: ogs-client/depot/src/pages/HomePage.jsx
import HomeDashboard from "@/components/dashboard/HomeDashboard";

const HomePage = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* New Simple Dashboard */}
      <HomeDashboard 
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default HomePage;
