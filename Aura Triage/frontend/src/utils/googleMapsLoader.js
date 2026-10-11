/**
 * Dynamic Google Maps JavaScript API SDK Loader
 * Safe, idempotent loader that handles promise caching, authentication failures, and fallbacks.
 */

let loadPromise = null;
let isAuthFailed = false;

// Global Google Maps authentication failure hook
if (typeof window !== 'undefined') {
  window.gm_authFailure = () => {
    console.warn('[Google Maps] Authentication Notice: Key restricted or billing pending. Using fallback layer.');
    isAuthFailed = true;
  };
}

export function loadGoogleMapsScript(apiKey) {
  if (isAuthFailed) {
    return Promise.reject(new Error('Google Maps authentication failed'));
  }

  if (typeof window !== 'undefined' && window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (loadPromise) {
    return loadPromise;
  }

  const key = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) {
    return Promise.reject(new Error('No Google Maps API key provided'));
  }

  loadPromise = new Promise((resolve, reject) => {
    // Check if script tag already injected
    const existingScript = document.getElementById('google-maps-api-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google.maps));
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-api-script';
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('window.google.maps not available after script load'));
      }
    };

    script.onerror = (err) => {
      console.warn('[Google Maps] Failed to load SDK script:', err);
      reject(err);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

