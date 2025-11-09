import { VercelRequest } from '@vercel/node';
import { supabase } from '../db/supabase';

interface RateLimitConfig {
  requests: number;
  window: number; // in milliseconds
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/auth/register': { requests: 5, window: 3600000 }, // 5 per hour
  '/api/servers/list': { requests: 100, window: 900000 }, // 100 per 15 min
  '/api/servers/config': { requests: 10, window: 600000 }, // 10 per 10 min
};

export async function checkRateLimit(
  _req: VercelRequest,
  userId: string,
  endpoint: string
): Promise<boolean> {
  const limit = RATE_LIMITS[endpoint];
  if (!limit) return true;

  try {
    // Use RPC function for atomic rate limit check and increment
    const { data, error } = await supabase
      .rpc('check_and_increment_rate_limit', {
        p_user_id: userId,
        p_endpoint: endpoint,
        p_max_requests: limit.requests,
        p_window_ms: limit.window,
      });

    if (error) {
      console.error('Rate limit check error:', error);
      // Fail open - allow request if rate limit check fails
      return true;
    }

    // RPC function returns true if request is allowed, false if rate limited
    return data === true;
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open - allow request on error
    return true;
  }
}
