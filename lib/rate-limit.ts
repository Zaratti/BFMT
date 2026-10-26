interface RateLimitConfig {
  interval: number
  uniqueTokenPerInterval: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
}

export function rateLimit(config: RateLimitConfig) {
  const tokenCache = new Map<string, number[]>()

  return {
    check: async (token: string, limit: number): Promise<RateLimitResult> => {
      const now = Date.now()
      const timestamps = tokenCache.get(token) || []

      // Remove expired timestamps
      const validTimestamps = timestamps.filter((timestamp) => now - timestamp < config.interval)

      if (validTimestamps.length >= limit) {
        return { success: false, remaining: 0 }
      }

      validTimestamps.push(now)
      tokenCache.set(token, validTimestamps)

      // Cleanup old entries
      if (tokenCache.size > config.uniqueTokenPerInterval) {
        const oldestKey = tokenCache.keys().next().value
        if (oldestKey !== undefined) tokenCache.delete(oldestKey)
      }

      return { success: true, remaining: limit - validTimestamps.length }
    },
  }
}
