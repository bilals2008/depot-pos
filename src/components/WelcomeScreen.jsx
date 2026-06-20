// File: ogs-client/depot/src/components/WelcomeScreen.jsx
import { useEffect, useState } from "react";

const WelcomeScreen = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 1000); // Wait for exit animation
    }, 2500); // Show for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background text-foreground transition-opacity duration-1000 ease-in-out ${isExiting ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className={`flex flex-col items-center transform transition-all duration-1000 ease-out ${isExiting ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}`}>
        <div className="relative mb-8">
          <div className="absolute inset-0 -m-4 rounded-full bg-blue-500/10 blur-2xl animate-pulse" />
          <img 
            src="/logo-white.png" 
            alt="Orion Orbit Logo" 
            className="relative h-24 w-24 object-contain animate-in fade-in zoom-in duration-700 dark:invert-0 invert"
          />
        </div>
        
        <h1 className="text-4xl font-light tracking-[0.2em] uppercase animate-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
          Orion <span className="font-bold text-blue-600">Orbit</span>
        </h1>
        
        <div className="mt-6 w-32 h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent animate-in zoom-in-x duration-1000 delay-500 fill-mode-both" />
        
        <p className="mt-6 text-[10px] tracking-[0.4em] font-medium text-muted-foreground uppercase animate-in fade-in duration-1000 delay-700 fill-mode-both">
          System Initialized
        </p>
      </div>
      
      <div className="absolute bottom-16 w-48 h-px bg-zinc-900 rounded-full overflow-hidden">
        <div className="w-full h-full bg-blue-600/50 animate-[shimmer_2s_infinite_linear]" />
      </div>
    </div>
  );
};

export default WelcomeScreen;
