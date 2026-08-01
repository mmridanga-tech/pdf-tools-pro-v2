import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  FeatureFlags,
  DEFAULT_FEATURE_FLAGS,
  getStoredFeatureFlags,
  saveStoredFeatureFlags,
} from '../services/featureFlags';

interface FeatureFlagContextType {
  flags: FeatureFlags;
  toggleFlag: (key: keyof FeatureFlags) => void;
  resetFlags: () => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags>(getStoredFeatureFlags);

  useEffect(() => {
    saveStoredFeatureFlags(flags);
  }, [flags]);

  const toggleFlag = (key: keyof FeatureFlags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetFlags = () => {
    setFlags(DEFAULT_FEATURE_FLAGS);
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, toggleFlag, resetFlags }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  return context;
};
