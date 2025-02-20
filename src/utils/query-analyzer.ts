import { Database } from 'bun:sqlite';
import logger from './logger';

interface QueryStats {
  count: number;
  totalTime: number;
  averageTime: number;
  lastExecuted: Date;
}

export class QueryAnalyzer {
  private queryStats: Map<string, QueryStats> = new Map();
  private slowQueryThreshold: number;
  private readonly MAX_QUERIES_TO_TRACK = 100;

  constructor(private db: Database, slowQueryThresholdMs: number = 100) {
    this.slowQueryThreshold = slowQueryThresholdMs;
  }

  recordQuery(sql: string, duration: number): void {
    if (!process.env.DEBUG) return;

    // Cleanup old entries if we're tracking too many queries
    if (this.queryStats.size >= this.MAX_QUERIES_TO_TRACK) {
      const oldestQuery = Array.from(this.queryStats.entries())
        .sort((a, b) => a[1].lastExecuted.getTime() - b[1].lastExecuted.getTime())[0];
      if (oldestQuery) {
        this.queryStats.delete(oldestQuery[0]);
      }
    }

    const stats = this.queryStats.get(sql) || {
      count: 0,
      totalTime: 0,
      averageTime: 0,
      lastExecuted: new Date()
    };

    stats.count++;
    stats.totalTime += duration;
    stats.averageTime = stats.totalTime / stats.count;
    stats.lastExecuted = new Date();

    this.queryStats.set(sql, stats);

    // Only log significantly slow queries
    if (duration > this.slowQueryThreshold * 1.5) {
      logger.warn({
        sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
        duration,
        averageTime: stats.averageTime,
        threshold: this.slowQueryThreshold
      }, 'Slow query detected');
    }
  }

  getQueryStats(): Record<string, QueryStats> {
    if (!process.env.DEBUG) return {};
    
    const stats: Record<string, QueryStats> = {};
    for (const [sql, queryStats] of this.queryStats) {
      stats[sql] = queryStats;
    }
    return stats;
  }

  getSlowQueries(): Record<string, QueryStats> {
    if (!process.env.DEBUG) return {};

    const slowQueries: Record<string, QueryStats> = {};
    for (const [sql, stats] of this.queryStats) {
      if (stats.averageTime > this.slowQueryThreshold) {
        slowQueries[sql] = stats;
      }
    }
    return slowQueries;
  }

  reset(): void {
    this.queryStats.clear();
  }
}