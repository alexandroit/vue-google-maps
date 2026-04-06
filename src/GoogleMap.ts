import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  provide,
  ref,
  shallowRef,
  watch,
  type CSSProperties,
  type PropType
} from 'vue-demi';
import { GOOGLE_MAP_CONTEXT_KEY } from './internal';
import { useGoogleMapsApi } from './hooks';
import { bindGoogleMapsEvents, clearGoogleMapsInstanceListeners, composeMapOptions, slotNodes, toLatLng, type LatLngLike } from './utils';

export type GoogleMapHandle = {
  map: google.maps.Map | null;
  fitBounds: (bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral) => void;
  panBy: (x: number, y: number) => void;
  panTo: (position: google.maps.LatLng | google.maps.LatLngLiteral) => void;
  panToBounds: (
    bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral,
    padding?: number | google.maps.Padding
  ) => void;
  setZoom: (zoom: number) => void;
  setCenter: (position: google.maps.LatLng | google.maps.LatLngLiteral) => void;
  setOptions: (options: google.maps.MapOptions) => void;
  getBounds: () => google.maps.LatLngBounds | null;
  getCenter: () => google.maps.LatLng | undefined;
  getZoom: () => number | undefined;
};

const DEFAULT_CENTER = { lat: 37.421995, lng: -122.084092 };
const DEFAULT_ZOOM = 13;

