import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('GOOGLE_MAPS_API_KEY is not set in environment variables');
}

interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
  place_id: string;
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  photos?: Array<{
    photo_reference: string;
  }>;
}

/**
 * Geocode an address to get coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status !== 'OK' || !response.data.results.length) {
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }

    const result = response.data.results[0];
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formatted_address: result.formatted_address,
      place_id: result.place_id,
    };
  } catch (error: any) {
    throw new Error(`Geocoding error: ${error.message}`);
  }
}

/**
 * Validate address using Google Places Autocomplete
 */
export async function validateAddress(address: string): Promise<boolean> {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
      params: {
        input: address,
        key: GOOGLE_MAPS_API_KEY,
        types: 'establishment',
      },
    });

    return response.data.status === 'OK' && response.data.predictions.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Get place details from Google Places API
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        key: GOOGLE_MAPS_API_KEY,
        fields: 'place_id,name,formatted_address,geometry,formatted_phone_number,international_phone_number,website,photos',
      },
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Place details failed: ${response.data.status}`);
    }

    return response.data.result;
  } catch (error: any) {
    throw new Error(`Place details error: ${error.message}`);
  }
}

/**
 * Search for nearby clinics using Google Places API
 */
export async function searchNearbyClinics(
  lat: number,
  lng: number,
  radius: number = 5000
): Promise<PlaceDetails[]> {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${lat},${lng}`,
        radius,
        type: 'doctor|hospital|pharmacy|dentist',
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Nearby search failed: ${response.data.status}`);
    }

    const places = response.data.results || [];
    
    // Get detailed information for each place
    const detailedPlaces = await Promise.all(
      places.slice(0, 20).map(async (place: any) => {
        try {
          return await getPlaceDetails(place.place_id);
        } catch (error) {
          // Fallback to basic info if details fail
          return {
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.vicinity || place.formatted_address,
            geometry: place.geometry,
          };
        }
      })
    );

    return detailedPlaces;
  } catch (error: any) {
    throw new Error(`Nearby search error: ${error.message}`);
  }
}

/**
 * Get photo URL from Google Places
 */
export function getPlacePhotoUrl(photoReference: string, maxWidth: number = 400): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
}


