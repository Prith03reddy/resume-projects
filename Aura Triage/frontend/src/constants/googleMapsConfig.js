/**
 * Google Maps Dark Theme JSON Configuration
 * Tailored for AuraTriage bg-slate-950 Mission Control Dashboard
 */
export const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] }, // Slate-900 base
  { elementType: "labels.text.stroke", stylers: [{ color: "#020617" }] }, // Slate-950
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] }, // Slate-400
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }], // Slate-300
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#064e3b" }, { lightness: -40 }], // Dark forest emerald
  },
  {
    featureType: "poi.hospital",
    elementType: "geometry",
    stylers: [{ color: "#065f46" }], // Muted trauma green
  },
  {
    featureType: "poi.hospital",
    elementType: "labels.icon",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }], // Slate-800 road asphalt
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#334155" }], // Slate-700 highways
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#e2e8f0" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#020617" }], // Deepest slate-950 navy water
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }, { lightness: -30 }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#020617" }],
  },
];

export const GOOGLE_MAPS_LIBRARIES = ['places'];

