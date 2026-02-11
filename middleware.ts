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
};

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
      return addSecurityHeaders(response);
    }
  }

  // For all other routes, just add security headers
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  // Apply to all routes except static files and _next internals
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
