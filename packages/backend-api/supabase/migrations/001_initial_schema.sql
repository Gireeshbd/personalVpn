-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anonymous_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- VPN Servers table
CREATE TABLE IF NOT EXISTS vpn_servers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  host VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL,
  protocol VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1000,
  current_load INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  health_status VARCHAR(50) DEFAULT 'healthy',
  last_health_check TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connections table
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  server_id UUID REFERENCES vpn_servers(id) ON DELETE CASCADE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  disconnected_at TIMESTAMP WITH TIME ZONE,
  bytes_sent BIGINT DEFAULT 0,
  bytes_received BIGINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Usage analytics table
CREATE TABLE IF NOT EXISTS usage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  server_id UUID REFERENCES vpn_servers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_bytes BIGINT DEFAULT 0,
  connection_count INTEGER DEFAULT 0,
  connection_duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, server_id, date)
);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_anonymous_id ON users(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_server_id ON connections(server_id);
CREATE INDEX IF NOT EXISTS idx_connections_active ON connections(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_date ON usage_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_vpn_servers_active ON vpn_servers(is_active) WHERE is_active = true;

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Atomic increment server load with capacity check
CREATE OR REPLACE FUNCTION increment_server_load(server_id UUID)
RETURNS TABLE(id UUID, name VARCHAR, host VARCHAR, port INTEGER, protocol VARCHAR) AS $$
BEGIN
  RETURN QUERY
  UPDATE vpn_servers
  SET current_load = current_load + 1
  WHERE vpn_servers.id = server_id
    AND is_active = true
    AND current_load < capacity
  RETURNING vpn_servers.id, vpn_servers.name, vpn_servers.host, vpn_servers.port, vpn_servers.protocol;
END;
$$ language 'plpgsql';

-- Atomic decrement server load
CREATE OR REPLACE FUNCTION decrement_server_load(server_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE vpn_servers
  SET current_load = GREATEST(0, current_load - 1)
  WHERE id = server_id;
END;
$$ language 'plpgsql';

-- Atomic rate limit check and increment
CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  p_user_id UUID,
  p_endpoint VARCHAR,
  p_max_requests INTEGER,
  p_window_ms BIGINT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_record RECORD;
  v_now TIMESTAMP WITH TIME ZONE := NOW();
  v_window_age_ms BIGINT;
BEGIN
  -- Try to get existing rate limit record
  SELECT * INTO v_record
  FROM rate_limits
  WHERE user_id = p_user_id AND endpoint = p_endpoint
  FOR UPDATE;

  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, v_now);
    RETURN TRUE;
  END IF;

  -- Calculate window age in milliseconds
  v_window_age_ms := EXTRACT(EPOCH FROM (v_now - v_record.window_start)) * 1000;

  -- If window has expired, reset it
  IF v_window_age_ms > p_window_ms THEN
    UPDATE rate_limits
    SET request_count = 1, window_start = v_now
    WHERE id = v_record.id;
    RETURN TRUE;
  END IF;

  -- Check if rate limit exceeded
  IF v_record.request_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;

  -- Increment request count
  UPDATE rate_limits
  SET request_count = request_count + 1
  WHERE id = v_record.id;
  
  RETURN TRUE;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_vpn_servers_updated_at ON vpn_servers;
CREATE TRIGGER update_vpn_servers_updated_at
  BEFORE UPDATE ON vpn_servers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample VPN servers (for development)
INSERT INTO vpn_servers (name, location, country_code, host, port, protocol, capacity, current_load) VALUES
  ('US East', 'New York', 'US', '1.2.3.4', 1080, 'socks5', 1000, 50),
  ('EU West', 'Amsterdam', 'NL', '5.6.7.8', 1080, 'socks5', 800, 30),
  ('Asia Pacific', 'Singapore', 'SG', '9.10.11.12', 1080, 'socks5', 600, 20)
ON CONFLICT DO NOTHING;
