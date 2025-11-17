'use client';

import { useState, useEffect, useCallback } from 'react';
import { debugLogger, copyLogsToClipboard, downloadLogs, getLogSummary } from '@/utils/debug-logs';

interface LogEntry {
  timestamp: Date;
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

// A debug overlay that can be toggled on mobile for viewing logs
const DebugOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [logLevelFilter, setLogLevelFilter] = useState<'all' | 'error' | 'warn' | 'info' | 'log' | 'debug'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Update logs when they change
  useEffect(() => {
    if (isOpen) {
      setLogs(debugLogger.getLogs());
    }
  }, [isOpen]);

  // Auto-refresh logs if enabled
  useEffect(() => {
    if (!autoRefresh || !isOpen) return;

    const interval = setInterval(() => {
      setLogs(debugLogger.getLogs());
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, isOpen]);

  // Keyboard shortcut to toggle debug overlay (press 'D' key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only toggle if user is not typing in an input
      if (e.key.toLowerCase() === 'd' && 
          !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter logs based on selected filter and search term
  const filteredLogs = logs.filter(log => {
    const matchesLevel = logLevelFilter === 'all' || log.level === logLevelFilter;
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.data && JSON.stringify(log.data).toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesLevel && matchesSearch;
  });

  // Clear logs
  const handleClearLogs = () => {
    debugLogger.clearLogs();
    setLogs([]);
  };

  // Copy logs to clipboard
  const handleCopyLogs = async () => {
    const success = await copyLogsToClipboard();
    if (success) {
      alert('Logs copied to clipboard!');
    } else {
      alert('Failed to copy logs to clipboard');
    }
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // Get log level color
  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500';
      case 'warn': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      case 'debug': return 'text-purple-500';
      default: return 'text-gray-300';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg text-xs"
        title="Show Debug Logs (Press 'D')"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black bg-opacity-90 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-bold">Debug Logs</h2>
          <span className="text-xs text-gray-400">
            {filteredLogs.length} of {logs.length} logs
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAutoRefresh}
            className={`p-1 rounded ${autoRefresh ? 'bg-green-600' : 'bg-gray-700'}`}
            title="Auto-refresh logs"
          >
            {autoRefresh ? '🔄' : '⏸️'}
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 rounded bg-gray-700"
            title="Settings"
          >
            ⚙️
          </button>
          
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded bg-red-600"
            title="Close (Press 'D')"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-2 bg-gray-800 border-b border-gray-700">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <label className="mr-2 text-sm">Filter:</label>
              <select
                value={logLevelFilter}
                onChange={(e) => setLogLevelFilter(e.target.value as any)}
                className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
              >
                <option value="all">All</option>
                <option value="debug">Debug</option>
                <option value="log">Log</option>
                <option value="info">Info</option>
                <option value="warn">Warn</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 text-white px-2 py-1 rounded text-sm w-40"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleClearLogs}
                className="px-2 py-1 bg-red-700 rounded text-sm"
              >
                Clear
              </button>
              <button
                onClick={handleCopyLogs}
                className="px-2 py-1 bg-blue-700 rounded text-sm"
              >
                Copy
              </button>
              <button
                onClick={downloadLogs}
                className="px-2 py-1 bg-green-700 rounded text-sm"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and controls */}
      {!showSettings && (
        <div className="p-2 bg-gray-800 border-b border-gray-700 flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm flex-grow min-w-[150px]"
          />
          <div className="flex space-x-2">
            <button
              onClick={toggleAutoRefresh}
              className={`px-2 py-1 rounded text-sm ${autoRefresh ? 'bg-green-700' : 'bg-gray-700'}`}
            >
              {autoRefresh ? 'Auto: ON' : 'Auto: OFF'}
            </button>
            <button
              onClick={handleClearLogs}
              className="px-2 py-1 bg-red-700 rounded text-sm"
            >
              Clear
            </button>
            <button
              onClick={handleCopyLogs}
              className="px-2 py-1 bg-blue-700 rounded text-sm"
            >
              Copy
            </button>
            <button
              onClick={downloadLogs}
              className="px-2 py-1 bg-green-700 rounded text-sm"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Logs List */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-400 text-center py-4">
            {logs.length === 0 ? 'No logs yet' : 'No logs match the current filter'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log, index) => (
              <div 
                key={index} 
                className={`p-2 rounded border-l-2 ${getLogLevelColor(log.level).replace('text-', 'border-')}`}
                style={{ backgroundColor: 'rgba(30, 30, 30, 0.5)' }}
              >
                <div className="flex items-start">
                  <span className={`mr-2 ${getLogLevelColor(log.level)}`}>
                    [{log.level.toUpperCase()}]
                  </span>
                  <div className="flex-1">
                    <div>{log.message}</div>
                    {log.data && (
                      <details className="mt-1 text-gray-400">
                        <summary className="cursor-pointer text-xs">Details</summary>
                        <pre className="mt-1 text-xs whitespace-pre-wrap bg-gray-900 p-1 rounded overflow-x-auto">
                          {typeof log.data === 'object' 
                            ? JSON.stringify(log.data, null, 2) 
                            : String(log.data)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <span className="text-gray-500 text-xs ml-2">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <div>
            Press <kbd className="px-1 bg-gray-700 rounded">D</kbd> to toggle
          </div>
          <div>
            {autoRefresh ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugOverlay;