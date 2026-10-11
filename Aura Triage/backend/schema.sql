-- ==============================================================================
-- AuraTriage: PostgreSQL 16 + PostGIS 3.4 Production Schema
-- Mission-Critical Autonomous ER Trauma Dispatch Hub
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Drop Existing Objects (Clean Initialization)
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TYPE IF EXISTS trauma_level_enum CASCADE;
DROP TYPE IF EXISTS incident_status_enum CASCADE;

-- 3. Custom Enumerated Types
CREATE TYPE trauma_level_enum AS ENUM ('1', '2', '3');
CREATE TYPE incident_status_enum AS ENUM ('TRIGGERED', 'DISPATCHED', 'PREPARED', 'RESOLVED');

-- 4. Patients Table (EMR - Electronic Medical Record)
CREATE TABLE patients (
    patient_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age < 130),
    blood_group VARCHAR(10) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    chronic_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
    emergency_contact VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Hospitals Table (Trauma Receiving Facilities)
CREATE TABLE hospitals (
    hospital_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    trauma_level trauma_level_enum NOT NULL,
    -- WGS 84 Coordinates: Point(Longitude, Latitude)
    location GEOMETRY(Point, 4326) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Incidents Table (Emergency Queue & Kinematics)
CREATE TABLE incidents (
    incident_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE RESTRICT,
    hospital_id UUID NOT NULL REFERENCES hospitals(hospital_id) ON DELETE RESTRICT,
    pre_crash_speed_kmh NUMERIC(6, 2) NOT NULL CHECK (pre_crash_speed_kmh >= 0),
    peak_g_force NUMERIC(5, 2) NOT NULL CHECK (peak_g_force >= 0),
    crash_location GEOMETRY(Point, 4326) NOT NULL,
    status incident_status_enum NOT NULL DEFAULT 'TRIGGERED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. High-Performance GIST Spatial Indexes
CREATE INDEX idx_hospitals_location_gist ON hospitals USING GIST (location);
CREATE INDEX idx_incidents_crash_location_gist ON incidents USING GIST (crash_location);

-- 8. Relational Lookup and Filter Indexes
CREATE INDEX idx_incidents_status_created ON incidents (status, created_at DESC);
CREATE INDEX idx_incidents_hospital_status ON incidents (hospital_id, status);
CREATE INDEX idx_hospitals_active_level ON hospitals (is_active, trauma_level);

-- 9. Auto-Update Timestamp Trigger Function
CREATE OR REPLACE FUNCTION set_updated_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_patients_updated
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION set_updated_timestamp();

CREATE TRIGGER trg_hospitals_updated
    BEFORE UPDATE ON hospitals
    FOR EACH ROW EXECUTE FUNCTION set_updated_timestamp();

CREATE TRIGGER trg_incidents_updated
    BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION set_updated_timestamp();

-- 10. Seed Data: Alex Mercer (Patient EMR) & Metro General Trauma Center (Level 1)
INSERT INTO patients (
    patient_id,
    full_name,
    age,
    blood_group,
    allergies,
    chronic_conditions,
    emergency_contact
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Alex Mercer',
    34,
    'O-',
    ARRAY['Penicillin', 'Sulfa Drugs'],
    ARRAY['Mild Asthma', 'Hypertension'],
    'Sarah Mercer (Spouse) +1 (555) 382-9912'
);

INSERT INTO hospitals (
    hospital_id,
    name,
    trauma_level,
    location,
    is_active
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'Metro General Trauma Center',
    '1',
    ST_SetSRID(ST_MakePoint(-73.9554, 40.7645), 4326),
    TRUE
),
(
    '22222222-2222-2222-2222-222222222222',
    'St. Jude Regional Acute Care',
    '2',
    ST_SetSRID(ST_MakePoint(-73.9875, 40.7360), 4326),
    TRUE
),
(
    '33333333-3333-3333-3333-333333333333',
    'Harborview Community Hospital',
    '3',
    ST_SetSRID(ST_MakePoint(-73.9980, 40.7180), 4326),
    TRUE
);
