// Manual mock for @op-engineering/op-sqlite to prevent ESM parse errors in Jest
// This provides a minimal in-memory SQLite-like interface for testing

interface MockRow {
  key: string;
  value: string;
}

class MockTransaction {
  private data: Map<string, string>;

  constructor(data: Map<string, string>) {
    this.data = data;
  }

  async execute(
    sql: string,
    params?: (string | number | null)[],
  ): Promise<{ rows: MockRow[] }> {
    // Simple SQL parsing for INSERT/REPLACE
    if (sql.includes('INSERT OR REPLACE')) {
      const key = params?.[0] as string;
      const value = params?.[1] as string;
      if (key !== undefined && value !== undefined) {
        this.data.set(key, value);
      }
      return { rows: [] };
    }

    // Simple SQL parsing for SELECT
    if (sql.includes('SELECT')) {
      const key = params?.[0] as string;
      if (key !== undefined && this.data.has(key)) {
        return { rows: [{ key, value: this.data.get(key)! }] };
      }
      return { rows: [] };
    }

    // Simple SQL parsing for DELETE
    if (sql.includes('DELETE')) {
      const key = params?.[0] as string;
      if (key !== undefined) {
        this.data.delete(key);
      }
      return { rows: [] };
    }

    // CREATE TABLE - no-op for mock
    if (sql.includes('CREATE TABLE')) {
      return { rows: [] };
    }

    return { rows: [] };
  }
}

class MockDatabase {
  private data: Map<string, string> = new Map();

  async execute(
    sql: string,
    params?: (string | number | null)[],
  ): Promise<{ rows: MockRow[] }> {
    const tx = new MockTransaction(this.data);
    return tx.execute(sql, params);
  }

  async transaction(
    callback: (tx: MockTransaction) => Promise<void>,
  ): Promise<void> {
    const tx = new MockTransaction(this.data);
    await callback(tx);
  }
}

export function open(_options: { name: string }): MockDatabase {
  return new MockDatabase();
}

export default { open };
