"use client";

import { useEffect, useRef, memo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Coordinates } from "@/lib/distance";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapProps {
  pickup: Coordinates;
  delivery: Coordinates;
  currentPosition?: Coordinates;
  className?: string;
}

const Map = memo(function Map({
  pickup,
  delivery,
  currentPosition,
  className = "",
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ pickup?: L.Marker; delivery?: L.Marker; rider?: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(
      [pickup.lat, pickup.lng],
      12
    );

    // Add OpenStreetMap tiles (free)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom icons
    const pickupIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background: #FF9D42; border: 3px solid white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    const deliveryIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background: #10B981; border: 3px solid white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    const riderIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background: #3B82F6; border: 3px solid white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(0,0,0,0.4); animation: pulse 2s infinite;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1">
          <path d="M5 17h14v-2H5v2zm7-12C6.48 5 2 9.48 2 15h2c0-4.42 3.58-8 8-8s8 3.58 8 8h2c0-5.52-4.48-10-10-10z"/>
        </svg>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    // Add markers
    markersRef.current.pickup = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
      .addTo(map)
      .bindPopup("<b>Pickup Location</b>");

    markersRef.current.delivery = L.marker([delivery.lat, delivery.lng], { icon: deliveryIcon })
      .addTo(map)
      .bindPopup("<b>Delivery Location</b>");

    if (currentPosition) {
      markersRef.current.rider = L.marker([currentPosition.lat, currentPosition.lng], { icon: riderIcon })
        .addTo(map)
        .bindPopup("<b>Rider Location</b>");
    }

    // Draw route line
    const routePoints: [number, number][] = [
      [pickup.lat, pickup.lng],
      [delivery.lat, delivery.lng],
    ];

    if (currentPosition) {
      routePoints.splice(1, 0, [currentPosition.lat, currentPosition.lng]);
    }

    L.polyline(routePoints, {
      color: "#FF9D42",
      weight: 4,
      opacity: 0.7,
      dashArray: "10, 10",
    }).addTo(map);

    // Fit bounds to show all markers
    const bounds = L.latLngBounds([
      [pickup.lat, pickup.lng],
      [delivery.lat, delivery.lng],
    ]);

    if (currentPosition) {
      bounds.extend([currentPosition.lat, currentPosition.lng]);
    }

    map.fitBounds(bounds, { padding: [50, 50] });

    mapRef.current = map;

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup.lat, pickup.lng, delivery.lat, delivery.lng]);

  // Update rider position separately without re-initializing the map
  useEffect(() => {
    if (mapRef.current && currentPosition && markersRef.current.rider) {
      markersRef.current.rider.setLatLng([currentPosition.lat, currentPosition.lng]);
    } else if (mapRef.current && currentPosition && !markersRef.current.rider) {
      const riderIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background: #3B82F6; border: 3px solid white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(0,0,0,0.4);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1">
            <path d="M5 17h14v-2H5v2zm7-12C6.48 5 2 9.48 2 15h2c0-4.42 3.58-8 8-8s8 3.58 8 8h2c0-5.52-4.48-10-10-10z"/>
          </svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
      
      markersRef.current.rider = L.marker([currentPosition.lat, currentPosition.lng], { icon: riderIcon })
        .addTo(mapRef.current)
        .bindPopup("<b>Rider Location</b>");
    }
  }, [currentPosition]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-full rounded-xl overflow-hidden ${className}`}
      style={{ minHeight: "300px" }}
    />
  );
});

export default Map;
