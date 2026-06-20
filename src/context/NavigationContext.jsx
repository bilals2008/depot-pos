// File: ogs-client/depot/src/context/NavigationContext.jsx
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const NavigationContext = createContext();

const INITIAL_PARAMS = {};

export const NavigationProvider = ({ children }) => {
  const [navParams, setNavParams] = useState(INITIAL_PARAMS);
  const [history, setHistory] = useState([]);

  const setParams = useCallback((params) => {
    setNavParams(params);
  }, []);

  const clearParams = useCallback(() => {
    setNavParams(prev => {
      if (prev === INITIAL_PARAMS || Object.keys(prev).length === 0) {
        return INITIAL_PARAMS;
      }
      return INITIAL_PARAMS;
    });
  }, []);

  const pushToHistory = useCallback((path) => {
    setHistory(prev => {
      // Don't push if it's the same as the last path
      if (prev.length > 0 && prev[prev.length - 1] === path) {
        return prev;
      }
      return [...prev, path];
    });
  }, []);

  const popHistory = useCallback(() => {
    let previousPath = "/";
    setHistory(prev => {
      if (prev.length <= 1) {
        previousPath = "/";
        return prev;
      }
      const newHistory = [...prev];
      newHistory.pop(); // Remove current
      previousPath = newHistory[newHistory.length - 1];
      return newHistory;
    });
    return previousPath;
  }, []);

  const value = useMemo(() => ({
    navParams,
    setParams,
    clearParams,
    history,
    pushToHistory,
    popHistory
  }), [navParams, setParams, clearParams, history, pushToHistory, popHistory]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
