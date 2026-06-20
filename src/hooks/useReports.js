// File: ogs-client/depot/src/hooks/useReports.js
import { useState, useCallback } from 'react';

export const useReports = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDailySales = useCallback(async (date) => {
    setLoading(true);
    try {
      if (!window.electron) {
        console.warn("Electron API not found");
        setSales([]);
        return;
      }

      // Calculate start and end of the day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const result = await window.electron.getSales(startOfDay, endOfDay);
      
      // Map DB fields to UI expected fields if necessary
      // DB: totalAmount, createdAt
      // UI: total, date
      const mappedSales = result.map(sale => ({
        ...sale,
        total: sale.totalAmount, // Map for UI compatibility
        date: sale.createdAt     // Map for UI compatibility
      }));

      setSales(mappedSales);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch daily sales:", err);
      setError(err.message);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sales,
    loading,
    error,
    fetchDailySales
  };
};
