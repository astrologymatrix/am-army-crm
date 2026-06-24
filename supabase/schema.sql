-- AM Army CRM — Supabase Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS influencers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  instagram_handle TEXT,
  followers INTEGER DEFAULT 0,
  address TEXT,
  product_assigned TEXT CHECK (product_assigned IN ('Rose Quartz Bracelet', 'Pyrite Anklet')),
  payment_amount DECIMAL(10,2) DEFAULT 900,
  agreement_status TEXT DEFAULT 'Pending' CHECK (agreement_status IN ('Pending', 'Sent', 'Accepted')),
  agreement_token TEXT UNIQUE,
  agreement_sent_at TIMESTAMPTZ,
  agreement_signed_at TIMESTAMPTZ,
  video_status TEXT DEFAULT 'Pending' CHECK (video_status IN ('Pending', 'Sent', 'Approved')),
  payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Done')),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for agreement token lookups (signing page)
CREATE INDEX IF NOT EXISTS idx_influencers_agreement_token ON influencers (agreement_token);
CREATE INDEX IF NOT EXISTS idx_influencers_email ON influencers (email);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER influencers_updated_at
  BEFORE UPDATE ON influencers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security: disable for service role (your API uses service role)
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by Next.js API routes)
CREATE POLICY "Service role full access" ON influencers
  FOR ALL TO service_role USING (true) WITH CHECK (true);
