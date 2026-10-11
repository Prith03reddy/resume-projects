/**
 * AuraTriage - Terminal Database Inspector
 * Displays tabular views of all database tables (patients, hospitals, incidents).
 * Supports both XAMPP MySQL/MariaDB and PostgreSQL.
 * Usage: npm run db:view
 */

require('dotenv').config();
const { pool, query, isMysql } = require('./db');

function parseArrayField(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [val];
    } catch {
      return [val];
    }
  }
  return [];
}

async function viewDatabase() {
  console.log('\n================================================================');
  console.log(`🔍 AuraTriage Database Inspector [${isMysql ? 'XAMPP MySQL / MariaDB' : 'PostgreSQL + PostGIS'}]`);
  console.log('================================================================\n');

  try {
    if (isMysql) {
      const infoRes = await query(`SELECT DATABASE() AS db_name, USER() AS db_user, VERSION() AS db_version;`);
      console.log(`Connected to XAMPP DB: "${infoRes.rows[0].db_name}" as "${infoRes.rows[0].db_user}"`);
      console.log(`Server Engine:         ${infoRes.rows[0].db_version}\n`);
    } else {
      const infoRes = await query(`SELECT current_database() AS database, current_user AS user, version() AS pg_version, postgis_version() AS postgis_version;`);
      console.log(`Connected to DB:       "${infoRes.rows[0].database}" as "${infoRes.rows[0].user}"`);
      console.log(`PostGIS Version:       ${infoRes.rows[0].postgis_version}\n`);
    }

    // 1. Query Patients Table
    console.log('📋 TABLE: patients (EMR)');
    console.log('----------------------------------------------------------------');
    const patientsRes = await query(`
      SELECT patient_id, full_name, age, blood_group, allergies, chronic_conditions, emergency_contact
      FROM patients
      ORDER BY created_at ASC;
    `);

    if (patientsRes.rows.length === 0) {
      console.log('No patient records found.\n');
    } else {
      console.table(patientsRes.rows.map(p => ({
        ID: p.patient_id.substring(0, 8) + '...',
        Name: p.full_name,
        Age: p.age,
        Blood: p.blood_group,
        Allergies: parseArrayField(p.allergies).join(', '),
        Conditions: parseArrayField(p.chronic_conditions).join(', '),
        EmergencyContact: p.emergency_contact
      })));
    }

    // 2. Query Hospitals Table
    console.log('\n🏥 TABLE: hospitals (Trauma Facilities)');
    console.log('----------------------------------------------------------------');
    const hospitalsRes = await query(`
      SELECT hospital_id, name, trauma_level, is_active, ST_Y(location) AS latitude, ST_X(location) AS longitude
      FROM hospitals
      ORDER BY trauma_level ASC;
    `);

    if (hospitalsRes.rows.length === 0) {
      console.log('No hospital records found.\n');
    } else {
      console.table(hospitalsRes.rows.map(h => ({
        ID: h.hospital_id.substring(0, 8) + '...',
        HospitalName: h.name,
        Level: `Level ${h.trauma_level}`,
        Active: (h.is_active === 1 || h.is_active === true) ? 'Yes' : 'No',
        Latitude: parseFloat(h.latitude).toFixed(4),
        Longitude: parseFloat(h.longitude).toFixed(4)
      })));
    }

    // 3. Query Incidents Table
    console.log('\n🚨 TABLE: incidents (Crash Dispatch Queue)');
    console.log('----------------------------------------------------------------');
    const incidentsRes = await query(`
      SELECT 
        i.incident_id, 
        p.full_name AS patient_name, 
        h.name AS hospital_name, 
        i.pre_crash_speed_kmh AS speed_kmh, 
        i.peak_g_force AS g_force, 
        ST_Y(i.crash_location) AS crash_lat, 
        ST_X(i.crash_location) AS crash_lng, 
        i.status, 
        i.created_at
      FROM incidents i
      LEFT JOIN patients p ON i.patient_id = p.patient_id
      LEFT JOIN hospitals h ON i.hospital_id = h.hospital_id
      ORDER BY i.created_at DESC
      LIMIT 10;
    `);

    if (incidentsRes.rows.length === 0) {
      console.log('No incidents recorded yet.\n');
    } else {
      console.table(incidentsRes.rows.map(inc => ({
        IncidentID: inc.incident_id.substring(0, 8) + '...',
        Patient: inc.patient_name || 'Unknown',
        Hospital: inc.hospital_name || 'Unassigned',
        Speed: `${inc.speed_kmh} km/h`,
        GForce: `${inc.g_force}g`,
        CrashCoords: `${parseFloat(inc.crash_lat).toFixed(4)}, ${parseFloat(inc.crash_lng).toFixed(4)}`,
        Status: inc.status,
        Time: new Date(inc.created_at).toLocaleTimeString()
      })));
    }

  } catch (err) {
    console.error('\n❌ Could not connect or query database:');
    console.error(err.message);
  } finally {
    if (pool.end) await pool.end();
  }
}

viewDatabase();
