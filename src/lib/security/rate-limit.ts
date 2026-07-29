type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

export function checkRateLimit(params: {
  key: string;
  windowMs: number;
  limit: number;
}) {
  const now = Date.now();
  const current = store.get(params.key);

  if (!current || now > current.resetAt) {
    const resetAt = now + params.windowMs;
    store.set(params.key, { count: 1, resetAt });
    return { allowed: true, remaining: params.limit - 1, resetAt };
  }

  if (current.count >= params.limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  store.set(params.key, current);
  return { allowed: true, remaining: params.limit - current.count, resetAt: current.resetAt };
}
