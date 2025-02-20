import logger from './logger';

export interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

export class MemoryMonitor {
  private lastSnapshot: MemoryStats | null = null;
  private interval: number | null = null;
  private readonly SIGNIFICANT_CHANGE_THRESHOLD = 10; // MB

  getStats(): MemoryStats {
    const stats = process.memoryUsage();
    return {
      heapUsed: Math.round(stats.heapUsed / 1024 / 1024),
      heapTotal: Math.round(stats.heapTotal / 1024 / 1024),
      external: Math.round(stats.external / 1024 / 1024),
      rss: Math.round(stats.rss / 1024 / 1024)
    };
  }

  private hasSignificantChange(current: MemoryStats): boolean {
    if (!this.lastSnapshot) return true;
    
    return Math.abs(current.heapUsed - this.lastSnapshot.heapUsed) > this.SIGNIFICANT_CHANGE_THRESHOLD ||
           Math.abs(current.rss - this.lastSnapshot.rss) > this.SIGNIFICANT_CHANGE_THRESHOLD;
  }

  logMemoryDiff(): void {
    const current = this.getStats();
    if (this.hasSignificantChange(current)) {
      if (this.lastSnapshot) {
        const diff = {
          heapUsed: current.heapUsed - this.lastSnapshot.heapUsed,
          heapTotal: current.heapTotal - this.lastSnapshot.heapTotal,
          external: current.external - this.lastSnapshot.external,
          rss: current.rss - this.lastSnapshot.rss
        };

        logger.debug({
          current,
          diff,
          timestamp: new Date().toISOString()
        }, 'Significant memory change detected');
      }
      this.lastSnapshot = current;
    }
  }

  startMonitoring(intervalMs: number = 60000): void {
    if (this.interval) {
      this.stopMonitoring();
    }
    
    if (process.env.DEBUG === 'true') {
      this.interval = setInterval(() => this.logMemoryDiff(), intervalMs);
      logger.debug({ intervalMs }, 'Memory monitoring started');
    }
  }

  stopMonitoring(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.lastSnapshot = null;
      if (process.env.DEBUG === 'true') {
        logger.debug('Memory monitoring stopped');
      }
    }
  }
}