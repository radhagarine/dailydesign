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
  //    Free subscribers get 1 day of full content, then teasers only
  const paid: Subscriber[] = [];
  const free: Subscriber[] = [];
  const now = new Date();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  for (const sub of allActive) {
    const hasFreeAccess = sub.freeAccess && (!sub.freeAccessExpiresAt || sub.freeAccessExpiresAt > now);
    if (paidSubscriberIds.has(sub.id) || hasFreeAccess) {
      paid.push(sub);
    } else if (sub.joinedAt && sub.joinedAt > oneDayAgo) {
      // Free subscriber on their first day — gets one full scenario
      paid.push(sub);
    } else {
      free.push(sub);
    }
  }

  return { paid, free };
}
