import type { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { ComputedRef, InjectionKey, ShallowRef } from 'vue-demi';
import type { GoogleMapsApiLoadOptions } from './loadGoogleMapsApi';

export type GoogleMapsStatus = 'idle' | 'loading' | 'loaded' | 'error';
export type MarkerLike = google.maps.Marker | google.maps.marker.AdvancedMarkerElement;

export type GoogleMapsApiContextValue = {
  status: ShallowRef<GoogleMapsStatus>;
  error: ShallowRef<Error | null>;
  google: ShallowRef<typeof google | null>;
  isLoaded: ComputedRef<boolean>;
  loaderOptions: ShallowRef<GoogleMapsApiLoadOptions>;
  reload: () => Promise<typeof google | null>;
};

export type GoogleMapContextValue = {
  map: ShallowRef<google.maps.Map | null>;
  google: ShallowRef<typeof google | null>;
  isLoaded: ComputedRef<boolean>;
};

export type MarkerAnchorContextValue = {
  marker: ShallowRef<MarkerLike | null>;
};

export type MarkerClustererContextValue = {
  clusterer: ShallowRef<MarkerClusterer | null>;
  registerMarker: (marker: MarkerLike) => void;
  unregisterMarker: (marker: MarkerLike) => void;
};

export const GOOGLE_MAPS_API_CONTEXT_KEY = Symbol('revivejs-google-maps-api') as InjectionKey<GoogleMapsApiContextValue>;
export const GOOGLE_MAP_CONTEXT_KEY = Symbol('revivejs-google-map') as InjectionKey<GoogleMapContextValue>;
export const MARKER_ANCHOR_CONTEXT_KEY = Symbol('revivejs-google-map-anchor') as InjectionKey<MarkerAnchorContextValue>;
export const MARKER_CLUSTERER_CONTEXT_KEY = Symbol(
  'revivejs-google-map-clusterer'
) as InjectionKey<MarkerClustererContextValue>;
