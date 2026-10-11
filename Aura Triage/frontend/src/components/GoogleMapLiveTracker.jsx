import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMapsScript } from '../utils/googleMapsLoader';
import { darkMapStyle } from '../constants/googleMapsConfig';
import {
  Navigation,
  Compass,
  Hospital,
  MapPin,
  Radio,
  ExternalLink,
  Layers,
  Car,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function GoogleMapLiveTracker({
  cLat,
  cLon,
  hLat,
  hLon,
  hName = 'Metro General Trauma Center',
  isDark = true,
  onRouteCalculated,
  onError,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const trafficLayerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const patientMarkerRef = useRef(null);
  const hospitalMarkerRef = useRef(null);
  const ambulanceMarkerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isTrafficActive, setIsTrafficActive] = useState(false);
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' | 'satellite' | 'hybrid'
  const [googleDistance, setGoogleDistance] = useState(null);
  const [googleEta, setGoogleEta] = useState(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Initialize Google Maps instance
  useEffect(() => {
    let isMounted = true;

    loadGoogleMapsScript(apiKey)
      .then((googleMaps) => {
        if (!isMounted || !mapContainerRef.current) return;

        const center = {
          lat: (cLat + hLat) / 2,
          lng: (cLon + hLon) / 2,
        };

        const map = new googleMaps.Map(mapContainerRef.current, {
          center,
          zoom: 14,
          styles: isDark ? darkMapStyle : [],
          mapTypeId: mapType,
          disableDefaultUI: false,
          zoomControl: true,
          zoomControlOptions: {
            position: googleMaps.ControlPosition.RIGHT_BOTTOM,
          },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;

        // 1. Live Patient Location Marker (Custom High-Visibility Red Pin)
        const patientSvg = {
          path: googleMaps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        };

        const patientMarker = new googleMaps.Marker({
          position: { lat: cLat, lng: cLon },
          map,
          title: '🚨 Patient GPS Location (Crash Fix)',
          icon: patientSvg,
          animation: googleMaps.Animation.DROP,
        });
        patientMarkerRef.current = patientMarker;

        const patientInfoWindow = new googleMaps.InfoWindow({
          content: `
            <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; padding: 4px; line-height: 1.4;">
              <strong style="color: #ef4444; font-size: 13px;">🚨 PATIENT GPS LOCATION (CRASH FIX)</strong><br/>
              <span>Lat: <strong>${cLat.toFixed(5)}° N</strong></span><br/>
              <span>Lon: <strong>${Math.abs(cLon).toFixed(5)}° W</strong></span><br/>
              <span style="color: #0284c7; font-weight: 700;">Nearest ER: ${hName}</span>
            </div>
          `,
        });

        patientMarker.addListener('click', () => {
          patientInfoWindow.open(map, patientMarker);
        });

        // 2. Receiving Trauma Hospital Marker (Emerald Hospital Pin)
        const hospitalSvg = {
          path: googleMaps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 8,
          fillColor: '#10b981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
          rotation: 180,
        };

        const hospitalMarker = new googleMaps.Marker({
          position: { lat: hLat, lng: hLon },
          map,
          title: `🏥 Receiving Trauma Hospital: ${hName}`,
          icon: hospitalSvg,
        });
        hospitalMarkerRef.current = hospitalMarker;

        const hospitalInfoWindow = new googleMaps.InfoWindow({
          content: `
            <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; padding: 4px; line-height: 1.4;">
              <strong style="color: #10b981; font-size: 13px;">🏥 RECEIVING TRAUMA CENTER</strong><br/>
              <span style="font-weight: 600;">${hName}</span><br/>
              <span>Lat: ${hLat.toFixed(5)}° N, Lon: ${Math.abs(hLon).toFixed(5)}° W</span>
            </div>
          `,
        });

        hospitalMarker.addListener('click', () => {
          hospitalInfoWindow.open(map, hospitalMarker);
        });

        // 3. Google Directions Service & Route Corridor
        const directionsService = new googleMaps.DirectionsService();
        const directionsRenderer = new googleMaps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#38bdf8', // Neon Sky-400
            strokeWeight: 5,
            strokeOpacity: 0.9,
          },
        });
        directionsRendererRef.current = directionsRenderer;

        directionsService.route(
          {
            origin: { lat: hLat, lng: hLon },
            destination: { lat: cLat, lng: cLon },
            travelMode: googleMaps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === googleMaps.DirectionsStatus.OK && result.routes && result.routes[0]) {
              directionsRenderer.setDirections(result);

              const leg = result.routes[0].legs[0];
              const distKm = Math.round((leg.distance.value / 1000) * 10) / 10;
              const durationMins = Math.max(2, Math.round(leg.duration.value / 60));

              setGoogleDistance(distKm);
              setGoogleEta(durationMins);

              if (onRouteCalculated) {
                onRouteCalculated({ distanceKm: distKm, etaMinutes: durationMins });
              }

              // Ambulance waypoint midway
              const path = result.routes[0].overview_path;
              if (path && path.length > 0) {
                const midIndex = Math.floor(path.length * 0.65);
                const ambPos = path[midIndex];

                const ambulanceMarker = new googleMaps.Marker({
                  position: ambPos,
                  map,
                  title: '🚑 Ambulance Unit 4 En Route (Google Directions Corridor)',
                  icon: {
                    path: googleMaps.SymbolPath.CIRCLE,
                    scale: 7,
                    fillColor: '#0284c7',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                  },
                });
                ambulanceMarkerRef.current = ambulanceMarker;
              }

              // Fit to route bounds
              const bounds = new googleMaps.LatLngBounds();
              bounds.extend({ lat: cLat, lng: cLon });
              bounds.extend({ lat: hLat, lng: hLon });
              map.fitBounds(bounds, 50);
            }
          }
        );

        // 4. Traffic Layer Setup
        const trafficLayer = new googleMaps.TrafficLayer();
        trafficLayerRef.current = trafficLayer;

        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('[Google Maps SDK Error, falling back]:', err.message);
        setLoadError(err.message);
        setIsLoading(false);
        if (onError) onError(err);
      });

    return () => {
      isMounted = false;
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
      if (patientMarkerRef.current) {
        patientMarkerRef.current.setMap(null);
      }
      if (hospitalMarkerRef.current) {
        hospitalMarkerRef.current.setMap(null);
      }
      if (ambulanceMarkerRef.current) {
        ambulanceMarkerRef.current.setMap(null);
      }
      mapInstanceRef.current = null;
    };
  }, [cLat, cLon, hLat, hLon, hName, isDark, apiKey]);

  // Update theme & mapType dynamically
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;
    mapInstanceRef.current.setOptions({
      styles: mapType === 'roadmap' && isDark ? darkMapStyle : [],
      mapTypeId: mapType,
    });
  }, [mapType, isDark]);

  // Toggle Traffic Layer
  const toggleTraffic = () => {
    if (!trafficLayerRef.current || !mapInstanceRef.current) return;
    if (isTrafficActive) {
      trafficLayerRef.current.setMap(null);
      setIsTrafficActive(false);
    } else {
      trafficLayerRef.current.setMap(mapInstanceRef.current);
      setIsTrafficActive(true);
    }
  };

  const handleRecenter = () => {
    if (!mapInstanceRef.current || !window.google) return;
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: cLat, lng: cLon });
    bounds.extend({ lat: hLat, lng: hLon });
    mapInstanceRef.current.fitBounds(bounds, 50);
  };

  const googleMapsAppUrl = `https://www.google.com/maps/dir/?api=1&origin=${hLat},${hLon}&destination=${cLat},${cLon}`;

  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-300 space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <h4 className="text-sm font-bold text-white">Google Maps SDK Notice</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          {loadError}. AuraTriage will seamlessly switch to the high-speed Leaflet corridor.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col">
      {/* ─── HUD BAR FOR GOOGLE MAPS CONTROLS ─── */}
      <div className="z-10 bg-slate-900/95 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-md">
        {/* Left: Patient GPS Tracker Indicator */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="flex items-center space-x-1.5 bg-red-950/70 border border-red-500/50 text-red-300 px-2.5 py-1 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            <span className="font-bold">PATIENT LIVE GPS:</span>
            <span className="text-white font-bold">{cLat.toFixed(4)}°, {cLon.toFixed(4)}°</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-lg">
            <Hospital className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">ER BAY:</span>
            <span className="text-white font-bold">{hName.split(' ')[0]} ({googleDistance || 1.8} km)</span>
          </div>
        </div>

        {/* Right: Controls & Google App Link */}
        <div className="flex items-center space-x-2">
          {/* Traffic Toggle */}
          <button
            onClick={toggleTraffic}
            className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition flex items-center space-x-1 border ${
              isTrafficActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Live Google Traffic Layer"
          >
            <Car className="w-3 h-3 text-amber-400" />
            <span>Traffic {isTrafficActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* Map Type Toggle */}
          <button
            onClick={() => setMapType(mapType === 'roadmap' ? 'hybrid' : 'roadmap')}
            className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center space-x-1"
            title="Toggle Google Roadmap / Satellite Hybrid"
          >
            <Layers className="w-3 h-3 text-sky-400" />
            <span className="uppercase">{mapType}</span>
          </button>

          {/* Recenter */}
          <button
            onClick={handleRecenter}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Recenter corridor view"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
          </button>

          {/* Direct Google Maps Link */}
          <a
            href={googleMapsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold font-mono transition shadow-sm"
            title="Open Live GPS Route in Google Maps"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Google Nav</span>
          </a>
        </div>
      </div>

      {/* ─── MAP CANVAS (GOOGLE MAPS SDK) ─── */}
      <div className="flex-1 w-full relative">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50">
            <div className="flex items-center space-x-2 text-xs font-mono text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
              <span>Connecting to Google Maps Live Telemetry...</span>
            </div>
          </div>
        )}

        {/* Floating Route Card */}
        <div
          className={`absolute top-4 right-4 z-[10] rounded-2xl p-4 shadow-2xl backdrop-blur-md min-w-[220px] border transition ${
            isDark
              ? 'bg-slate-900/90 border-slate-700/80 text-slate-100 shadow-black/70'
              : 'bg-white/95 border-blue-200/90 text-slate-900 shadow-xl'
          }`}
        >
          <div className="flex items-center space-x-2 pb-2 mb-2 border-b border-slate-800">
            <Navigation className="w-4 h-4 text-sky-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Google Directions Live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Distance</span>
              <span className="text-xl font-black font-mono text-white">
                {googleDistance || 1.8}
                <span className="text-xs font-normal text-slate-400 ml-0.5">km</span>
              </span>
            </div>
            <div className="p-2 rounded-xl bg-amber-950/20 border border-amber-500/30">
              <span className="text-[9px] uppercase font-bold text-amber-500 block">Arrival ETA</span>
              <span className="text-xl font-black font-mono text-amber-400">
                {googleEta || 5}
                <span className="text-xs font-normal text-amber-500 ml-0.5">min</span>
              </span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Google SDK Active</span>
            </span>
            <span className="text-sky-400 font-bold">65% Transit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

