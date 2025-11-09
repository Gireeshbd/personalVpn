import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { verifyAuth } from '../../lib/auth/middleware';

const trackSchema = z.object({
  event: z.string(),
  serverId: z.string().uuid(),
  timestamp: z.string(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyAuth(req);
    const data = trackSchema.parse(req.body);

    // In production, you would store this in analytics database
    // Event logged for development purposes only
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('Analytics event:', {
        userId: user.userId,
        ...data,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event tracked',
    });
  } catch (error) {
    console.error('Track error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track event',
    });
  }
}
