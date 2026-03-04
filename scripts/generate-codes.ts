/**
 * One-time script to generate access codes for friends.
 *
 * Usage:
 *   npx tsx scripts/generate-codes.ts
 *
 * Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.local
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { accessCodes, generateAccessCode } from '../lib/schema';

const NUM_CODES = 4;
const EXPIRES_IN_DAYS = 2;

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
  const db = drizzle(client);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + EXPIRES_IN_DAYS);

  console.log(`\nGenerating ${NUM_CODES} access codes (expire: ${expiresAt.toISOString().split('T')[0]})\n`);

  const codes: string[] = [];

  for (let i = 0; i < NUM_CODES; i++) {
    const code = generateAccessCode();
    await db.insert(accessCodes).values({
      code,
      expiresAt,
    }).run();
    codes.push(code);
  }

  console.log('--- Share these codes with your friends ---\n');
  codes.forEach((code, i) => {
    console.log(`  ${i + 1}. ${code}`);
  });
  console.log(`\nAll codes expire on ${expiresAt.toISOString().split('T')[0]}`);
  console.log('Redeem at: /api/redeem with { email, code }\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to generate codes:', err);
  process.exit(1);
});
