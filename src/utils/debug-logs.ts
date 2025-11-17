// Debug logs utility for mobile debugging
// This utility captures console logs and makes them accessible on mobile devices

interface LogEntry {
  timestamp: Date;
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

class DebugLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep only last 1000 logs to prevent memory issues

  constructor() {
    this.setupConsoleLogging();
  }

  private setupConsoleLogging() {
    // Override console methods to capture logs
    const originalLog = console.log;
    const originalInfo = console.info;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalDebug = console.debug;

    console.log = (...args) => {
      this.addLog('log', ...args);
      originalLog.apply(console, args);
    };

    console.info = (...args) => {
      this.addLog('info', ...args);
      originalInfo.apply(console, args);
    };

    console.warn = (...args) => {
      this.addLog('warn', ...args);
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      this.addLog('error', ...args);
      originalError.apply(console, args);
    };

    console.debug = (...args) => {
      this.addLog('debug', ...args);
      originalDebug.apply(console, args);
    };
  }

  private addLog(level: LogEntry['level'], ...args: any[]) {
    const timestamp = new Date();
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');

    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      data: args.length > 1 ? args : args[0]
    };

    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  public getLogs(): LogEntry[] {
    return [...this.logs]; // Return a copy to prevent external modifications
  }

  public getLogsByLevel(level: LogEntry['level']): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public exportLogs(): string {
    return this.logs.map(log => 
      `${log.timestamp.toISOString()} [${log.level.toUpperCase()}] ${log.message}`
    ).join('\n');
  }

  public getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  public getDebugLogs(): LogEntry[] {
    return this.logs.filter(log => 
      log.message.includes('[DEBUG]') || 
      log.message.includes('[DEBUG API]')
    );
  }
}

// Create a singleton instance for use throughout the app
export const debugLogger = new DebugLogger();

// Function to copy logs to clipboard
export const copyLogsToClipboard = async (): Promise<boolean> => {
  try {
    const logs = debugLogger.exportLogs();
    await navigator.clipboard.writeText(logs);
    return true;
  } catch (error) {
    console.error('Failed to copy logs to clipboard:', error);
    return false;
  }
};

// Function to download logs as a file
export const downloadLogs = (): void => {
  const logs = debugLogger.exportLogs();
  const blob = new Blob([logs], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `debug-logs-${new Date().toISOString().slice(0, 19)}.txt`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

// Function to get a summary of recent logs for quick debugging
export const getLogSummary = (): string => {
  const recentLogs = debugLogger.getRecentLogs(10);
  return recentLogs.map(log => 
    `[${log.level.toUpperCase()}] ${log.message}`
  ).join('\n');
};