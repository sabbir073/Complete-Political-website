-- Create NFC/QR tracking tables
-- This migration creates tables for tracking NFC page visits and link clicks

-- Table for tracking NFC page visits
CREATE TABLE IF NOT EXISTS nfc_page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  referrer TEXT,
  is_unique_visitor BOOLEAN DEFAULT true,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for tracking link clicks on NFC page
CREATE TABLE IF NOT EXISTS nfc_link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES nfc_page_visits(id) ON DELETE CASCADE,
  link_name TEXT NOT NULL, -- 'website', 'complaints', 'blood-hub', etc.
  link_url TEXT NOT NULL,
  click_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_nfc_page_visits_timestamp ON nfc_page_visits(visit_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_nfc_page_visits_ip ON nfc_page_visits(ip_address);
CREATE INDEX IF NOT EXISTS idx_nfc_page_visits_session ON nfc_page_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_nfc_page_visits_device ON nfc_page_visits(device_type);
CREATE INDEX IF NOT EXISTS idx_nfc_page_visits_country ON nfc_page_visits(country);

CREATE INDEX IF NOT EXISTS idx_nfc_link_clicks_timestamp ON nfc_link_clicks(click_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_nfc_link_clicks_link_name ON nfc_link_clicks(link_name);
CREATE INDEX IF NOT EXISTS idx_nfc_link_clicks_visit_id ON nfc_link_clicks(visit_id);

-- Enable Row Level Security
ALTER TABLE nfc_page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_link_clicks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert visits (for tracking)
CREATE POLICY "Allow public insert on nfc_page_visits"
  ON nfc_page_visits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow public to insert link clicks (for tracking)
CREATE POLICY "Allow public insert on nfc_link_clicks"
  ON nfc_link_clicks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only admins can read visit data
CREATE POLICY "Only admins can read nfc_page_visits"
  ON nfc_page_visits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Policy: Only admins can read link click data
CREATE POLICY "Only admins can read nfc_link_clicks"
  ON nfc_link_clicks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Add comments for documentation
COMMENT ON TABLE nfc_page_visits IS 'Tracks visits to the NFC landing page';
COMMENT ON TABLE nfc_link_clicks IS 'Tracks link clicks from the NFC landing page';

COMMENT ON COLUMN nfc_page_visits.device_type IS 'Type of device: mobile, tablet, or desktop';
COMMENT ON COLUMN nfc_page_visits.is_unique_visitor IS 'Whether this is a unique visitor based on session';
COMMENT ON COLUMN nfc_page_visits.session_id IS 'Session identifier for tracking unique visitors';

COMMENT ON COLUMN nfc_link_clicks.link_name IS 'Identifier for the link: website, complaints, blood-hub, volunteer-hub, ama, election-2026, testimonials';
