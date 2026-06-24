-- AM Army CRM v2 — Run this in Supabase SQL Editor

-- Add dispatch_status to influencers
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS dispatch_status TEXT
  CHECK (dispatch_status IN ('Dispatched', 'Delivered'));

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  description TEXT,
  stock_status TEXT DEFAULT 'Available' CHECK (stock_status IN ('Available', 'Out of Stock')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  permissions JSONB DEFAULT '{"creators":{"view":true,"edit":false,"delete":false},"products":{"view":true,"edit":false,"delete":false},"agreements":{"view":true,"edit":false,"send":false},"pipeline":{"view":true,"edit":false},"team":{"view":false,"edit":false}}',
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID REFERENCES influencers(id) ON DELETE SET NULL,
  influencer_name TEXT,
  action TEXT NOT NULL,
  performed_by TEXT DEFAULT 'Admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON products FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON team_members FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON activity_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Supabase Storage bucket for product images (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
