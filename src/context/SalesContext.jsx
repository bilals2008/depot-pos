// File: ogs-client/depot/src/context/SalesContext.jsx
import { createContext, useContext } from "react";

const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  // Removed global sales state to prevent OOM

  const addSale = async (newSale) => {
    try {
      const result = await window.electron.createSale(newSale);
      if (result && result.success) {
        console.log("Sale saved to database");
        return result;
      }
    } catch (error) {
      console.error("Failed to save sale:", error);
      throw error;
    }
  };

  const processReturn = async (returnData) => {
    try {
      if (window.electron) {
        const result = await window.electron.processReturn(returnData);
        return result;
      }
    } catch (error) {
      console.error("Failed to process return:", error);
      throw error;
    }
  };

  return (
    <SalesContext.Provider value={{ addSale, processReturn }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
};
