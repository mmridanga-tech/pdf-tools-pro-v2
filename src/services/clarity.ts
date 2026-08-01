// Microsoft Clarity User Heatmap & Behavioral Tracking Service

class ClarityService {
  private initialized = false;
  private projectKey = import.meta.env.VITE_CLARITY_KEY || 'smartpdf_clarity_prod';

  public init() {
    if (this.initialized) return;
    this.initialized = true;

    // Track rage clicks and dead clicks setup
    this.setupBehaviorTrackers();
    console.log('[Clarity] Service initialized with Key:', this.projectKey);
  }

  public setCustomTag(key: string, value: string) {
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('set', key, value);
    }
  }

  public trackUserAction(actionName: string) {
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('event', actionName);
    }
  }

  private setupBehaviorTrackers() {
    let clickCount = 0;
    let lastClickTime = 0;

    window.addEventListener('click', (e) => {
      const now = Date.now();
      if (now - lastClickTime < 400) {
        clickCount++;
        if (clickCount >= 3) {
          this.trackUserAction('rage_click_detected');
          clickCount = 0;
        }
      } else {
        clickCount = 1;
      }
      lastClickTime = now;

      // Track dead clicks on unclickable elements
      const target = e.target as any;
      if (target) {
        const closestFn = typeof target.closest === 'function' ? target.closest.bind(target) : (target.parentElement && typeof target.parentElement.closest === 'function' ? target.parentElement.closest.bind(target.parentElement) : null);
        if (closestFn) {
          const isInteractive = closestFn('button, a, input, select, textarea, [role="button"]');
          if (!isInteractive) {
            this.trackUserAction('dead_click_potential');
          }
        }
      }
    });

    // Track scroll depth thresholds
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const percent = Math.round((window.scrollY / scrollHeight) * 100);
        if (percent > maxScroll + 25) {
          maxScroll = Math.floor(percent / 25) * 25;
          this.setCustomTag('scroll_depth', `${maxScroll}%`);
        }
      }
    });
  }
}

export const clarity = new ClarityService();
