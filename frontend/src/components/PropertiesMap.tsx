'use client';

import { useEffect, useId, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Map as MapIcon } from 'lucide-react';
import type { Property } from '@/lib/useProperties';

const US_CENTER: [number, number] = [-98.5795, 39.8283];

const hasCoords = (p: Property): p is Property & { lat: number; lng: number } =>
  typeof p.lat === 'number' && typeof p.lng === 'number';

/**
 * Build popup content as DOM nodes rather than an HTML string.
 * Titles and cities are agent-supplied, so interpolating them into
 * `setHTML()` would let a crafted listing run script in visitors' browsers.
 */
function buildPopupContent(p: Property, subtitle: string): HTMLElement {
  const wrapper = document.createElement('div');

  const title = document.createElement('strong');
  title.textContent = p.title;
  wrapper.appendChild(title);

  const detail = document.createElement('div');
  detail.textContent = subtitle;
  wrapper.appendChild(detail);

  const place = [p.city, p.state].filter(Boolean).join(', ');
  if (place) {
    const location = document.createElement('div');
    location.textContent = place;
    wrapper.appendChild(location);
  }

  return wrapper;
}

const priceLabel = (p: Property) =>
  p.price != null ? `$${Number(p.price).toLocaleString()}` : 'Price on request';

const roiLabel = (p: Property) =>
  p.investmentData?.roi != null ? `ROI: ${p.investmentData.roi}%` : 'ROI: N/A';

export default function PropertiesMap({
  properties,
  loading = false,
  error = null,
  height = '500px',
  variant = 'price',
}: {
  properties: Property[];
  loading?: boolean;
  error?: string | null;
  height?: string;
  /** Which detail to show under the title in each marker popup. */
  variant?: 'price' | 'roi';
}) {
  // useId keeps multiple maps on one page from colliding on container id.
  const containerId = `properties-map-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [mapLoaded, setMapLoaded] = useState(false);
  const hasToken = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);

  useEffect(() => {
    if (!hasToken) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    const pins = properties.filter(hasCoords);
    const center: [number, number] = pins.length ? [pins[0].lng, pins[0].lat] : US_CENTER;

    const map = new mapboxgl.Map({
      container: containerId,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom: pins.length ? 4 : 3,
    });

    pins.forEach((p) => {
      const subtitle = variant === 'roi' ? roiLabel(p) : priceLabel(p);
      new mapboxgl.Marker({ color: '#2563eb' })
        .setLngLat([p.lng, p.lat])
        .setPopup(new mapboxgl.Popup({ offset: 16 }).setDOMContent(buildPopupContent(p, subtitle)))
        .addTo(map);
    });

    map.on('load', () => setMapLoaded(true));

    return () => {
      map.remove();
      setMapLoaded(false);
    };
  }, [properties, hasToken, containerId, variant]);

  const pinCount = properties.filter(hasCoords).length;
  const showOverlay = !hasToken || Boolean(error) || loading || !mapLoaded || pinCount === 0;

  return (
    <div
      className="bg-white rounded-[40px] shadow-2xl border-4 border-white overflow-hidden relative"
      style={{ height }}
    >
      <div id={containerId} className="w-full h-full" />
      {showOverlay && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50/60 text-center p-8 pointer-events-none">
          <MapIcon className="h-16 w-16 text-primary/20 mb-4" />
          {!hasToken ? (
            <>
              <h3 className="text-xl font-extrabold text-secondary mb-2">Map unavailable</h3>
              <p className="text-gray-500 max-w-md">
                Set NEXT_PUBLIC_MAPBOX_TOKEN to a valid Mapbox token to enable the map.
              </p>
            </>
          ) : error ? (
            <p className="text-red-500 font-semibold max-w-md">{error}</p>
          ) : loading ? (
            <h3 className="text-xl font-extrabold text-secondary">Loading listings...</h3>
          ) : !mapLoaded ? (
            <h3 className="text-xl font-extrabold text-secondary">Loading map...</h3>
          ) : (
            <>
              <h3 className="text-xl font-extrabold text-secondary mb-2">No mapped listings yet</h3>
              <p className="text-gray-500 max-w-md">
                Listings will appear here once they include a location.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
