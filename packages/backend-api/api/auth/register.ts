import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { supabase } from '../../lib/db/supabase';
import { generateJWT } from '../../lib/auth/jwt';
import { v4 as uuidv4 } from 'uuid';

const registerSchema = z.object({
  deviceId: z.string().optional(),
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
    const body = registerSchema.parse(req.body);

    // Generate anonymous user ID
    const anonymousId = body.deviceId || `anon_${uuidv4()}`;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, anonymous_id')
      .eq('anonymous_id', anonymousId)
      .single();

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;

      // Update last seen
      await supabase
        .from('users')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', userId);
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({ anonymous_id: anonymousId })
        .select()
        .single();

      if (error) throw error;
      userId = newUser.id;
    }

    // Generate JWT token
    const token = generateJWT({ userId, anonymousId });

    res.status(200).json({
      success: true,
      data: {
        token,
        userId,
        anonymousId,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    });
  }
}
