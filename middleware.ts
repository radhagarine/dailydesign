import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

// Rate limit config per route pattern: [maxRequests, windowMs]
const RATE_LIMITS: Record<string, [number, number]> = {
  '/api/subscribe':    [5,  60_000],    // 5 per minute
  '/api/unsubscribe':  [10, 60_000],    // 10 per minute
  '/api/checkout':     [5,  60_000],    // 5 per minute
  '/api/preferences':  [10, 60_000],    // 10 per minute
  '/api/portal':       [5,  60_000],    // 5 per minute
  '/api/checkout/verify': [10, 60_000], // 10 per minute
  '/api/referral':       [10, 60_000], // 10 per minute
  '/api/auth/magic-link': [3, 300_000], // 3 per 5 minutes
};

const COOKIE_NAME = 'subscriber_token';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl;

  // Token interception: if URL has ?token= matching hex64, set cookie and redirect to clean URL
  const tokenParam = url.searchParams.get('token');
  if (tokenParam && TOKEN_PATTERN.test(tokenParam)) {
    url.searchParams.delete('token');
    const response = NextResponse.redirect(url, 302);
    response.cookies.set(COOKIE_NAME, tokenParam, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    return addSecurityHeaders(response);
  }

  // Refresh cookie maxAge if it already exists (sliding expiration)
  const existingToken = request.cookies.get(COOKIE_NAME)?.value;

  // Apply rate limiting to public API routes
  for (const [route, [maxReqs, windowMs]] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(route)) {
      const ip = getClientIp(request);
      const key = `${route}:${ip}`;
      const result = rateLimit(key, maxReqs, windowMs);

      if (!result.allowed) {
        const errorResponse = NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
        errorResponse.headers.set('Retry-After', String(Math.ceil(result.resetIn / 1000)));
        return addSecurityHeaders(errorResponse);
      }

      // Add rate limit info headers
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Remaining', String(result.remaining));
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetIn / 1000)));
      if (existingToken) {
        response.cookies.set(COOKIE_NAME, existingToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: COOKIE_MAX_AGE,
          path: '/',
        });
      }
      return addSecurityHeaders(response);
    }
  }

  // For all other routes, just add security headers
  const response = NextResponse.next();
  if (existingToken) {
    response.cookies.set(COOKIE_NAME, existingToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
  }
  return addSecurityHeaders(response);
}

export const config = {
  // Apply to all routes except static files and _next internals
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
