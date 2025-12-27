const rateStore = new Map();

// Config
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20;              // max requests per window

export function chatRateLimiter(req, res, next) {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;
    const sessionId = req.body.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "sessionId is required for rate limiting"
      });
    }

    const key = `${ip}:${sessionId}`;
    const now = Date.now();

    let entry = rateStore.get(key);

    // First request or expired window
    if (!entry || now > entry.expiresAt) {
      rateStore.set(key, {
        count: 1,
        expiresAt: now + RATE_LIMIT_WINDOW_MS
      });
      return next();
    }

    // Within window
    if (entry.count >= RATE_LIMIT_MAX) {
      return res.status(429).json({
        status: 429,
        data: null,
        message: "Too many requests. Please wait a moment and try again."
      });
    }

    // Increment count
    entry.count += 1;
    rateStore.set(key, entry);

    next();
  } catch (err) {
    console.error("Rate limiter error:", err.message);
    next(); // fail open
  }
}
