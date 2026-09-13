import { URL } from 'node:url';

/**
 * Standard Security Headers Middleware
 */
export function applySecurityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Clickjacking defense
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Cross-Site Scripting Protection filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Hide server technology
  res.removeHeader('X-Powered-By');
  next();
}

/**
 * Validates external URLs to prevent SSRF (Server-Side Request Forgery) attacks.
 * Blocks loopback, private ranges, link-local, and cloud metadata services.
 */
export function isSafeExternalUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return false;

  let parsed;
  try {
    parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
  } catch (e) {
    return false;
  }

  // Only allow HTTP/HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return false;
  }

  const host = parsed.hostname.toLowerCase();

  // Block localhost and standard loopback
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.onion')
  ) {
    return false;
  }

  // Block AWS / GCP / Azure / DigitalOcean Cloud Metadata services
  if (host === '169.254.169.254' || host === 'metadata.google.internal' || host === 'instance-data') {
    return false;
  }

  // Check IPv4 private ranges (RFC 1918)
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = host.match(ipv4Regex);
  if (match) {
    const octet1 = parseInt(match[1], 10);
    const octet2 = parseInt(match[2], 10);

    // 10.0.0.0/8
    if (octet1 === 10) return false;
    // 172.16.0.0/12
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return false;
    // 192.168.0.0/16
    if (octet1 === 192 && octet2 === 168) return false;
    // 127.0.0.0/8 loopback
    if (octet1 === 127) return false;
    // 169.254.0.0/16 link-local
    if (octet1 === 169 && octet2 === 254) return false;
    // 0.0.0.0/8
    if (octet1 === 0) return false;
  }

  return true;
}

/**
 * Sliding Window In-Memory Rate Limiter
 */
export function createRateLimiter({ windowMs = 60 * 1000, max = 30, message = 'Too many requests. Please try again later.' }) {
  const store = new Map();

  // Periodic cleanup every 2 minutes to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now - record.resetTime > windowMs) {
        store.delete(key);
      }
    }
  }, 2 * 60 * 1000);

  return (req, res, next) => {
    const identifier = req.user?.id 
      ? `user_${req.user.id}` 
      : (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'client');

    const key = `${identifier}_${req.baseUrl || req.path}`;
    const now = Date.now();

    let record = store.get(key);
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      store.set(key, record);
    } else {
      record.count += 1;
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        error: message,
        retryAfterSec: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    next();
  };
}
