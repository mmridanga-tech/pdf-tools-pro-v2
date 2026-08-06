export interface EngineConfig {
  maxFileSizeBytes: number;
  maxPageCount: number;
  defaultEngineMode: 'client' | 'server' | 'auto';
  serverApiEndpoint: string;
  conversionTimeoutMs: number;
  enableOcrFallback: boolean;
  maxMemoryThresholdMb: number;
  concurrentJobLimit: number;
  imageCompressionQuality: number;
}

export const DEFAULT_CONVERSION_CONFIG: EngineConfig = {
  maxFileSizeBytes: 100 * 1024 * 1024, // 100 MB
  maxPageCount: 500,
  defaultEngineMode: 'auto',
  serverApiEndpoint: '/api/convert/pdfToWord',
  conversionTimeoutMs: 120000, // 2 minutes
  enableOcrFallback: true,
  maxMemoryThresholdMb: 512,
  concurrentJobLimit: 3,
  imageCompressionQuality: 0.85,
};

export class ConversionConfigManager {
  private static instance: ConversionConfigManager;
  private config: EngineConfig;

  private constructor(customConfig?: Partial<EngineConfig>) {
    this.config = { ...DEFAULT_CONVERSION_CONFIG, ...customConfig };
  }

  static getInstance(customConfig?: Partial<EngineConfig>): ConversionConfigManager {
    if (!ConversionConfigManager.instance) {
      ConversionConfigManager.instance = new ConversionConfigManager(customConfig);
    } else if (customConfig) {
      ConversionConfigManager.instance.updateConfig(customConfig);
    }
    return ConversionConfigManager.instance;
  }

  getConfig(): Readonly<EngineConfig> {
    return { ...this.config };
  }

  updateConfig(partial: Partial<EngineConfig>): void {
    this.config = { ...this.config, ...partial };
  }

  resetToDefault(): void {
    this.config = { ...DEFAULT_CONVERSION_CONFIG };
  }
}
