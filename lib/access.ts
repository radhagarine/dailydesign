import { db } from '@/lib/db';
import { subscribers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function validateScenarioAccess(token: string): Promise<{
  valid: boolean;
  subscriber?: typeof subscribers.$inferSelect;
}> {
  if (!token) {
    return { valid: false };
  }

  const subscriber = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.unsubscribeToken, token))
    .get();

  if (!subscriber || subscriber.status !== 'active') {
    return { valid: false };
  }

  return { valid: true, subscriber };
}
