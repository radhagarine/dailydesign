import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { subscribers, subscriptions } from '@/lib/schema';
import { and, eq, inArray } from 'drizzle-orm';

export const COOKIE_NAME = 'subscriber_token';
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

type Subscriber = typeof subscribers.$inferSelect;

export async function getSubscriberFromCookie(): Promise<Subscriber | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const subscriber = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.unsubscribeToken, token))
    .get();

  if (!subscriber || subscriber.status !== 'active') return null;

  return subscriber;
}

export async function isSubscriberPaid(subscriber: Subscriber): Promise<boolean> {
  if (subscriber.freeAccess) return true;

  const activeSubs = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(and(
      eq(subscriptions.subscriberId, subscriber.id),
      inArray(subscriptions.status, ['active', 'trialing'])
    ))
    .all();

  return activeSubs.length > 0;
}
