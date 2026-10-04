CREATE TABLE IF NOT EXISTS scrap_requests (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(64) UNIQUE NOT NULL,
  seller_id VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL,
  scrap_type VARCHAR(128) NOT NULL,
  estimated_price NUMERIC(12, 2) NOT NULL,
  geo_point JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_by VARCHAR(64),
  accepted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS saleng_locations (
  id SERIAL PRIMARY KEY,
  saleng_id VARCHAR(64) NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  long DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source VARCHAR(32) NOT NULL DEFAULT 'gps'
);

CREATE INDEX IF NOT EXISTS idx_scrap_requests_status
  ON scrap_requests (status);

CREATE INDEX IF NOT EXISTS idx_scrap_requests_geo_point
  ON scrap_requests USING GIN (geo_point);
