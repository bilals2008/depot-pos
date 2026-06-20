// File: ogs-client/depot/src/components/SyncStatus.jsx
import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion as Motion, AnimatePresence } from 'motion/react';

export default function SyncStatus() {
    const [status, setStatus] = useState('Checking');
    const [lastSyncMsg, setLastSyncMsg] = useState('Connecting...');
    const [syncCount, setSyncCount] = useState(0);

    useEffect(() => {
        window.electron.checkConnection().then(online => {
            setStatus(online ? 'Online' : 'Offline');
            setLastSyncMsg(online ? 'Cloud Active' : 'Offline Mode');
        });

        const removeListener = window.electron.onSyncLog((msg) => {
            if (msg === 'Online') {
                setStatus('Online');
                setLastSyncMsg('Cloud Active');
                setSyncCount(0);
            } else if (msg === 'Offline') {
                setStatus('Offline');
                setLastSyncMsg('Offline Mode');
            } else {
                // Parse count from message like "Synced 4 sales"
                const count = parseInt(msg.match(/\d+/) || [0], 10);

                setStatus('Synced');
                setLastSyncMsg(msg);
                if (count > 0) setSyncCount(count);

                // Reset to Online after 5 seconds to give user time to notice the badge
                setTimeout(() => {
                    setStatus('Online');
                    setSyncCount(0);
                }, 5000);
            }
        });

        return () => {
            if (removeListener) removeListener();
        };
    }, []);

    const getIcon = () => {
        if (status === 'Online') return <Cloud className="h-5 w-5 text-emerald-500" />;
        if (status === 'Offline') return <CloudOff className="h-5 w-5 text-red-500" />;
        if (status === 'Synced') return (
            <Motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                transition={{ duration: 0.5, repeat: 3 }}
            >
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
            </Motion.div>
        );
        return <RefreshCw className="h-5 w-5 text-muted-foreground animate-spin" />;
    };

    return (
        <TooltipProvider>
            <div className="relative group">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-lg relative overflow-hidden">
                            {getIcon()}

                            {/* Silent Pulse Animation for 'Online' state */}
                            {status === 'Online' && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500/20 animate-ping" />
                                </span>
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium bg-card border-border shadow-xl">
                        <div className="flex flex-col gap-1 p-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Cloud Sync</span>
                            <span className="text-foreground">{lastSyncMsg}</span>
                        </div>
                    </TooltipContent>
                </Tooltip>

                {/* Silent Count Badge */}
                <AnimatePresence>
                    {syncCount > 0 && status === 'Synced' && (
                        <Motion.div
                            initial={{ scale: 0, x: 5, y: -5 }}
                            animate={{ scale: 1, x: 0, y: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-background z-50 pointer-events-none"
                        >
                            {syncCount}
                        </Motion.div>
                    )}
                </AnimatePresence>
            </div>
        </TooltipProvider>
    );
}
