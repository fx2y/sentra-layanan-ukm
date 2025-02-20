import logger from './logger';

export class ErrorTracker {
    private static errorCounts: Map<string, number> = new Map();
    private static readonly MAX_ERRORS = 1000;
    private static readonly CLEANUP_THRESHOLD = 800;

    static track(error: Error, context: string): void {
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            return; // Don't track in development
        }

        const errorKey = `${error.name}:${error.message}:${context}`;
        
        // Cleanup if we're tracking too many distinct errors
        if (this.errorCounts.size >= this.MAX_ERRORS) {
            this.cleanup();
        }

        const count = (this.errorCounts.get(errorKey) || 0) + 1;
        this.errorCounts.set(errorKey, count);

        // Log only on significant thresholds (1, 10, 100, etc.)
        if (this.isSignificantCount(count)) {
            logger.error({
                error: {
                    name: error.name,
                    message: error.message,
                    count,
                    context
                }
            }, 'Error threshold reached');
        }
    }

    private static isSignificantCount(count: number): boolean {
        return count === 1 || Math.log10(count) % 1 === 0;
    }

    private static cleanup(): void {
        // Sort by count and keep only the most frequent errors
        const sortedErrors = Array.from(this.errorCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, this.CLEANUP_THRESHOLD);

        this.errorCounts = new Map(sortedErrors);
    }

    static getStats(): Record<string, { count: number, lastOccurrence: Date }> {
        return Object.fromEntries(
            Array.from(this.errorCounts.entries())
                .map(([key, count]) => [key, { count, lastOccurrence: new Date() }])
        );
    }

    static reset(): void {
        this.errorCounts.clear();
    }
}