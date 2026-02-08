import { timingSafeEqual } from 'crypto';

/**
 * Timing-safe comparison for bearer token authentication.
 * Prevents timing attacks that could leak secret length/content.
 */
export function verifyBearerToken(authHeader: string | null, secret: string | undefined): boolean {
    if (!authHeader || !secret) return false;

    const expected = `Bearer ${secret}`;

    if (authHeader.length !== expected.length) return false;

    return timingSafeEqual(
        Buffer.from(authHeader),
        Buffer.from(expected),
    );
}
