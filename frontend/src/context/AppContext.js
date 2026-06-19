import React, { createContext, useContext, useState, useCallback } from 'react';
import { getParts, getConfigurations } from '../utils/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [parts, setParts] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshParts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getParts({ isActive: true });
      setParts(res.data.data);
    } catch (err) {
      console.error('Failed to load parts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshConfigurations = useCallback(async () => {
    try {
      const res = await getConfigurations();
      setConfigurations(res.data.data);
    } catch (err) {
      console.error('Failed to load configurations:', err);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      parts, setParts,
      configurations, setConfigurations,
      loading,
      refreshParts,
      refreshConfigurations
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
