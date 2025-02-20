import { Database } from 'bun:sqlite';
import logger from './logger';
import { PerformanceMonitor } from './performance';
import { QueryAnalyzer } from './query-analyzer';

export class DatabaseDebugger {
  private perfMonitor: PerformanceMonitor;
  private queryAnalyzer: QueryAnalyzer;

  constructor(private db: Database) {
    this.perfMonitor = new PerformanceMonitor();
    this.queryAnalyzer = new QueryAnalyzer(db);
  }

  async query<T>(sql: string, params?: Record<string, string | number | boolean | null>): Promise<T> {
    const queryId = Math.random().toString(36).substring(7);
    
    return await this.perfMonitor.measure(`query-${queryId}`, async () => {
      const startTime = performance.now();
      try {
        let result: T;
        if (sql.toLowerCase().includes('returning')) {
          this.db.query('BEGIN').run();
          try {
            const queryResult = this.db.query(sql).run(params || {});
            if (queryResult.changes === 0) {
              this.db.query('ROLLBACK').run();
              result = [] as T;
            } else {
              const tableName = sql.match(/(?:INSERT\s+INTO|UPDATE)\s+(\w+)/i)?.[1];
              if (!tableName) {
                this.db.query('ROLLBACK').run();
                throw new Error('Could not determine table name');
              }

              const idColumns: Record<string, string> = {
                'cargo_types': 'cargo_type_id',
                'transportation_modes': 'mode_id',
                'facilities': 'facility_id',
                'mode_facilities': 'mode_id'
              };
              const idColumn = idColumns[tableName];
              if (!idColumn) {
                this.db.query('ROLLBACK').run();
                throw new Error(`No ID column mapping for table ${tableName}`);
              }

              const id = sql.toLowerCase().startsWith('update') ? params?.$id : queryResult.lastInsertRowid;
              if (id === undefined) {
                this.db.query('ROLLBACK').run();
                throw new Error('Could not determine ID');
              }

              const row = this.db.query(`SELECT * FROM ${tableName} WHERE ${idColumn} = $id`).get({ $id: id });
              this.db.query('COMMIT').run();
              result = row ? [row] as T : [] as T;
            }
          } catch (error) {
            this.db.query('ROLLBACK').run();
            throw error;
          }
        } else if (sql.toLowerCase().startsWith('select')) {
          const paramNames = Array.from(sql.matchAll(/\$(\w+)/g)).map(m => m[1]);
          const values = paramNames.map(name => (params || {})[`$${name}`]);
          const stmt = this.db.query(sql.replace(/\$\w+/g, '?'));
          const rows = stmt.all(...values);
          result = (rows || []) as T;
        } else {
          const paramNames = Array.from(sql.matchAll(/\$(\w+)/g)).map(m => m[1]);
          const values = paramNames.map(name => (params || {})[`$${name}`]);
          const stmt = this.db.query(sql.replace(/\$\w+/g, '?'));
          const queryResult = stmt.run(...values);
          result = { changes: queryResult.changes } as T;
        }
        
        const duration = performance.now() - startTime;
        
        if (process.env.DEBUG === 'true') {
          this.queryAnalyzer.recordQuery(sql, duration);
          logger.debug({
            queryId,
            sql,
            params,
            duration,
            rowCount: Array.isArray(result) ? result.length : 1
          }, 'Query completed');
        }
        
        return result;
      } catch (error) {
        logger.error({
          queryId,
          sql,
          params,
          error
        }, 'Query failed');
        throw error;
      }
    });
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    const txId = Math.random().toString(36).substring(7);
    
    return await this.perfMonitor.measure(`transaction-${txId}`, async () => {
      try {
        this.db.query('BEGIN').run();
        const result = await callback();
        this.db.query('COMMIT').run();
        
        if (process.env.DEBUG === 'true') {
          logger.debug({
            txId,
            slowQueries: this.queryAnalyzer.getSlowQueries()
          }, 'Transaction committed');
        }
        
        return result;
      } catch (error) {
        logger.error({ txId, error }, 'Transaction failed, rolling back');
        this.db.query('ROLLBACK').run();
        throw error;
      }
    });
  }

  // Debug-only methods
  getQueryStats() {
    return process.env.DEBUG === 'true' ? this.queryAnalyzer.getQueryStats() : {};
  }

  getSlowQueries() {
    return process.env.DEBUG === 'true' ? this.queryAnalyzer.getSlowQueries() : {};
  }
}