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
  req: VercelRequest,
  userId: string,
  endpoint: string
): Promise<boolean> {
  const limit = RATE_LIMITS[endpoint];
  if (!limit) return true;

  const { data: rateLimitRecord } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .single();

  const now = new Date();

  if (!rateLimitRecord) {
    // Create new rate limit record
    await supabase.from('rate_limits').insert({
      user_id: userId,
      endpoint,
      request_count: 1,
      window_start: now.toISOString(),
    });
    return true;
  }

  const windowStart = new Date(rateLimitRecord.window_start);
  const windowAge = now.getTime() - windowStart.getTime();

  if (windowAge > limit.window) {
    // Reset window
    await supabase
      .from('rate_limits')
      .update({
        request_count: 1,
        window_start: now.toISOString(),
      })
      .eq('id', rateLimitRecord.id);
    return true;
  }

  if (rateLimitRecord.request_count >= limit.requests) {
    return false; // Rate limit exceeded
  }

  // Increment count
  await supabase
    .from('rate_limits')
    .update({
      request_count: rateLimitRecord.request_count + 1,
    })
    .eq('id', rateLimitRecord.id);

  return true;
}
