import { Database } from 'bun:sqlite';
import logger from './logger';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  uptime: number;
  database: boolean;
  timestamp: string;
}

export class HealthCheck {
  private startTime: number;
  private lastCheck: HealthStatus | null = null;
  private readonly CHECK_INTERVAL = 5000; // 5 seconds

  constructor(private db: Database) {
    this.startTime = Date.now();
  }

  async check(): Promise<HealthStatus> {
    // Return cached result if within interval
    if (this.lastCheck && Date.now() - new Date(this.lastCheck.timestamp).getTime() < this.CHECK_INTERVAL) {
      return this.lastCheck;
    }

    let dbStatus = false;
    try {
      await this.db.query('SELECT 1').all();
      dbStatus = true;
    } catch (error) {
      logger.error('Database health check failed');
    }

    this.lastCheck = {
      status: dbStatus ? 'healthy' : 'unhealthy',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      database: dbStatus,
      timestamp: new Date().toISOString()
    };

    return this.lastCheck;
  }
}