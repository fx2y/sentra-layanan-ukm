import { hrtime } from 'node:process';
import logger from './logger';

interface TimingMark {
  name: string;
  start: bigint;
  end?: bigint;
  duration?: number;
}

export class PerformanceMonitor {
  private marks: Map<string, TimingMark> = new Map();
  private readonly MAX_MARKS = 50;

  start(name: string): void {
    if (!process.env.DEBUG) return;

    // Cleanup old completed marks if we're tracking too many
    if (this.marks.size >= this.MAX_MARKS) {
      const completedMarks = Array.from(this.marks.entries())
        .filter(([_, mark]) => mark.duration !== undefined)
        .sort((a, b) => (a[1].end || 0n) - (b[1].end || 0n));
      
      for (const [key] of completedMarks.slice(0, 10)) {
        this.marks.delete(key);
      }
    }

    this.marks.set(name, {
      name,
      start: hrtime.bigint()
    });
  }

  end(name: string): void {
    if (!process.env.DEBUG) return;

    const mark = this.marks.get(name);
    if (!mark) return;

    mark.end = hrtime.bigint();
    mark.duration = Number(mark.end - mark.start) / 1_000_000;
  }

  async measure<T>(name: string, operation: () => Promise<T>): Promise<T> {
    if (!process.env.DEBUG) return operation();

    this.start(name);
    try {
      return await operation();
    } finally {
      this.end(name);
    }
  }

  getTimings(): Record<string, number> {
    if (!process.env.DEBUG) return {};

    const timings: Record<string, number> = {};
    for (const [name, mark] of this.marks) {
      if (mark.duration) {
        timings[name] = mark.duration;
      }
    }
    return timings;
  }
}