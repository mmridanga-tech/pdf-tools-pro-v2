// Performance Monitoring Utility (Development Mode Only)
export function initPerformanceMonitoring(): void {
  if (!import.meta.env.DEV || typeof window === 'undefined') return;

  const startTime = performance.now();

  // 1. Log Initial Render Time & Load Time
  window.addEventListener(
    'load',
    () => {
      setTimeout(() => {
        const loadDuration = Math.round(performance.now() - startTime);
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        console.log(
          `%c[Perf Monitor] Initial Render / Load: ${loadDuration}ms`,
          'color: #10B981; font-weight: bold;'
        );
        if (navEntry) {
          console.log(
            `%c[Perf Monitor] DOM Content Loaded: ${Math.round(navEntry.domContentLoadedEventEnd)}ms`,
            'color: #3B82F6;'
          );
        }
      }, 0);
    },
    { once: true }
  );

  // 2. PerformanceObserver for Long Tasks (>50ms)
  if ('PerformanceObserver' in window) {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(
              `%c[Perf Monitor] Long Task (>50ms): ${Math.round(entry.duration)}ms`,
              'color: #F59E0B; font-weight: bold;',
              entry
            );
          }
        }
      });
      longTaskObserver.observe({ type: 'longtask', buffered: true });
    } catch {
      // Longtask observer unavailable in some browser contexts
    }
  }
}
