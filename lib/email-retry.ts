import { db } from '@/lib/db';
import { emailSendLog } from '@/lib/schema';
import { sendEmail } from '@/lib/email';
import { eq, and, sql } from 'drizzle-orm';

const MAX_RETRIES = 3;

interface SendWithRetryOptions {
    to: string;
    subject: string;
    html: string;
    emailType: 'daily' | 'teaser';
    scenarioSlug?: string;
}

/**
 * Send an email with automatic retry tracking.
 * Returns true if sent successfully, false if failed (will be retried later).
 */
export async function sendEmailWithTracking(options: SendWithRetryOptions): Promise<boolean> {
    const { to, subject, html, emailType, scenarioSlug } = options;

    // Create or get existing log entry
    let logEntry = await db
        .select()
        .from(emailSendLog)
        .where(
            and(
                eq(emailSendLog.recipientEmail, to),
                eq(emailSendLog.subject, subject),
                eq(emailSendLog.emailType, emailType),
            )
        )
        .get();

    if (!logEntry) {
        await db.insert(emailSendLog).values({
            recipientEmail: to,
            subject,
            emailType,
            scenarioSlug: scenarioSlug || null,
            sendStatus: 'pending',
            attempts: 0,
        }).run();

        logEntry = await db
            .select()
            .from(emailSendLog)
            .where(
                and(
                    eq(emailSendLog.recipientEmail, to),
                    eq(emailSendLog.subject, subject),
                    eq(emailSendLog.emailType, emailType),
                )
            )
            .get();
    }

    if (!logEntry) return false;

    // Already sent or dead-lettered — skip
    if (logEntry.sendStatus === 'sent' || logEntry.sendStatus === 'dead_letter') {
        return logEntry.sendStatus === 'sent';
    }

    const result = await sendEmail({ to, subject, html });

    if (result.success) {
        await db
            .update(emailSendLog)
            .set({
                sendStatus: 'sent',
                attempts: logEntry.attempts + 1,
                lastAttemptAt: new Date(),
                lastError: null,
            })
            .where(eq(emailSendLog.id, logEntry.id))
            .run();
        return true;
    }

    // Failed
    const newAttempts = logEntry.attempts + 1;
    const errorMsg = result.error instanceof Error
        ? result.error.message
        : String(result.error);

    await db
        .update(emailSendLog)
        .set({
            sendStatus: newAttempts >= MAX_RETRIES ? 'dead_letter' : 'failed',
            attempts: newAttempts,
            lastAttemptAt: new Date(),
            lastError: errorMsg.substring(0, 500),
        })
        .where(eq(emailSendLog.id, logEntry.id))
        .run();

    return false;
}

/**
 * Retry all failed emails that haven't exceeded max retries.
 * Call this from a cron or admin endpoint.
 */
export async function retryFailedEmails(): Promise<{ retried: number; succeeded: number; deadLettered: number }> {
    const failedEntries = await db
        .select()
        .from(emailSendLog)
        .where(
            and(
                eq(emailSendLog.sendStatus, 'failed'),
                sql`${emailSendLog.attempts} < ${MAX_RETRIES}`,
            )
        )
        .all();

    let succeeded = 0;
    let deadLettered = 0;

    for (const entry of failedEntries) {
        // Exponential backoff: skip if last attempt was too recent
        // Wait 2^attempts minutes (2min, 4min, 8min)
        if (entry.lastAttemptAt) {
            const backoffMs = Math.pow(2, entry.attempts) * 60 * 1000;
            const elapsed = Date.now() - entry.lastAttemptAt.getTime();
            if (elapsed < backoffMs) continue;
        }

        // We don't have the HTML stored, so we mark entries that can't be retried
        // The caller should re-generate the HTML. For now, mark as dead_letter if
        // we can't retry (no stored HTML).
        const newAttempts = entry.attempts + 1;

        if (newAttempts >= MAX_RETRIES) {
            await db
                .update(emailSendLog)
                .set({
                    sendStatus: 'dead_letter',
                    attempts: newAttempts,
                    lastAttemptAt: new Date(),
                })
                .where(eq(emailSendLog.id, entry.id))
                .run();
            deadLettered++;
        }
        // Note: actual retry sending requires regenerating the email HTML,
        // which the cron jobs handle on their next run via sendEmailWithTracking()
    }

    return { retried: failedEntries.length, succeeded, deadLettered };
}

/**
 * Get summary stats for dead letter monitoring.
 */
export async function getDeadLetterStats(): Promise<{
    deadLetterCount: number;
    failedCount: number;
    recentErrors: Array<{ email: string; error: string; attempts: number }>;
}> {
    const deadLetterResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(emailSendLog)
        .where(eq(emailSendLog.sendStatus, 'dead_letter'))
        .get();

    const failedResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(emailSendLog)
        .where(eq(emailSendLog.sendStatus, 'failed'))
        .get();

    const recentErrors = await db
        .select({
            email: emailSendLog.recipientEmail,
            error: emailSendLog.lastError,
            attempts: emailSendLog.attempts,
        })
        .from(emailSendLog)
        .where(sql`${emailSendLog.sendStatus} IN ('failed', 'dead_letter')`)
        .orderBy(sql`${emailSendLog.lastAttemptAt} DESC`)
        .limit(20)
        .all();

    return {
        deadLetterCount: deadLetterResult?.count || 0,
        failedCount: failedResult?.count || 0,
        recentErrors: recentErrors.map(e => ({
            email: e.email,
            error: e.error || 'Unknown error',
            attempts: e.attempts,
        })),
    };
}