export const GoogleMap = defineComponent({
  name: 'GoogleMap',
  props: {
    center: {
      type: Object as PropType<LatLngLike>,
      default: () => DEFAULT_CENTER
    },
    zoom: {
      type: Number,
      default: DEFAULT_ZOOM
    },
    mapId: String,
    options: Object as PropType<google.maps.MapOptions>,
    width: {
      type: [String, Number] as PropType<CSSProperties['width']>,
      default: '100%'
    },
    height: {
      type: [String, Number] as PropType<CSSProperties['height']>,
      default: 460
    },
    loadingText: {
      type: String,
      default: 'Loading map…'
    },
    errorText: {
      type: String,
      default: 'Google Maps failed to load.'
    }
  },
  emits: [
    'map-load',
    'map-unmount',
    'click',
    'dblclick',
    'drag',
    'dragstart',
    'dragend',
    'idle',
    'bounds-changed',
    'center-changed',
    'heading-changed',
    'map-type-id-changed',
    'mousemove',
    'mouseout',
    'mouseover',
    'projection-changed',
    'rightclick',
    'tiles-loaded',
    'tilt-changed',
    'zoom-changed'
  ],
  setup(props, { slots, emit, attrs, expose }) {
    const { isLoaded, status, error, google: googleApi } = useGoogleMapsApi();
    const containerRef = ref<HTMLElement | null>(null);
    const map = shallowRef<google.maps.Map | null>(null);
    let stopMapEvents: (() => void) | null = null;

    const createMap = () => {
      if (!isLoaded.value || !googleApi.value || !containerRef.value || map.value) {
        return;
      }

      const nextMap = new googleApi.value.maps.Map(
        containerRef.value,
        composeMapOptions(props.options, {
          center: props.center,
          zoom: props.zoom,
          mapId: props.mapId
        })
      );

      map.value = nextMap;

      stopMapEvents = bindGoogleMapsEvents(googleApi.value, nextMap, {
        click: (...args) => emit('click', ...args),
        dblclick: (...args) => emit('dblclick', ...args),
        drag: () => emit('drag'),
        dragstart: () => emit('dragstart'),
        dragend: () => emit('dragend'),
        idle: () => emit('idle'),
        bounds_changed: () => emit('bounds-changed'),
        center_changed: () => emit('center-changed'),
        heading_changed: () => emit('heading-changed'),
        maptypeid_changed: () => emit('map-type-id-changed'),
        mousemove: (...args) => emit('mousemove', ...args),
        mouseout: (...args) => emit('mouseout', ...args),
        mouseover: (...args) => emit('mouseover', ...args),
        projection_changed: () => emit('projection-changed'),
        rightclick: (...args) => emit('rightclick', ...args),
        tilesloaded: () => emit('tiles-loaded'),
        tilt_changed: () => emit('tilt-changed'),
        zoom_changed: () => emit('zoom-changed')
      });

      emit('map-load', nextMap);
    };

    const destroyMap = () => {
      if (!googleApi.value || !map.value) {
        return;
      }

      stopMapEvents?.();
      stopMapEvents = null;
      clearGoogleMapsInstanceListeners(googleApi.value, map.value);
      emit('map-unmount', map.value);
      map.value = null;
    };

    watch([isLoaded, containerRef], createMap, { immediate: true });

    watch(
      () => props.options,
      (nextOptions) => {
        if (map.value) {
          map.value.setOptions(
            composeMapOptions(nextOptions, {
              center: props.center,
              zoom: props.zoom
            })
          );
        }
      },
      { deep: true }
    );

    watch(
      () => props.center,
      (nextCenter) => {
        if (!map.value || !nextCenter) {
          return;
        }

        const center = toLatLng(nextCenter, googleApi.value);
        if (center) {
          map.value.setCenter(center);
        }
      },
      { deep: true }
    );

    watch(
      () => props.zoom,
      (nextZoom) => {
        if (map.value && nextZoom !== undefined && map.value.getZoom() !== nextZoom) {
          map.value.setZoom(nextZoom);
        }
      }
    );

    watch(
      () => props.mapId,
      (nextMapId) => {
        if (map.value && nextMapId) {
          map.value.setOptions({ mapId: nextMapId });
        }
      }
    );

    onBeforeUnmount(destroyMap);

    provide(GOOGLE_MAP_CONTEXT_KEY, {
      map,
      google: googleApi,
      isLoaded
    });

    expose?.({
      get map() {
        return map.value;
      },
      fitBounds: (bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral) => map.value?.fitBounds(bounds),
      panBy: (x: number, y: number) => map.value?.panBy(x, y),
      panTo: (position: google.maps.LatLng | google.maps.LatLngLiteral) => map.value?.panTo(position),
      panToBounds: (
        bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral,
        padding?: number | google.maps.Padding
      ) => map.value?.panToBounds(bounds, padding),
      setZoom: (zoom: number) => map.value?.setZoom(zoom),
      setCenter: (position: google.maps.LatLng | google.maps.LatLngLiteral) => map.value?.setCenter(position),
      setOptions: (nextOptions: google.maps.MapOptions) => map.value?.setOptions(nextOptions),
      getBounds: () => map.value?.getBounds() || null,
      getCenter: () => map.value?.getCenter(),
      getZoom: () => map.value?.getZoom()
    } as GoogleMapHandle);

    const shellStyle = computed(() => ({
      position: 'relative',
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      height: typeof props.height === 'number' ? `${props.height}px` : props.height
    }));

    return () =>
      h(
        'div',
        {
          class: ['revivejs-google-map-shell', attrs.class],
          style: [shellStyle.value, attrs.style as Record<string, string> | undefined]
        },
        [
          h('div', {
            ref: containerRef,
            class: 'revivejs-google-map-surface',
            style: {
              width: '100%',
              height: '100%'
            }
          }),
          !isLoaded.value && status.value === 'loading'
            ? h(
                'div',
                {
                  class: 'revivejs-google-map-overlay',
                  style: {
                    position: 'absolute',
                    inset: '0',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(255,255,255,0.92)',
                    color: '#17324d',
                    font: '600 14px/1.4 Georgia, serif'
                  }
                },
                props.loadingText
              )
            : null,
          status.value === 'error'
            ? h(
                'div',
                {
                  class: 'revivejs-google-map-overlay',
                  style: {
                    position: 'absolute',
                    inset: '0',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(255,255,255,0.92)',
                    color: '#8a1f11',
                    font: '600 14px/1.4 Georgia, serif',
                    textAlign: 'center',
                    padding: '24px'
                  }
                },
                error.value?.message || props.errorText
              )
            : null,
          ...slotNodes(slots.default)
        ]
      );
  }
});
