declare module "bun:sqlite" {
  export class Database {
    constructor(file: string);
    query(sql: string): {
      get: (...params: any[]) => any;
      all: (...params: any[]) => any;
      run: (...params: any[]) => any;
    };
    close(): void;
  }
} 