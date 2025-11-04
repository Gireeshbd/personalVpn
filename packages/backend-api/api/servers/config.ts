import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { supabase } from '../../lib/db/supabase';
import { verifyAuth } from '../../lib/auth/middleware';

const configSchema = z.object({
  serverId: z.string().uuid(),
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
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
    const { serverId } = configSchema.parse(req.body);

    // Get server configuration
    const { data: server, error } = await supabase
      .from('vpn_servers')
      .select('*')
      .eq('id', serverId)
      .eq('is_active', true)
      .single();

    if (error || !server) {
      return res.status(404).json({
        success: false,
        error: 'Server not found',
      });
    }

    // Check server capacity
    if (server.current_load >= server.capacity) {
      return res.status(503).json({
        success: false,
        error: 'Server at capacity',
      });
    }

    // Increment server load
    await supabase
      .from('vpn_servers')
      .update({ current_load: server.current_load + 1 })
      .eq('id', serverId);

    // Create connection record
    await supabase.from('connections').insert({
      user_id: user.userId,
      server_id: serverId,
      is_active: true,
    });

    res.status(200).json({
      success: true,
      data: {
        id: server.id,
        name: server.name,
        host: server.host,
        port: server.port,
        protocol: server.protocol,
      },
    });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get config',
    });
  }
}
