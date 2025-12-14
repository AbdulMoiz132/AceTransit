// Distance and location utilities

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  address: string;
  coordinates?: Coordinates;
  city?: string;
  area?: string;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

/**
 * Geocode an address using Nominatim API (free, no API key required)
 * Returns coordinates for the address
 */
export async function geocodeAddress(
  address: string,
  city: string = "Pakistan"
): Promise<Coordinates | null> {
  try {
    const query = encodeURIComponent(`${address}, ${city}`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
      {
        headers: {
          "User-Agent": "AceTransit-Courier-App",
        },
      }
    );

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to get address using Nominatim API
 * Returns address details for the coordinates
 */
export async function reverseGeocode(
  coordinates: Coordinates
): Promise<{ address: string; city: string } | null> {
  try {
    // Use zoom=18 for building-level detail and addressdetails=1 for full breakdown
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&zoom=18&addressdetails=1&extratags=1`,
      {
        headers: {
          "User-Agent": "AceTransit-Courier-App",
        },
      }
    );

    const data = await response.json();

    if (data) {
      const addr = data.address || {};
      
      // Try to extract the most specific location name from display_name
      // display_name format: "Specific Place, Road, Area, City, Region, Country"
      let specificLocation = "";
      if (data.display_name) {
        const parts = data.display_name.split(",").map((p: string) => p.trim());
        // Take first 3-4 most specific parts
        specificLocation = parts.slice(0, Math.min(4, parts.length)).join(", ");
      }
      
      // Build a detailed, readable address prioritizing specific locations
      const addressParts = [
        // Specific building/amenity names (hostels, universities, etc.)
        addr.amenity,
        addr.building,
        addr.university,
        addr.college,
        addr.tourism,
        addr.leisure,
        // Street address
        addr.house_number,
        addr.road || addr.street,
        // Area information
        addr.neighbourhood || addr.suburb || addr.quarter || addr.hamlet,
        addr.city_district,
      ].filter(Boolean);

      // If we have specific parts, use them; otherwise use the specific location from display_name
      const finalAddress = addressParts.length > 0 
        ? addressParts.join(", ") 
        : specificLocation || data.display_name;

      return {
        address: finalAddress,
        city: addr.city || addr.town || addr.village || addr.municipality || addr.state || "Islamabad",
      };
    }

    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

/**
 * Fee structure for Pakistan based on distance tiers
 */
export interface FeeStructure {
  baseCharge: number;
  perKmCharge: number;
  pickupCharge: number;
  minCharge: number;
  estimatedTime: string;
}

export function getFeeStructure(distanceKm: number): FeeStructure {
  // Fee tiers for Pakistan (amounts in PKR)
  if (distanceKm <= 5) {
    // City delivery
    return {
      baseCharge: 150,
      perKmCharge: 20,
      pickupCharge: 50,
      minCharge: 200,
      estimatedTime: "30-60 mins",
    };
  } else if (distanceKm <= 10) {
    // Extended city
    return {
      baseCharge: 200,
      perKmCharge: 25,
      pickupCharge: 50,
      minCharge: 300,
      estimatedTime: "1-2 hours",
    };
  } else if (distanceKm <= 25) {
    // Nearby city
    return {
      baseCharge: 350,
      perKmCharge: 30,
      pickupCharge: 75,
      minCharge: 500,
      estimatedTime: "2-3 hours",
    };
  } else if (distanceKm <= 50) {
    // Intercity short
    return {
      baseCharge: 600,
      perKmCharge: 35,
      pickupCharge: 100,
      minCharge: 800,
      estimatedTime: "3-5 hours",
    };
  } else if (distanceKm <= 100) {
    // Intercity medium
    return {
      baseCharge: 1000,
      perKmCharge: 40,
      pickupCharge: 150,
      minCharge: 1500,
      estimatedTime: "5-8 hours",
    };
  } else {
    // Long distance
    return {
      baseCharge: 1500,
      perKmCharge: 45,
      pickupCharge: 200,
      minCharge: 2500,
      estimatedTime: "1-2 days",
    };
  }
}

/**
 * Calculate total delivery fee including all charges
 */
export function calculateDeliveryFee(
  distanceKm: number,
  serviceType: "standard" | "express" | "fast-track" = "standard"
): {
  baseCharge: number;
  distanceCharge: number;
  pickupCharge: number;
  serviceMultiplier: number;
  subtotal: number;
  gst: number;
  total: number;
  estimatedTime: string;
} {
  const structure = getFeeStructure(distanceKm);

  // Service type multipliers
  const multipliers = {
    standard: 1.0,
    express: 1.5,
    "fast-track": 2.0,
  };

  const serviceMultiplier = multipliers[serviceType];

  // Calculate base charges
  const baseCharge = structure.baseCharge;
  const distanceCharge = distanceKm * structure.perKmCharge;
  const pickupCharge = structure.pickupCharge;

  // Calculate subtotal with service multiplier
  const subtotal = Math.max(
    (baseCharge + distanceCharge) * serviceMultiplier + pickupCharge,
    structure.minCharge
  );

  // Add 5% GST
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  return {
    baseCharge,
    distanceCharge: Math.round(distanceCharge),
    pickupCharge,
    serviceMultiplier,
    subtotal: Math.round(subtotal),
    gst,
    total: Math.round(total),
    estimatedTime: structure.estimatedTime,
  };
}

/**
 * Major cities in Pakistan with their coordinates (for quick lookup)
 */
export const PAKISTAN_CITIES: Record<string, Coordinates> = {
  Karachi: { lat: 24.8607, lng: 67.0011 },
  Lahore: { lat: 31.5204, lng: 74.3587 },
  Islamabad: { lat: 33.6844, lng: 73.0479 },
  Rawalpindi: { lat: 33.5651, lng: 73.0169 },
  Faisalabad: { lat: 31.4504, lng: 73.135 },
  Multan: { lat: 30.1575, lng: 71.5249 },
  Peshawar: { lat: 34.0151, lng: 71.5249 },
  Quetta: { lat: 30.1798, lng: 66.9750 },
  Sialkot: { lat: 32.4945, lng: 74.5229 },
  Gujranwala: { lat: 32.1877, lng: 74.1945 },
};

/**
 * Get coordinates for a major city or geocode the address
 */
export async function getCoordinates(
  address: string,
  city?: string
): Promise<Coordinates | null> {
  // Check if it's a major city
  if (city && PAKISTAN_CITIES[city]) {
    return PAKISTAN_CITIES[city];
  }

  // Otherwise, geocode the full address
  return geocodeAddress(address, city);
}
