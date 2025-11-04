import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../lib/db/supabase';
import { verifyAuth } from '../../lib/auth/middleware';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    await verifyAuth(req);

    // Get active servers with low load
    const { data: servers, error } = await supabase
      .from('vpn_servers')
      .select(
        'id, name, location, country_code, protocol, current_load, capacity, health_status'
      )
      .eq('is_active', true)
      .eq('health_status', 'healthy')
      .order('current_load', { ascending: true });

    if (error) throw error;

    // Calculate load percentage and filter
    const availableServers = (servers || [])
      .filter((server) => server.current_load / server.capacity < 0.9)
      .map((server) => ({
        id: server.id,
        name: server.name,
        location: server.location,
        countryCode: server.country_code,
        protocol: server.protocol,
        load: Math.round((server.current_load / server.capacity) * 100),
      }));

    res.status(200).json({
      success: true,
      data: availableServers,
    });
  } catch (error) {
    console.error('List servers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch servers',
    });
  }
}
