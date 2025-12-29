// src/middlewares/ipRateLimiter.js
const rateStore = new Map();

const WINDOW_MS = 60 * 1000; 
const MAX_REQUESTS = 20;

export function ipRateLimiter(req, res, next) {
  try {
      const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || req.ip;
    console.log("incoming  request", ip)
    const now = Date.now();
    let entry = rateStore.get(ip);

    if (!entry) {
      rateStore.set(ip, { timestamps: [now] });
      return next();
    }

    // Remove timestamps outside window
    entry.timestamps = entry.timestamps.filter(ts => now - ts < WINDOW_MS);

    if (entry.timestamps.length >= MAX_REQUESTS) {
      return res.status(429).json({
        status: 429,
        data: null,
        message: "Too many requests from this IP. Please wait a moment."
      });
    }

    entry.timestamps.push(now);
    rateStore.set(ip, entry);
    next();
  } catch (err) {
    next();
  }
}
