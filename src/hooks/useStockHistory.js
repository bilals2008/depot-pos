// File: ogs-client/depot/src/hooks/useStockHistory.js
import { useState, useCallback, useEffect } from 'react';

export const useStockHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStockHistory = useCallback(async () => {
    setLoading(true);
    try {
      if (!window.electron) {
        console.warn("Electron API not found");
        setLogs([]);
        return;
      }

      const history = await window.electron.getStockHistory();
      
      // Map DB fields to UI expected fields if needed
      // DB: product_name, previous_stock, current_stock, change_amount, created_at
      // UI matches these mostly, but let's ensure naming convention
      const mappedHistory = history.map(log => ({
          ...log,
          timestamp: log.createdAt, // Map for UI
          change: log.changeAmount  // Map for UI
      }));

      setLogs(mappedHistory);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch stock history:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
      fetchStockHistory();
  }, [fetchStockHistory]);

  return {
    logs,
    loading,
    error,
    fetchStockHistory
  };
};
