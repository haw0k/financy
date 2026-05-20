import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const sqlPath = path.resolve(__dirname, '../scripts/001_init_database.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

const TABLES = ['profiles', 'categories', 'category_types', 'transactions'];

describe('RLS disabled on user tables', () => {
  it.each(TABLES)('%s has DISABLE ROW LEVEL SECURITY', (table) => {
    const pattern = new RegExp(`alter table public\\.${table} disable row level security`, 'i');
    expect(sql).toMatch(pattern);
  });

  it('has no ENABLE ROW LEVEL SECURITY statements', () => {
    expect(sql).not.toMatch(/enable row level security/i);
  });

  it('has no CREATE POLICY statements', () => {
    expect(sql).not.toMatch(/create policy/i);
  });

  it('has no DROP POLICY statements', () => {
    expect(sql).not.toMatch(/drop policy/i);
  });

  it('has no is_approved_admin function', () => {
    expect(sql).not.toMatch(/is_approved_admin/);
  });

  it('get_user_stats has no user_id parameter', () => {
    // The function signature should NOT contain user_id uuid
    expect(sql).not.toMatch(/get_user_stats\s*\(\s*user_id/);
  });

  it('get_user_stats has no sender_id/receiver_id WHERE clause', () => {
    const fnMatch = sql.match(/create or replace function public\.get_user_stats\(\)([\s\S]*?)\$\$/);
    expect(fnMatch).not.toBeNull();
    if (fnMatch) {
      expect(fnMatch[1]).not.toMatch(/sender_id|receiver_id/);
    }
  });
});
