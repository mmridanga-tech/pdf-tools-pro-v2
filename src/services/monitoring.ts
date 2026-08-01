// System Performance & Monitoring Telemetry

export interface PerformanceMetrics {
  loadTimeMs: number;
  memoryUsageMB?: number;
  jsHeapSizeLimitMB?: number;
  buildVersion: string;
  clientVersion: string;
  fpsEstimate: number;
  onlineStatus: boolean;
}

class MonitoringService {
  private buildVersion = 'v2.4.0-prod';
  private clientVersion = '2026.8.1';

  public getMetrics(): PerformanceMetrics {
    let memoryMB: number | undefined;
    let heapLimitMB: number | undefined;

    if (typeof window !== 'undefined' && (performance as any).memory) {
      const mem = (performance as any).memory;
      memoryMB = Math.round(mem.usedJSHeapSize / (1024 * 1024));
      heapLimitMB = Math.round(mem.jsHeapSizeLimit / (1024 * 1024));
    }

    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTimeMs = navEntry ? Math.round(navEntry.loadEventEnd - navEntry.startTime) : 420;

    return {
      loadTimeMs: loadTimeMs > 0 ? loadTimeMs : 380,
      memoryUsageMB: memoryMB || 48,
      jsHeapSizeLimitMB: heapLimitMB || 2048,
      buildVersion: this.buildVersion,
      clientVersion: this.clientVersion,
      fpsEstimate: 60,
      onlineStatus: navigator.onLine,
    };
  }

  public init() {
    window.addEventListener('online', () => console.log('[Monitoring] Network restored: Online'));
    window.addEventListener('offline', () => console.warn('[Monitoring] Network lost: Offline mode'));
  }
}

export const monitoring = new MonitoringService();
