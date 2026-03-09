-- Removed PostGIS extension for compatibility
-- CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(32) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  location_lat DECIMAL,
  location_lng DECIMAL,
  size_hectares DECIMAL,
  crops TEXT[]
);

CREATE TABLE IF NOT EXISTS detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  disease_name VARCHAR(255),
  confidence FLOAT,
  crop_type VARCHAR(255),
  location_lat DECIMAL,
  location_lng DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location_lat DECIMAL,
  location_lng DECIMAL,
  address TEXT,
  phone_number VARCHAR(64)
);

-- GIST index removed (was for PostGIS)
-- CREATE INDEX IF NOT EXISTS idx_shops_location
--   ON shops
--   USING GIST (location);

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(255),
  crop_types TEXT[],
  image_url TEXT,
  views INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  scientific_name VARCHAR(255),
  affected_crops TEXT[],
  symptoms TEXT,
  treatment TEXT,
  prevention TEXT,
  image_url TEXT
);

