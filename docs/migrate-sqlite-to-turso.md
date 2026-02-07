# Plan: Migrate SQLite (better-sqlite3) to Turso (libsql)

## Context
The project currently uses a local `sqlite.db` file via `better-sqlite3` which works for local dev but doesn't persist on serverless platforms like Vercel (ephemeral filesystem). Turso provides a hosted SQLite-compatible database (libsql) that works reliably in serverless environments, preserving data across deployments.

## Steps

### 1. Install Turso CLI & Create Database
- Install Turso CLI: `brew install tursodatabase/tap/turso`
- Authenticate: `turso auth signup` or `turso auth login`
- Create database: `turso db create dailydesign`
- Get connection URL: `turso db show dailydesign --url`
- Create auth token: `turso db tokens create dailydesign`

### 2. Update Dependencies
```bash
npm uninstall better-sqlite3 @types/better-sqlite3
npm install @libsql/client
```
- `@libsql/client` replaces `better-sqlite3` as the database driver
- `drizzle-orm` stays (it supports libsql natively)
- `drizzle-kit` stays

### 3. Update `lib/db.ts`
Replace better-sqlite3 connection with libsql client:
```typescript
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });
```

### 4. Update `drizzle.config.ts`
Change dialect and credentials for Turso:
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});
```

### 5. Rewrite `app/api/admin/tables/route.ts`
This file uses raw `better-sqlite3` directly (creates its own `Database('sqlite.db')` instance). Must be rewritten to use either:
- The shared `db` from `lib/db.ts` with Drizzle's `sql` template literal for raw queries, OR
- A direct `@libsql/client` instance for admin introspection

Key changes:
- Replace `sqlite.prepare(query).all()` → `client.execute(query)`
- Replace `PRAGMA table_info()` → `PRAGMA table_info()` (libsql supports this)
- Replace `sqlite_master` queries → same (libsql supports this)
- All operations become **async** (libsql is async, better-sqlite3 was sync)

### 6. Update `.env.local`
Add Turso credentials:
```
TURSO_DATABASE_URL=libsql://dailydesign-<username>.turso.io
TURSO_AUTH_TOKEN=<token>
```

### 7. Push Schema to Turso
Run `npm run db:push` to create all tables in the remote Turso database.

### 8. Migrate Existing Data (if needed)
Export data from local `sqlite.db` and import to Turso using the Turso CLI:
```bash
turso db shell dailydesign < dump.sql
```
Or use `.dump` from sqlite3 to generate the SQL.

## Files Modified
| File | Change |
|------|--------|
| `lib/db.ts` | Replace better-sqlite3 with @libsql/client |
| `drizzle.config.ts` | Change dialect to turso, use env vars |
| `app/api/admin/tables/route.ts` | Rewrite raw SQL to use libsql client (async) |
| `package.json` | Swap better-sqlite3 → @libsql/client |
| `.env.local` | Add TURSO_DATABASE_URL + TURSO_AUTH_TOKEN |

**No changes needed** to:
- `lib/schema.ts` (schema stays identical - libsql is SQLite-compatible)
- All 8 other files using `db` from `lib/db.ts` (Drizzle API is the same)
- Migration files in `drizzle/`

## Verification
1. `npm run dev` starts without errors
2. `npm run db:push` successfully creates tables in Turso
3. Visit `/scenarios/[any-slug]` and `/archive` to confirm reads work
4. Test `/api/admin/tables` endpoint for raw query functionality
5. Test `/api/subscribe` to confirm inserts work
6. Run `turso db shell dailydesign` and verify tables exist with `SELECT * FROM scenarios LIMIT 1`
