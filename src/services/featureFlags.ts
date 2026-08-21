export interface FeatureFlags {
  enableAiChat: boolean;
  enableAiAssistant: boolean;
  enableOcrEngine: boolean;
  enableCloudSync: boolean;
  enableTeamWorkspaces: boolean;
  enableDarkHighContrast: boolean;
  enableBetaWatermark: boolean;
  enableBatchProcessing: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableAiChat: true,
  enableAiAssistant: true,
  enableOcrEngine: true,
  enableCloudSync: true,
  enableTeamWorkspaces: true,
  enableDarkHighContrast: true,
  enableBetaWatermark: true,
  enableBatchProcessing: true,
};

const FEATURE_FLAGS_STORAGE_KEY = 'smartpdf_feature_flags_v1';

export function getStoredFeatureFlags(): FeatureFlags {
  try {
    const raw = localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_FEATURE_FLAGS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_FEATURE_FLAGS;
}

export function saveStoredFeatureFlags(flags: FeatureFlags): void {
  try {
    localStorage.setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(flags));
  } catch {}
}
