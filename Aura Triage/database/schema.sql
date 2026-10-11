-- ==============================================================================
-- AuraTriage: Trauma Care & Road Safety Relational Database Schema
-- Database: PostgreSQL 14+ with PostGIS Extension
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Drop Tables if exist (clean initialization)
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;

-- 3. Enum-like Validation Domains / Checks
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    trauma_level VARCHAR(20) NOT NULL CHECK (trauma_level IN ('Level-1', 'Level-2', 'Level-3', 'Level-4')),
    -- GPS Location stored in WGS84 coordinates (SRID 4326: Lon, Lat)
    location GEOMETRY(Point, 4326) NOT NULL,
    icu_beds_available INTEGER NOT NULL DEFAULT 0 CHECK (icu_beds_available >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    contact_phone VARCHAR(50) NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age < 130),
    blood_group VARCHAR(10) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    chronic_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
    emergency_contact_name VARCHAR(255) NOT NULL,
    emergency_contact_phone VARCHAR(50) NOT NULL,
    insurance_policy_no VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    pre_crash_speed NUMERIC(6, 2) NOT NULL CHECK (pre_crash_speed >= 0), -- Speed in km/h
    impact_speed NUMERIC(6, 2) NOT NULL CHECK (impact_speed >= 0),       -- Terminal speed in km/h
    peak_g_force NUMERIC(5, 2) NOT NULL CHECK (peak_g_force >= 0),       -- Peak G-force in g-units
    crash_location GEOMETRY(Point, 4326) NOT NULL,                       -- Point(lon, lat)
    status VARCHAR(30) NOT NULL DEFAULT 'TRIGGERED' 
        CHECK (status IN ('TRIGGERED', 'DISPATCHED', 'PREPARED', 'RESOLVED')),
    transit_eta_minutes INTEGER CHECK (transit_eta_minutes >= 0),
    distance_km NUMERIC(6, 2) CHECK (distance_km >= 0),
    encrypted_payload_hash VARCHAR(128),
    telemetry_metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Spatial and Performance Indexes
CREATE INDEX idx_hospitals_spatial_location ON hospitals USING GIST (location);
CREATE INDEX idx_incidents_crash_location ON incidents USING GIST (crash_location);
CREATE INDEX idx_incidents_status ON incidents (status);
CREATE INDEX idx_incidents_patient_id ON incidents (patient_id);
CREATE INDEX idx_incidents_hospital_id ON incidents (hospital_id);
CREATE INDEX idx_hospitals_active_level ON hospitals (is_active, trauma_level);

-- 5. Auto-update Timestamp Trigger Function
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_hospitals_timestamp
    BEFORE UPDATE ON hospitals
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER trg_update_patients_timestamp
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER trg_update_incidents_timestamp
    BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- 6. Geospatial Stored Procedure: Find Nearest Active Trauma Center (within 15km)
CREATE OR REPLACE FUNCTION find_nearest_trauma_hospital(
    crash_lon DOUBLE PRECISION,
    crash_lat DOUBLE PRECISION,
    max_radius_meters DOUBLE PRECISION DEFAULT 15000
)
RETURNS TABLE (
    hospital_id UUID,
    hospital_name VARCHAR(255),
    trauma_level VARCHAR(20),
    icu_beds INTEGER,
    hospital_lon DOUBLE PRECISION,
    hospital_lat DOUBLE PRECISION,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        h.trauma_level,
        h.icu_beds_available,
        ST_X(h.location::geometry) AS hospital_lon,
        ST_Y(h.location::geometry) AS hospital_lat,
        ST_Distance(
            h.location::geography, 
            ST_SetSRID(ST_MakePoint(crash_lon, crash_lat), 4326)::geography
        ) AS distance_meters
    FROM hospitals h
    WHERE 
        h.is_active = TRUE
        AND h.trauma_level IN ('Level-1', 'Level-2')
        AND h.icu_beds_available > 0
        AND ST_DWithin(
            h.location::geography,
            ST_SetSRID(ST_MakePoint(crash_lon, crash_lat), 4326)::geography,
            max_radius_meters
        )
    ORDER BY distance_meters ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 7. Seed Data for Hackathon Testing & Simulation
-- Reference Region: Metropolitan Trauma Corridor (New York / Manhattan area coordinates)
-- Longitude: ~ -73.97, Latitude: ~ 40.76

INSERT INTO hospitals (id, name, trauma_level, location, icu_beds_available, is_active, contact_phone, address)
VALUES
    ('11111111-1111-1111-1111-111111111111', 
     'Metro General Trauma Center', 
     'Level-1', 
     ST_SetSRID(ST_MakePoint(-73.9554, 40.7645), 4326), 
     6, 
     TRUE, 
     '+1 (555) 911-0101', 
     '525 E 68th St, New York, NY 10065'),
    
    ('22222222-2222-2222-2222-222222222222', 
     'St. Jude Regional Acute Care', 
     'Level-2', 
     ST_SetSRID(ST_MakePoint(-73.9875, 40.7360), 4326), 
     3, 
     TRUE, 
     '+1 (555) 911-0202', 
     '10 Nathan D Perlman Pl, New York, NY 10003'),
    
    ('33333333-3333-3333-3333-333333333333', 
     'Harborview Community Hospital', 
     'Level-3', 
     ST_SetSRID(ST_MakePoint(-73.9980, 40.7180), 4326), 
     1, 
     TRUE, 
     '+1 (555) 911-0303', 
     '170 William St, New York, NY 10038'),

    ('44444444-4444-4444-4444-444444444444', 
     'Northside Surgical & Trauma Institute', 
     'Level-1', 
     ST_SetSRID(ST_MakePoint(-73.9400, 40.7900), 4326), 
     8, 
     TRUE, 
     '+1 (555) 911-0404', 
     '1901 1st Ave, New York, NY 10029');

INSERT INTO patients (id, full_name, age, blood_group, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone, insurance_policy_no)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
     'Alex Mercer', 
     34, 
     'O-', 
     ARRAY['Penicillin', 'Sulfa Drugs'], 
     ARRAY['Mild Asthma', 'Hypertension'], 
     'Sarah Mercer (Spouse)', 
     '+1 (555) 382-9912', 
     'POL-882910-BLUECROSS'),

    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
     'Elena Rostova', 
     28, 
     'A+', 
     ARRAY['Latex'], 
     ARRAY['None'], 
     'Dmitri Rostov (Father)', 
     '+1 (555) 741-2099', 
     'POL-451992-AETNA'),

    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 
     'Marcus Vance', 
     45, 
     'B-', 
     ARRAY['Aspirin', 'Iodine Contrast'], 
     ARRAY['Type 2 Diabetes'], 
     'Linda Vance (Sister)', 
     '+1 (555) 891-3411', 
     'POL-102934-CIGNA');

