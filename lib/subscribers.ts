import { db } from '@/lib/db';
import { subscribers, subscriptions } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';

type Subscriber = typeof subscribers.$inferSelect;

export async function getActiveSubscribersByTier(): Promise<{ paid: Subscriber[]; free: Subscriber[] }> {
  // 1. Get subscriber IDs with active/trialing subscriptions
  const activeSubscriptions = await db
    .select({ subscriberId: subscriptions.subscriberId })
    .from(subscriptions)
    .where(inArray(subscriptions.status, ['active', 'trialing']))
    .all();

  const paidSubscriberIds = new Set(activeSubscriptions.map(s => s.subscriberId));

  // 2. Get all active subscribers
  const allActive = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.status, 'active'))
    .all();

  // 3. Partition into paid and free
  const paid: Subscriber[] = [];
  const free: Subscriber[] = [];

  for (const sub of allActive) {
    if (paidSubscriberIds.has(sub.id) || sub.freeAccess) {
      paid.push(sub);
    } else {
      free.push(sub);
    }
  }

  return { paid, free };
}
