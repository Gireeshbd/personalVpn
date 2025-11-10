import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials not configured');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database types (will be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          anonymous_id: string;
          created_at: string;
          last_seen_at: string;
          is_active: boolean;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          anonymous_id: string;
          created_at?: string;
          last_seen_at?: string;
          is_active?: boolean;
          metadata?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          anonymous_id?: string;
          created_at?: string;
          last_seen_at?: string;
          is_active?: boolean;
          metadata?: Record<string, unknown>;
        };
      };
      vpn_servers: {
        Row: {
          id: string;
          name: string;
          location: string;
          country_code: string;
          host: string;
          port: number;
          protocol: string;
          capacity: number;
          current_load: number;
          is_active: boolean;
          health_status: string;
          last_health_check: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          country_code: string;
          host: string;
          port: number;
          protocol: string;
          capacity?: number;
          current_load?: number;
          is_active?: boolean;
          health_status?: string;
          last_health_check?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['vpn_servers']['Insert']>;
      };
      connections: {
        Row: {
          id: string;
          user_id: string;
          server_id: string;
          connected_at: string;
          disconnected_at: string | null;
          bytes_sent: number;
          bytes_received: number;
          is_active: boolean;
          metadata: Record<string, unknown>;
        };
      };
      usage_analytics: {
        Row: {
          id: string;
          user_id: string;
          server_id: string;
          date: string;
          total_bytes: number;
          connection_count: number;
          connection_duration: number;
          created_at: string;
        };
      };
      rate_limits: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          request_count: number;
          window_start: string;
        };
      };
    };
  };
}
