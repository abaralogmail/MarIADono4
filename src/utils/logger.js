class Logger {
    constructor(options = {}) {
      if (Logger.instance) {
        return Logger.instance;
      }
      
      this.showTimestamp = options.showTimestamp ?? true;
      this.showFunction = options.showFunction ?? true;
      this.logLevel = options.logLevel ?? 'info';
      Logger.instance = this;
    }
  
    formatMessage(level, message, functionName) {
      const parts = [];
      
      if (this.showTimestamp) {
        parts.push(`[${new Date().toISOString()}]`);
      }
      
      if (this.showFunction && functionName) {
        parts.push(`[${functionName}]`);
      }
      
      parts.push(`[${level.toUpperCase()}]`);
      parts.push(message);
      
      return parts.join(' ');
    }
  
    getFunctionName() {
        const stack = new Error().stack;
        // Skip first 3 lines (Error, getFunctionName, log/debug/error method)
        // Get the 4th line which contains the actual caller
        const callerLine = stack.split('\n')[4];
        const match = callerLine.match(/at\s+(.*)\s+\(/);
        return match ? match[1] : 'Unknown';
      }
  
    log(message) {
      if (this.shouldLog('info')) {
        console.log(this.formatMessage('info', message, this.getFunctionName()));
      }
    }
  
    error(message) {
      if (this.shouldLog('error')) {
        console.error(this.formatMessage('error', message, this.getFunctionName()));
      }
    }
  
    debug(message) {
      if (this.shouldLog('debug')) {
        console.debug(this.formatMessage('debug', message, this.getFunctionName()));
      }
    }
  
    shouldLog(level) {
      const levels = {
        error: 0,
        info: 1, 
        debug: 2
      };
      return levels[level] <= levels[this.logLevel];
    }
  }

const logger = new Logger();
export { logger };
export default logger;
  