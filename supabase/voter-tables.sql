-- =====================================================
-- Voter Data Tables Migration
-- Creates tables for storing voter metadata and voter list
-- =====================================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS voter_list CASCADE;
DROP TABLE IF EXISTS voter_metadata CASCADE;

-- =====================================================
-- Table: voter_metadata
-- Stores ward/area level metadata from voter list PDFs
-- =====================================================
CREATE TABLE voter_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Area Information
    area TEXT,
    district TEXT,
    upazila_thana TEXT,
    cc_pourosova TEXT,
    union_pouro_ward_cant_board TEXT,
    ward_no_for_union TEXT,
    voter_area_name TEXT,
    voter_area_no TEXT,

    -- Contact Information
    post_office TEXT,
    postal_code TEXT,

    -- Statistics
    total_voter INTEGER DEFAULT 0,
    total_male_voter INTEGER DEFAULT 0,
    total_female_voter INTEGER DEFAULT 0,

    -- List Information
    voter_list_announce_date DATE,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint to prevent duplicate ward data
    UNIQUE(district, upazila_thana, ward_no_for_union, voter_area_no)
);

-- =====================================================
-- Table: voter_list
-- Stores individual voter information
-- =====================================================
CREATE TABLE voter_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationship to voter_metadata
    voter_metadata_id UUID NOT NULL REFERENCES voter_metadata(id) ON DELETE CASCADE,

    -- Voter Information
    serial_no INTEGER,
    voter_no TEXT NOT NULL,
    voter_name TEXT NOT NULL,
    father_name TEXT,
    mother_name TEXT,
    profession TEXT,
    date_of_birth DATE,
    address TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint to prevent duplicate voters
    UNIQUE(voter_no)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- voter_metadata indexes
CREATE INDEX idx_voter_metadata_district ON voter_metadata(district);
CREATE INDEX idx_voter_metadata_ward ON voter_metadata(ward_no_for_union);
CREATE INDEX idx_voter_metadata_area ON voter_metadata(voter_area_no);

-- voter_list indexes
CREATE INDEX idx_voter_list_metadata ON voter_list(voter_metadata_id);
CREATE INDEX idx_voter_list_voter_no ON voter_list(voter_no);
CREATE INDEX idx_voter_list_name ON voter_list(voter_name);
CREATE INDEX idx_voter_list_serial ON voter_list(serial_no);

-- =====================================================
-- Trigger Functions for Updated At
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to voter_metadata
CREATE TRIGGER update_voter_metadata_updated_at
    BEFORE UPDATE ON voter_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to voter_list
CREATE TRIGGER update_voter_list_updated_at
    BEFORE UPDATE ON voter_list
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE voter_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_list ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to voter_metadata
CREATE POLICY "Allow public read access to voter_metadata"
    ON voter_metadata FOR SELECT
    USING (true);

-- Policy: Allow public read access to voter_list
CREATE POLICY "Allow public read access to voter_list"
    ON voter_list FOR SELECT
    USING (true);

-- Policy: Allow authenticated users to insert voter_metadata
CREATE POLICY "Allow authenticated insert to voter_metadata"
    ON voter_metadata FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to insert voter_list
CREATE POLICY "Allow authenticated insert to voter_list"
    ON voter_list FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to update voter_metadata
CREATE POLICY "Allow authenticated update to voter_metadata"
    ON voter_metadata FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Allow authenticated users to update voter_list
CREATE POLICY "Allow authenticated update to voter_list"
    ON voter_list FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE voter_metadata IS 'Stores ward/area level metadata from voter list PDFs';
COMMENT ON TABLE voter_list IS 'Stores individual voter information with reference to their ward metadata';

COMMENT ON COLUMN voter_metadata.area IS 'Area name in Bengali (এলাকা)';
COMMENT ON COLUMN voter_metadata.district IS 'District name in Bengali (জেলা)';
COMMENT ON COLUMN voter_metadata.upazila_thana IS 'Upazila/Thana name in Bengali (উপজেলা/থানা)';
COMMENT ON COLUMN voter_metadata.cc_pourosova IS 'City Corporation/Pauroshova in Bengali (সিটি কর্পোরেশন/পৌরসভা)';
COMMENT ON COLUMN voter_metadata.union_pouro_ward_cant_board IS 'Union/Pouro Ward/Cantonment Board in Bengali';
COMMENT ON COLUMN voter_metadata.ward_no_for_union IS 'Ward number (ওয়ার্ড নং)';
COMMENT ON COLUMN voter_metadata.voter_area_name IS 'Voter area sector name (ভোটার এলাকা সেক্টর)';
COMMENT ON COLUMN voter_metadata.voter_area_no IS 'Voter area number (ভোটার এলাকার নম্বর)';
COMMENT ON COLUMN voter_metadata.total_voter IS 'Total voters (সর্বমোট ভোটার সংখ্যা)';
COMMENT ON COLUMN voter_metadata.total_male_voter IS 'Total male voters (মোট পুরুষ ভোটার সংখ্যা)';
COMMENT ON COLUMN voter_metadata.total_female_voter IS 'Total female voters (মোট মহিলা ভোটার সংখ্যা)';
COMMENT ON COLUMN voter_metadata.voter_list_announce_date IS 'Voter list announcement date (ভোটার তালিকা প্রকাশের তারিখ)';

COMMENT ON COLUMN voter_list.voter_metadata_id IS 'Foreign key reference to voter_metadata table';
COMMENT ON COLUMN voter_list.serial_no IS 'Serial number in the voter list';
COMMENT ON COLUMN voter_list.voter_no IS 'Unique voter number (ভোটার নং)';
COMMENT ON COLUMN voter_list.voter_name IS 'Voter name in Bengali (নাম)';
COMMENT ON COLUMN voter_list.father_name IS 'Father name in Bengali (পিতা)';
COMMENT ON COLUMN voter_list.mother_name IS 'Mother name in Bengali (মাতা)';
COMMENT ON COLUMN voter_list.profession IS 'Profession in Bengali (পেশা)';
COMMENT ON COLUMN voter_list.date_of_birth IS 'Date of birth (জন্ম তারিখ)';
COMMENT ON COLUMN voter_list.address IS 'Address in Bengali (ঠিকানা)';
