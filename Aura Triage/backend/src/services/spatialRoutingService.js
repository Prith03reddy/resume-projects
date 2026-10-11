/**
 * Geospatial Routing Service
 * Dispatches to nearest active Level-1 or Level-2 trauma center within 15 km.
 * Automatically adapts between:
 *  - XAMPP MySQL/MariaDB: ST_Distance_Sphere(location, POINT(lng, lat))
 *  - PostgreSQL PostGIS:  ST_DWithin(...) and KNN '<->' GIST operator
 */

const { query, isMysql } = require('../db');

const DEFAULT_MAX_RADIUS_METERS = 15000; // 15 km Golden Hour radius

/**
 * Finds the closest active Level-1 or Level-2 trauma hospital to crash coordinates
 * @param {number} latitude - Crash latitude (WGS 84)
 * @param {number} longitude - Crash longitude (WGS 84)
 * @param {number} [maxRadiusMeters=15000] - Search radius threshold in meters
 * @returns {Promise<Object|null>} Nearest hospital record with calculated distance in km
 */
async function findNearestTraumaHospital(latitude, longitude, maxRadiusMeters = DEFAULT_MAX_RADIUS_METERS) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error(`Invalid WGS 84 spatial coordinates: lat=${latitude}, lng=${longitude}`);
  }

  let result;

  if (isMysql) {
    // MySQL / MariaDB (XAMPP Server) Spatial Query
    // Uses ST_Distance_Sphere with HAVING clause for single-pass positional parameters
    const sql = `
      SELECT 
        h.hospital_id,
        h.name,
        h.trauma_level,
        h.is_active,
        ST_Y(h.location) AS latitude,
        ST_X(h.location) AS longitude,
        ROUND(ST_Distance_Sphere(h.location, POINT(?, ?)) / 1000.0, 2) AS distance_km
      FROM hospitals h
      WHERE 
        h.is_active = 1
        AND h.trauma_level IN ('1', '2')
      HAVING distance_km <= (? / 1000.0)
      ORDER BY distance_km ASC
      LIMIT 1;
    `;
    result = await query(sql, [lng, lat, maxRadiusMeters]);
  } else {
    // PostgreSQL + PostGIS Spatial Query
    const sql = `
      SELECT 
        h.hospital_id,
        h.name,
        h.trauma_level,
        h.is_active,
        ST_Y(h.location) AS latitude,
        ST_X(h.location) AS longitude,
        ROUND(
          (ST_Distance(
            h.location::geography,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
          ) / 1000.0)::numeric, 
          2
        ) AS distance_km
      FROM hospitals h
      WHERE 
        h.is_active = TRUE
        AND h.trauma_level IN ('1', '2')
        AND ST_DWithin(
          h.location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
      ORDER BY 
        h.location <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
      LIMIT 1;
    `;
    result = await query(sql, [lng, lat, maxRadiusMeters]);
  }

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    hospitalId: row.hospital_id,
    name: row.name,
    traumaLevel: row.trauma_level,
    isActive: Boolean(row.is_active),
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    distanceKm: parseFloat(row.distance_km),
  };
}

module.exports = {
  findNearestTraumaHospital,
  DEFAULT_MAX_RADIUS_METERS,
};
