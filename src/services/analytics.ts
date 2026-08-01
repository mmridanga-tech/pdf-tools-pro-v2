// Google Analytics 4 & Custom Analytics Service

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
  customData?: Record<string, any>;
}

class AnalyticsService {
  private initialized = false;
  private trackingId: string = import.meta.env.VITE_GA_TRACKING_ID || 'G-SMARTPDF2026';
  private sessionStartTime: number = Date.now();

  public init() {
    if (this.initialized) return;
    this.initialized = true;

    // Track initial page view & session start
    this.trackSessionStart();

    // Attach unload listener for session duration
    window.addEventListener('beforeunload', () => {
      const sessionDurationSeconds = Math.round((Date.now() - this.sessionStartTime) / 1000);
      this.trackEvent({
        category: 'Session',
        action: 'Session Duration',
        value: sessionDurationSeconds,
      });
    });

    console.log('[Analytics] Service initialized with ID:', this.trackingId);
  }

  public trackPageView(path: string, title?: string) {
    this.trackEvent({
      category: 'Navigation',
      action: 'Page View',
      label: path,
      customData: { page_title: title || document.title, page_location: window.location.href },
    });
  }

  public trackToolOpen(toolId: string, toolName: string) {
    this.trackEvent({
      category: 'Tools',
      action: 'Open Tool',
      label: toolName,
      customData: { tool_id: toolId },
    });
  }

  public trackUpload(toolName: string, fileCount: number, totalSizeBytes: number) {
    this.trackEvent({
      category: 'File Operation',
      action: 'File Upload',
      label: toolName,
      value: fileCount,
      customData: { total_size_mb: (totalSizeBytes / (1024 * 1024)).toFixed(2) },
    });
  }

  public trackDownload(toolName: string, fileName: string, fileSizeBytes?: number) {
    this.trackEvent({
      category: 'File Operation',
      action: 'File Download',
      label: toolName,
      customData: { file_name: fileName, file_size_bytes: fileSizeBytes },
    });
  }

  public trackConversion(planName: string, amount: number) {
    this.trackEvent({
      category: 'Revenue',
      action: 'Subscription Conversion',
      label: planName,
      value: amount,
    });
  }

  public trackError(errorMessage: string, source: string) {
    this.trackEvent({
      category: 'Application Error',
      action: 'Client Error',
      label: `${source}: ${errorMessage}`,
    });
  }

  public trackSearch(query: string, resultCount: number) {
    this.trackEvent({
      category: 'Search',
      action: 'Query Executed',
      label: query,
      value: resultCount,
    });
  }

  public trackEvent(event: AnalyticsEvent) {
    const timestamp = new Date().toISOString();
    const payload = { ...event, timestamp, url: window.location.pathname };

    // Console telemetry log for dev verification
    if (import.meta.env.DEV) {
      console.log('📊 [Analytics Event]:', payload);
    }

    // Window gtag dispatcher if GA script present
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.customData,
      });
    }
  }

  private trackSessionStart() {
    this.trackEvent({
      category: 'Session',
      action: 'Session Start',
      label: new Date().toLocaleDateString(),
    });
  }
}

export const analytics = new AnalyticsService();
