import type { VNode } from 'vue-demi';

export type LatLngLike =
  | google.maps.LatLng
  | google.maps.LatLngLiteral
  | {
      lat: number;
      lng: number;
    };

export const HIDDEN_SLOT_STYLE = {
  position: 'absolute',
  left: '-99999px',
  top: '-99999px',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  pointerEvents: 'none',
  opacity: '0'
} as const;

export function removeUndefined<T extends object>(value: T) {
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([, entry]) => entry !== undefined)) as Partial<T>;
}

export function composeMapOptions(
  options: google.maps.MapOptions | undefined,
  overrides: Partial<google.maps.MapOptions> = {}
) {
  return removeUndefined({
    ...(options || {}),
    ...overrides
  }) as google.maps.MapOptions;
}

export function toLatLng(value: LatLngLike | undefined, googleApi?: typeof google | null) {
  if (!value) {
    return undefined;
  }

  if (typeof (value as google.maps.LatLng).lat === 'function') {
    return value as google.maps.LatLng;
  }

  if (!googleApi?.maps) {
    return value as google.maps.LatLngLiteral;
  }

  return new googleApi.maps.LatLng((value as google.maps.LatLngLiteral).lat, (value as google.maps.LatLngLiteral).lng);
}

export function bindGoogleMapsEvents(
  googleApi: typeof google,
  instance: object,
  handlers: Record<string, ((...args: any[]) => void) | undefined>
) {
  const listeners = Object.entries(handlers)
    .filter(([, handler]) => typeof handler === 'function')
    .map(([eventName, handler]) => googleApi.maps.event.addListener(instance as any, eventName, (...args: any[]) => handler?.(...args)));

  return () => {
    listeners.forEach((listener) => listener.remove());
  };
}

export function clearGoogleMapsInstanceListeners(googleApi: typeof google, instance: object | null | undefined) {
  if (instance) {
    googleApi.maps.event.clearInstanceListeners(instance as any);
  }
}

export function slotNodes(slot: (() => VNode[]) | VNode[] | undefined) {
  if (!slot) {
    return [] as VNode[];
  }

  if (typeof slot === 'function') {
    return slot();
  }

  return Array.isArray(slot) ? slot : [slot];
}

export function toHeatmapData(
  googleApi: typeof google,
  data: Array<LatLngLike | google.maps.visualization.WeightedLocation>
) {
  return data.map((entry) => {
    if ('location' in (entry as google.maps.visualization.WeightedLocation)) {
      const weighted = entry as google.maps.visualization.WeightedLocation;
      return {
        ...weighted,
        location: toLatLng(weighted.location as LatLngLike, googleApi) as google.maps.LatLng
      };
    }
    return toLatLng(entry as LatLngLike, googleApi) as google.maps.LatLng;
  });
}

export function isSamePosition(
  current: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined,
  next: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined
) {
  if (!current || !next) {
    return false;
  }

  const currentLat = typeof (current as google.maps.LatLng).lat === 'function' ? (current as google.maps.LatLng).lat() : current.lat;
  const currentLng = typeof (current as google.maps.LatLng).lng === 'function' ? (current as google.maps.LatLng).lng() : current.lng;
  const nextLat = typeof (next as google.maps.LatLng).lat === 'function' ? (next as google.maps.LatLng).lat() : next.lat;
  const nextLng = typeof (next as google.maps.LatLng).lng === 'function' ? (next as google.maps.LatLng).lng() : next.lng;

  return currentLat === nextLat && currentLng === nextLng;
}
