export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  details?: any;
}

export class ConversionLogger {
  private logs: LogEntry[] = [];
  private moduleName: string;
  private timers: Map<string, number> = new Map();

  constructor(moduleName = 'ConversionEngine') {
    this.moduleName = moduleName;
  }

  info(message: string, details?: any) {
    this.addLog('info', message, details);
  }

  warn(message: string, details?: any) {
    this.addLog('warn', message, details);
  }

  error(message: string, details?: any) {
    this.addLog('error', message, details);
  }

  debug(message: string, details?: any) {
    this.addLog('debug', message, details);
  }

  startTimer(label: string) {
    this.timers.set(label, Date.now());
  }

  endTimer(label: string): number {
    const start = this.timers.get(label);
    if (!start) return 0;
    const duration = Date.now() - start;
    this.timers.delete(label);
    this.info(`[Timer] ${label} completed in ${duration} ms`);
    return duration;
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
    this.timers.clear();
  }

  private addLog(level: LogLevel, message: string, details?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module: this.moduleName,
      message,
      details,
    };
    this.logs.push(entry);

    if (level === 'error') {
      console.error(`[${this.moduleName}] ${message}`, details || '');
    } else if (level === 'warn') {
      console.warn(`[${this.moduleName}] ${message}`, details || '');
    }
  }
}
