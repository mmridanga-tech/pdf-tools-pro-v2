// Production Error Reporting & Telemetry System

export interface LoggedError {
  id: string;
  message: string;
  stack?: string;
  source: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

class ErrorReporterService {
  private errors: LoggedError[] = [];
  private maxStoredErrors = 50;

  public init() {
    // Unhandled Window Errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        source: 'Window Error Handler',
      });
    });

    // Unhandled Promise Rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        source: 'Unhandled Promise Rejection',
      });
    });

    console.log('[ErrorReporter] Global error listeners initialized');
  }

  public captureError(data: { message: string; stack?: string; source: string }) {
    const errorObj: LoggedError = {
      id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      message: data.message,
      stack: data.stack,
      source: data.source,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.errors.unshift(errorObj);
    if (this.errors.length > this.maxStoredErrors) {
      this.errors.pop();
    }

    if (import.meta.env.DEV) {
      console.warn('⚡ [Captured Error]:', errorObj.message, errorObj.source);
    }
  }

  public getErrors(): LoggedError[] {
    return [...this.errors];
  }

  public clearErrors() {
    this.errors = [];
  }
}

export const errorReporter = new ErrorReporterService();
