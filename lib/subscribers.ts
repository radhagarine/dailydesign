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
  //    Free subscribers in their first 7 days get daily emails (paid bucket)
  const paid: Subscriber[] = [];
  const free: Subscriber[] = [];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  for (const sub of allActive) {
    if (paidSubscriberIds.has(sub.id) || sub.freeAccess) {
      paid.push(sub);
    } else if (sub.joinedAt && sub.joinedAt > sevenDaysAgo) {
      // Free subscriber still in 7-day daily trial
      paid.push(sub);
    } else {
      free.push(sub);
    }
  }

  return { paid, free };
}
