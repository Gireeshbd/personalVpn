import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { supabase } from '../../lib/db/supabase';
import { verifyAuth } from '../../lib/auth/middleware';

const configSchema = z.object({
  serverId: z.string().uuid(),
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
    const { serverId } = configSchema.parse(req.body);

    // Atomically increment server load if below capacity
    // This uses a raw SQL query to ensure atomicity
    const { data: updatedServer, error: updateError } = await supabase.rpc(
      'increment_server_load',
      { server_id: serverId }
    );

    if (updateError) {
      console.error('Failed to increment server load:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to connect to server',
      });
    }

    if (!updatedServer || updatedServer.length === 0) {
      // Either server not found or at capacity
      const { data: server } = await supabase
        .from('vpn_servers')
        .select('current_load, capacity')
        .eq('id', serverId)
        .eq('is_active', true)
        .single();

      if (!server) {
        return res.status(404).json({
          success: false,
          error: 'Server not found',
        });
      }

      return res.status(503).json({
        success: false,
        error: 'Server at capacity',
      });
    }

    const server = updatedServer[0];

    // Create connection record
    const { error: connectionError } = await supabase.from('connections').insert({
      user_id: user.userId,
      server_id: serverId,
      is_active: true,
    });

    if (connectionError) {
      // Rollback the load increment
      await supabase.rpc('decrement_server_load', { server_id: serverId });

      console.error('Failed to create connection record:', connectionError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create connection',
      });
    }

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
