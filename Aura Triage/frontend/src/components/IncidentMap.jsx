import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import L from 'leaflet';
import { Navigation, Clock, MapPin, Hospital, Layers, Route, ShieldCheck, Compass, Activity, Radio, Truck } from 'lucide-react';

// In-memory cache for OSRM road geometry routes
const osrmRouteCache = new Map();

function IncidentMapComponent({
  crashCoords = { lat: 40.7589, lon: -73.9620 },
  hospitalCoords = { lat: 40.7645, lon: -73.9554 },
  hospitalName = "Metro General Trauma Center",
  distanceKm = 1.4,
  etaMinutes = 5,
  isDark = true,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const vehicleMarkerRef = useRef(null);

  // Safely parse numerical values regardless of whether input is string, number, or uses lat/latitude/lng/lon
  const cLat = Number.isFinite(parseFloat(crashCoords?.lat ?? crashCoords?.latitude))
    ? parseFloat(crashCoords?.lat ?? crashCoords?.latitude)
    : 40.7589;
  const cLon = Number.isFinite(parseFloat(crashCoords?.lon ?? crashCoords?.longitude ?? crashCoords?.lng))
    ? parseFloat(crashCoords?.lon ?? crashCoords?.longitude ?? crashCoords?.lng)
    : -73.9620;

  const hLat = Number.isFinite(parseFloat(hospitalCoords?.lat ?? hospitalCoords?.latitude))
    ? parseFloat(hospitalCoords?.lat ?? hospitalCoords?.latitude)
    : 40.7645;
  const hLon = Number.isFinite(parseFloat(hospitalCoords?.lon ?? hospitalCoords?.longitude ?? hospitalCoords?.lng))
    ? parseFloat(hospitalCoords?.lon ?? hospitalCoords?.longitude ?? hospitalCoords?.lng)
    : -73.9554;

  const hName = typeof hospitalName === 'string' && hospitalName.trim().length > 0
    ? hospitalName.trim()
    : 'Metro General Trauma Center';

  const [liveDistanceKm, setLiveDistanceKm] = useState(distanceKm || 1.4);
  const [liveEtaMinutes, setLiveEtaMinutes] = useState(etaMinutes || 5);
  const [transitProgress, setTransitProgress] = useState(65); // percentage along track line
  const [mapLayerMode, setMapLayerMode] = useState('google'); // 'google' | 'satellite' | 'street'

  // Synchronize state when props update
  useEffect(() => {
    if (distanceKm) setLiveDistanceKm(distanceKm);
  }, [distanceKm]);

  useEffect(() => {
    if (etaMinutes) setLiveEtaMinutes(etaMinutes);
  }, [etaMinutes]);

  const getTileConfig = useCallback((mode) => {
    if (mode === 'satellite') {
      return {
        url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        options: { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: '&copy; Google Satellite' },
      };
    }
    if (mode === 'street') {
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: { maxZoom: 19, subdomains: 'abcd', attribution: '&copy; OpenStreetMap' },
      };
    }
    // Default mode: 'google' (Google Maps standard roadmap tiles)
    return {
      url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      options: { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: '&copy; Google Maps' },
    };
  }, []);

  const cycleMapLayer = () => {
    const modes = ['google', 'satellite', 'street'];
    setMapLayerMode((prev) => {
      const idx = modes.indexOf(prev);
      return modes[(idx + 1) % modes.length];
    });
  };

  const coordsKey = `${cLat.toFixed(5)},${cLon.toFixed(5)}->${hLat.toFixed(5)},${hLon.toFixed(5)}`;
  const prevCoordsKeyRef = useRef('');

  // 1. Fetch High-Fidelity Street Routing via OSRM
  const fetchOsrmDrivingRoute = useCallback(async (startLat, startLon, endLat, endLon) => {
    const cacheKey = `${startLat.toFixed(5)},${startLon.toFixed(5)}->${endLat.toFixed(5)},${endLon.toFixed(5)}`;
    if (osrmRouteCache.has(cacheKey)) {
      return osrmRouteCache.get(cacheKey);
    }

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const latLngs = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
        const calculatedDistanceKm = Math.round((route.distance / 1000) * 10) / 10;
        const calculatedDurationMins = Math.max(2, Math.round(route.duration / 60));

        const result = {
          latLngs,
          distanceKm: calculatedDistanceKm,
          etaMinutes: calculatedDurationMins,
        };

        osrmRouteCache.set(cacheKey, result);
        return result;
      }
    } catch (err) {
      console.warn('[OSRM Routing] Network fallback to direct corridor:', err);
    }

    // Direct fallback corridor if routing server is slow
    return {
      latLngs: [
        [startLat, startLon],
        [endLat, endLon],
      ],
      distanceKm: distanceKm || 1.4,
      etaMinutes: etaMinutes || 5,
    };
  }, [distanceKm, etaMinutes]);

  // 2. Initialize Leaflet Map Instance with React 18 StrictMode Safety
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Reset container if previously tagged by Leaflet
    if (mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }

    const initialCenterLat = (cLat + hLat) / 2;
    const initialCenterLon = (cLon + hLon) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [initialCenterLat, initialCenterLon],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    const { url, options } = getTileConfig(mapLayerMode);
    const tileLayer = L.tileLayer(url, options).addTo(map);

    tileLayerRef.current = tileLayer;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    routeLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Invalidate size on mount and window resize
    const invalidate = () => {
      if (map) {
        map.invalidateSize();
      }
    };

    setTimeout(invalidate, 50);
    setTimeout(invalidate, 150);
    setTimeout(invalidate, 300);
    setTimeout(invalidate, 600);
    setTimeout(invalidate, 1200);

    const resizeObserver = new ResizeObserver(() => {
      invalidate();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 3. Handle Tile Layer Switching (Dark, Google Maps Road, Google Satellite, OpenStreetMap)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const { url, options } = getTileConfig(mapLayerMode);

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(url, options).addTo(mapInstanceRef.current);
    if (newLayer.bringToBack) {
      newLayer.bringToBack();
    }
    tileLayerRef.current = newLayer;
  }, [mapLayerMode, getTileConfig]);

  // 4. Draw Patient Location, Track Line, Moving Ambulance, and Hospital
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !routeLayerRef.current) return;
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const routeLayer = routeLayerRef.current;

    if (prevCoordsKeyRef.current === coordsKey && markersLayer.getLayers().length > 0) {
      return;
    }
    prevCoordsKeyRef.current = coordsKey;

    markersLayer.clearLayers();
    routeLayer.clearLayers();

    // ─── A. PATIENT GPS LOCATION MARKER (CRASH SITE) ───
    const patientGpsIcon = L.divIcon({
      className: 'custom-patient-gps-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(239, 68, 68, 0.45);" class="patient-gps-beacon"></div>
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(239, 68, 68, 0.3);" class="radar-ring"></div>
          <div style="width: 18px; height: 18px; border-radius: 50%; background: #ef4444; border: 3px solid #ffffff; box-shadow: 0 0 16px #ef4444; z-index: 2;"></div>
          <div style="position: absolute; top: -18px; white-space: nowrap; background: #0f172a; color: #fca5a5; border: 1px solid #ef4444; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.6); font-family: monospace;">
            PATIENT GPS
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    L.marker([cLat, cLon], { icon: patientGpsIcon })
      .addTo(markersLayer)
      .bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; padding: 4px; line-height: 1.4;">
          <strong style="color: #ef4444; font-size: 13px;">🚨 PATIENT GPS LOCATION (CRASH SITE)</strong><br/>
          <span>Lat: <strong>${cLat.toFixed(5)}° N</strong></span><br/>
          <span>Lon: <strong>${Math.abs(cLon).toFixed(5)}° W</strong></span><br/>
          <span style="color: #0284c7; font-weight: 700;">Nearest ER: ${hName}</span>
        </div>
      `);

    // ─── B. RECEIVING TRAUMA HOSPITAL MARKER ───
    const hospitalIcon = L.divIcon({
      className: 'custom-hospital-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="position: absolute; top: -18px; white-space: nowrap; background: #0f172a; color: #6ee7b7; border: 1px solid #10b981; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.6); font-family: monospace;">
            LEVEL-1 TRAUMA
          </div>
          <div style="width: 32px; height: 32px; background: #10b981; border: 2.5px solid #ffffff; border-radius: 10px; box-shadow: 0 0 16px rgba(16, 185, 129, 0.8); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 18px; font-family: monospace;">
            +
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([hLat, hLon], { icon: hospitalIcon })
      .addTo(markersLayer)
      .bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; padding: 4px; line-height: 1.4;">
          <strong style="color: #10b981; font-size: 13px;">🏥 RECEIVING TRAUMA CENTER</strong><br/>
          <span style="font-weight: 600;">${hName}</span><br/>
          <span>Lat: ${hLat.toFixed(5)}° N, Lon: ${Math.abs(hLon).toFixed(5)}° W</span>
        </div>
      `);

    // ─── C. INSTANT SYNCHRONOUS DIRECT TRACK LINE CORRIDOR ───
    const directFallbackLine = [
      [cLat, cLon],
      [hLat, hLon],
    ];

    const glowPolyline = L.polyline(directFallbackLine, {
      color: '#0284c7',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
    }).addTo(routeLayer);

    const activeTrackPolyline = L.polyline(directFallbackLine, {
      color: '#38bdf8',
      weight: 4.5,
      opacity: 0.95,
      lineCap: 'round',
      dashArray: '10, 10',
      className: 'animated-track-line',
    }).addTo(routeLayer);

    // Initial bounds fit
    const initialBounds = L.latLngBounds(directFallbackLine);
    map.fitBounds(initialBounds, { padding: [60, 60], maxZoom: 16 });

    // ─── D. ASYNCHRONOUS OSRM REAL STREET NETWORK REFINEMENT ───
    fetchOsrmDrivingRoute(cLat, cLon, hLat, hLon).then((routeData) => {
      if (routeData && routeData.latLngs && routeData.latLngs.length > 1) {
        glowPolyline.setLatLngs(routeData.latLngs);
        activeTrackPolyline.setLatLngs(routeData.latLngs);

        setLiveDistanceKm(routeData.distanceKm);
        setLiveEtaMinutes(routeData.etaMinutes);

        // Calculate vehicle waypoint at ~65% along track line
        const waypointIndex = Math.min(
          routeData.latLngs.length - 1,
          Math.max(1, Math.floor(routeData.latLngs.length * 0.65))
        );
        const vehiclePos = routeData.latLngs[waypointIndex];

        if (vehicleMarkerRef.current) {
          markersLayer.removeLayer(vehicleMarkerRef.current);
        }

        const ambulanceIcon = L.divIcon({
          className: 'custom-ambulance-marker',
          html: `
            <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(56, 189, 248, 0.4);" class="radar-ring"></div>
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 0 14px #38bdf8; display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;">
                🚑
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const ambMarker = L.marker(vehiclePos, { icon: ambulanceIcon })
          .addTo(markersLayer)
          .bindPopup(`
            <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; padding: 4px;">
              <strong style="color: #0284c7;">AMBULANCE UNIT 4 EN ROUTE</strong><br/>
              <span>Speed: <strong>64 km/h</strong></span><br/>
              <span>Corridor Transit: <strong>65% Completed</strong></span>
            </div>
          `);

        vehicleMarkerRef.current = ambMarker;

        const routeBounds = L.latLngBounds(routeData.latLngs);
        map.fitBounds(routeBounds, { padding: [60, 60], maxZoom: 16 });
      }
    });

  }, [coordsKey, cLat, cLon, hLat, hLon, hName, fetchOsrmDrivingRoute]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([
      [cLat, cLon],
      [hLat, hLon],
    ]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
  };

  const googleNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${hLat},${hLon}&destination=${cLat},${cLon}`;

  return (
    <div className={`w-full h-full min-h-[420px] relative overflow-hidden flex flex-col ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
      
      {/* ─── 1. DEDICATED LIVE GPS TRANSIT & TRACK LINE INDICATOR HUD BAR ─── */}
      <div className="z-10 bg-slate-900/95 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-md">
        {/* Left: Patient GPS to Hospital Vector Link */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          {/* Patient Fix */}
          <div className="flex items-center space-x-1.5 bg-red-950/60 border border-red-500/40 text-red-300 px-2.5 py-1 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            <span className="font-bold">PATIENT GPS:</span>
            <span className="text-white font-bold">{cLat.toFixed(4)}°, {cLon.toFixed(4)}°</span>
          </div>

          {/* Animated Connecting Track Arrow */}
          <div className="hidden sm:flex items-center space-x-1 text-sky-400 font-bold">
            <span>──</span>
            <span className="animate-pulse">▶</span>
            <span className="px-1.5 py-0.5 rounded bg-sky-950 border border-sky-500/40 text-[10px] text-sky-300 flex items-center space-x-1">
              <span>🚑 UNIT 4 (65%)</span>
            </span>
            <span className="animate-pulse">▶</span>
            <span>──</span>
          </div>

          {/* Hospital Fix */}
          <div className="flex items-center space-x-1.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-lg">
            <Hospital className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">RECEIVING BAY:</span>
            <span className="text-white font-bold">{hName.split(' ')[0]} ({liveDistanceKm} km)</span>
          </div>
        </div>

        {/* Right: Quick Map Controls & Navigation */}
        <div className="flex items-center space-x-2">
          {/* Direct Google Maps Turn-by-Turn Navigation */}
          <a
            href={googleNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
            title="Open Turn-by-Turn Navigation in Google Maps"
          >
            <Navigation className="w-3 h-3" />
            <span>Google Nav</span>
          </a>

          <button
            onClick={handleRecenter}
            className="flex items-center space-x-1 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Recenter corridor view"
          >
            <Compass className="w-3 h-3 text-sky-400" />
            <span className="hidden md:inline">Recenter</span>
          </button>

          <button
            onClick={cycleMapLayer}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition text-[11px] font-mono font-semibold"
            title="Toggle Map Style (Google Maps, Google Satellite, Street Mode)"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="uppercase text-[10px] tracking-wider">{mapLayerMode}</span>
          </button>
        </div>
      </div>

      {/* ─── 2. MAP CANVAS (LEAFLET + ZERO API KEYS) ─── */}
      <div className="flex-1 w-full relative min-h-[380px]" style={{ minHeight: '380px' }}>
        <div
          ref={mapContainerRef}
          className="w-full h-full z-0 absolute inset-0"
          style={{ width: '100%', height: '100%' }}
        />

        {/* ─── 3. FLOATING ROUTE & LIVE TELEMETRY CARD ─── */}
        <div
          className={`absolute top-4 right-4 z-[400] rounded-2xl p-4 shadow-2xl backdrop-blur-md min-w-[240px] border transition pointer-events-auto ${
            isDark
              ? 'bg-slate-900/90 border-slate-700/80 text-slate-100 shadow-black/70'
              : 'bg-white/95 border-blue-200/90 text-slate-900 shadow-xl'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-2.5 mb-2.5 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-500/10 text-sky-400 rounded-lg">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono block text-slate-200">
                  Live Track Line Indicator
                </span>
                <span className="text-[10px] text-sky-400 font-semibold block font-mono">
                  Streaming OSRM Road Path
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Real Road Distance */}
            <div
              className={`p-2.5 rounded-xl border ${
                isDark
                  ? 'bg-slate-950/70 border-slate-800'
                  : 'bg-slate-50 border-slate-200/60'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Track Distance
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black font-mono tracking-tight text-white">
                  {liveDistanceKm}
                </span>
                <span className="text-xs font-bold font-mono text-slate-400">
                  km
                </span>
              </div>
            </div>

            {/* Real Road ETA */}
            <div
              className={`p-2.5 rounded-xl border ${
                isDark
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-amber-50 border-amber-200/60'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-amber-500 block mb-0.5">
                Arrival ETA
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black font-mono text-amber-400 tracking-tight">
                  {liveEtaMinutes}
                </span>
                <span className="text-xs font-bold font-mono text-amber-500">
                  mins
                </span>
              </div>
            </div>
          </div>

          {/* Transit Flow Indicator */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Corridor Transit:</span>
              <span className="text-sky-400 font-bold">{transitProgress}% En Route</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${transitProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
              <span>Patient Fix</span>
              <span>Trauma Bay</span>
            </div>
          </div>
        </div>

        {/* ─── 4. MAP LEGEND (Bottom Left) ─── */}
        <div
          className={`absolute bottom-4 left-4 z-[400] rounded-xl px-3.5 py-2 text-xs flex items-center space-x-4 shadow-lg backdrop-blur-sm border pointer-events-auto ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 text-slate-300'
              : 'bg-white/90 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm inline-block" />
            <span className="font-semibold text-[11px]">Patient GPS Fix</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xs">🚑</span>
            <span className="font-semibold text-[11px]">Ambulance En Route</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 shadow-sm inline-block" />
            <span className="font-semibold text-[11px]">Nearest Hospital</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-sky-400 inline-block" />
            <span className="text-[11px] text-sky-400 font-semibold">Active Track Line</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(IncidentMapComponent);
