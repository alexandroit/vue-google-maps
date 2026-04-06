import { computed, inject, shallowRef } from 'vue-demi';
import { GOOGLE_MAPS_API_CONTEXT_KEY, GOOGLE_MAP_CONTEXT_KEY } from './internal';

export function useGoogleMapsApi() {
  const context = inject(GOOGLE_MAPS_API_CONTEXT_KEY, null);

  if (!context) {
    throw new Error('useGoogleMapsApi() must be called inside <GoogleMapsProvider>.');
  }

  return context;
}

export function useGoogleMap() {
  const context = inject(GOOGLE_MAP_CONTEXT_KEY, null);

  if (!context) {
    throw new Error('useGoogleMap() must be called inside <GoogleMap>.');
  }

  return context;
}

export function useMapGeocoder() {
  const { google, isLoaded } = useGoogleMapsApi();
  const geocoder = shallowRef<google.maps.Geocoder | null>(null);

  const getGeocoder = () => {
    if (!isLoaded.value || !google.value) {
      return null;
    }

    if (!geocoder.value) {
      geocoder.value = new google.value.maps.Geocoder();
    }

    return geocoder.value;
  };

  return computed(() => getGeocoder());
}

export function useDirectionsService() {
  const { google, isLoaded } = useGoogleMapsApi();
  const service = shallowRef<google.maps.DirectionsService | null>(null);

  const getDirectionsService = () => {
    if (!isLoaded.value || !google.value) {
      return null;
    }

    if (!service.value) {
      service.value = new google.value.maps.DirectionsService();
    }

    return service.value;
  };

  return computed(() => getDirectionsService());
}
