import { MarkerClusterer, type Algorithm, type Cluster, type Renderer } from '@googlemaps/markerclusterer';
import { defineComponent, h, inject, onBeforeUnmount, provide, ref, shallowRef, watch, type PropType } from 'vue-demi';
import {
  MARKER_ANCHOR_CONTEXT_KEY,
  MARKER_CLUSTERER_CONTEXT_KEY,
  type MarkerLike
} from './internal';
import { useGoogleMap } from './hooks';
import { bindGoogleMapsEvents, clearGoogleMapsInstanceListeners, HIDDEN_SLOT_STYLE, removeUndefined, slotNodes, toLatLng, type LatLngLike } from './utils';

export type MapMarkerClustererProps = {
  algorithm?: Algorithm;
  renderer?: Renderer;
};

export const MapMarker = defineComponent({
  name: 'MapMarker',
  props: {
    position: {
      type: Object as PropType<LatLngLike>,
      required: true
    },
    title: String,
    label: [String, Object] as PropType<string | google.maps.MarkerLabel>,
    clickable: Boolean,
    draggable: Boolean,
    icon: [String, Object] as PropType<string | google.maps.Icon | google.maps.Symbol>,
    visible: Boolean,
    zIndex: Number,
    animation: Number as PropType<google.maps.Animation>,
    options: Object as PropType<google.maps.MarkerOptions>
  },
  emits: [
    'load',
    'unmount',
    'click',
    'dblclick',
    'drag',
    'dragend',
    'dragstart',
    'mousedown',
    'mouseout',
    'mouseover',
    'mouseup',
    'rightclick'
  ],
  setup(props, { slots, emit, expose }) {
    const { google, map, isLoaded } = useGoogleMap();
    const clustererContext = inject(MARKER_CLUSTERER_CONTEXT_KEY, null);
    const marker = shallowRef<google.maps.Marker | null>(null);
    let stopEvents: (() => void) | null = null;

    const attachMarker = () => {
      if (!isLoaded.value || !google.value || !map.value || marker.value) {
        return;
      }

      const nextMarker = new google.value.maps.Marker({
        ...removeUndefined({
          ...props.options,
          title: props.title,
          label: props.label,
          clickable: props.clickable,
          draggable: props.draggable,
          icon: props.icon,
          visible: props.visible,
          zIndex: props.zIndex,
          animation: props.animation
        }),
        position: toLatLng(props.position, google.value),
        map: clustererContext ? null : map.value
      });

      marker.value = nextMarker;

      stopEvents = bindGoogleMapsEvents(google.value, nextMarker, {
        click: (...args) => emit('click', ...args),
        dblclick: (...args) => emit('dblclick', ...args),
        drag: (...args) => emit('drag', ...args),
        dragend: (...args) => emit('dragend', ...args),
        dragstart: (...args) => emit('dragstart', ...args),
        mousedown: (...args) => emit('mousedown', ...args),
        mouseout: (...args) => emit('mouseout', ...args),
        mouseover: (...args) => emit('mouseover', ...args),
        mouseup: (...args) => emit('mouseup', ...args),
        rightclick: (...args) => emit('rightclick', ...args)
      });

      clustererContext?.registerMarker(nextMarker);
      emit('load', nextMarker);
    };

    const detachMarker = () => {
      if (!google.value || !marker.value) {
        return;
      }

      clustererContext?.unregisterMarker(marker.value);
      marker.value.setMap(null);
      stopEvents?.();
      stopEvents = null;
      clearGoogleMapsInstanceListeners(google.value, marker.value);
      emit('unmount', marker.value);
      marker.value = null;
    };

    watch([isLoaded, () => map.value], attachMarker, { immediate: true });

    watch(
      () => props.position,
      (nextPosition) => {
        if (marker.value && google.value && nextPosition) {
          marker.value.setPosition(toLatLng(nextPosition, google.value));
        }
      },
      { deep: true }
    );

    watch(
      () => props.options,
      (nextOptions) => {
        marker.value?.setOptions({
          ...removeUndefined(nextOptions || {}),
          title: props.title,
          label: props.label,
          clickable: props.clickable,
          draggable: props.draggable,
          icon: props.icon,
          visible: props.visible,
          zIndex: props.zIndex,
          animation: props.animation
        });
      },
      { deep: true }
    );

    onBeforeUnmount(detachMarker);

    provide(MARKER_ANCHOR_CONTEXT_KEY, {
      marker: marker as any
    });

    expose?.({
      marker,
      setAnimation: (value: google.maps.Animation | null) => marker.value?.setAnimation(value),
      setOptions: (value: google.maps.MarkerOptions) => marker.value?.setOptions(value),
      setPosition: (value: google.maps.LatLng | google.maps.LatLngLiteral) => marker.value?.setPosition(value),
      setTitle: (value: string) => marker.value?.setTitle(value),
      setVisible: (value: boolean) => marker.value?.setVisible(value),
      setZIndex: (value: number) => marker.value?.setZIndex(value)
    });

    return () => h('div', { style: HIDDEN_SLOT_STYLE }, slotNodes(slots.default));
  }
});

export const MapAdvancedMarker = defineComponent({
  name: 'MapAdvancedMarker',
  props: {
    position: {
      type: Object as PropType<LatLngLike>,
      required: true
    },
    title: String,
    zIndex: Number,
    gmpClickable: Boolean,
    gmpDraggable: Boolean,
    collisionBehavior: Number as unknown as PropType<google.maps.CollisionBehavior>,
    options: Object as PropType<google.maps.marker.AdvancedMarkerElementOptions>
  },
  emits: ['load', 'unmount', 'click', 'dragstart', 'drag', 'dragend'],
  setup(props, { slots, emit, expose }) {
    const { google, map, isLoaded } = useGoogleMap();
    const clustererContext = inject(MARKER_CLUSTERER_CONTEXT_KEY, null);
    const marker = shallowRef<google.maps.marker.AdvancedMarkerElement | null>(null);
    const contentRef = ref<HTMLElement | null>(null);
    let stopEvents: (() => void) | null = null;

    const attachMarker = () => {
      if (!isLoaded.value || !google.value || !map.value || marker.value || !google.value.maps.marker?.AdvancedMarkerElement) {
        return;
      }

      const nextMarker = new google.value.maps.marker.AdvancedMarkerElement({
        ...removeUndefined({
          ...props.options,
          title: props.title,
          zIndex: props.zIndex,
          gmpClickable: props.gmpClickable,
          gmpDraggable: props.gmpDraggable,
          collisionBehavior: props.collisionBehavior
        }),
        position: toLatLng(props.position, google.value),
        map: clustererContext ? undefined : map.value,
        content: contentRef.value || undefined
      });

      marker.value = nextMarker;

      stopEvents = bindGoogleMapsEvents(google.value, nextMarker, {
        click: (...args) => emit('click', ...args),
        dragstart: (...args) => emit('dragstart', ...args),
        drag: (...args) => emit('drag', ...args),
        dragend: (...args) => emit('dragend', ...args)
      });

      clustererContext?.registerMarker(nextMarker);
      emit('load', nextMarker);
    };

    const detachMarker = () => {
      if (!google.value || !marker.value) {
        return;
      }

      clustererContext?.unregisterMarker(marker.value);
      marker.value.map = null;
      stopEvents?.();
      stopEvents = null;
      clearGoogleMapsInstanceListeners(google.value, marker.value);
      emit('unmount', marker.value);
      marker.value = null;
    };

    watch([isLoaded, () => map.value, contentRef], attachMarker, { immediate: true });

    watch(
      () => props.position,
      (nextPosition) => {
        if (marker.value && google.value && nextPosition) {
          marker.value.position = toLatLng(nextPosition, google.value) as google.maps.LatLng;
        }
      },
      { deep: true }
    );

    watch(
      () => props.options,
      (nextOptions) => {
        if (marker.value) {
          Object.assign(marker.value, removeUndefined(nextOptions || {}));
        }
      },
      { deep: true }
    );

    onBeforeUnmount(detachMarker);

    provide(MARKER_ANCHOR_CONTEXT_KEY, {
      marker: marker as any
    });

    expose?.({
      marker,
      content: contentRef,
      setMap: (value: google.maps.Map | null) => {
        if (marker.value) {
          marker.value.map = value;
        }
      },
      setPosition: (value: google.maps.LatLng | google.maps.LatLngLiteral) => {
        if (marker.value) {
          marker.value.position = value;
        }
      },
      setZIndex: (value: number) => {
        if (marker.value) {
          marker.value.zIndex = value;
        }
      }
    });

    return () =>
      h('div', { style: HIDDEN_SLOT_STYLE }, [
        h('div', { ref: contentRef }, slotNodes(slots.content)),
        ...slotNodes(slots.default)
      ]);
  }
});

export const MapInfoWindow = defineComponent({
  name: 'MapInfoWindow',
  props: {
    anchor: Object as PropType<MarkerLike | null>,
    open: {
      type: Boolean,
      default: true
    },
    position: Object as PropType<LatLngLike>,
    zIndex: Number,
    content: String,
    options: Object as PropType<google.maps.InfoWindowOptions>
  },
  emits: ['load', 'unmount', 'closeclick', 'domready', 'content-changed', 'position-changed', 'zindex-changed'],
  setup(props, { slots, emit, expose }) {
    const { google, map, isLoaded } = useGoogleMap();
    const anchorContext = inject(MARKER_ANCHOR_CONTEXT_KEY, null);
    const infoWindow = shallowRef<google.maps.InfoWindow | null>(null);
    const contentRef = ref<HTMLElement | null>(null);
    let stopEvents: (() => void) | null = null;

    const resolveAnchor = () => props.anchor || anchorContext?.marker.value || undefined;

    const createInfoWindow = () => {
      if (!isLoaded.value || !google.value || !map.value || infoWindow.value) {
        return;
      }

      const nextInfoWindow = new google.value.maps.InfoWindow({
        ...removeUndefined(props.options || {}),
        position: props.position ? toLatLng(props.position, google.value) : undefined,
        zIndex: props.zIndex,
        content: props.content || contentRef.value || undefined
      });

      infoWindow.value = nextInfoWindow;

      stopEvents = bindGoogleMapsEvents(google.value, nextInfoWindow, {
        closeclick: () => emit('closeclick'),
        domready: () => emit('domready'),
        content_changed: () => emit('content-changed'),
        position_changed: () => emit('position-changed'),
        zindex_changed: () => emit('zindex-changed')
      });

      if (props.open !== false) {
        nextInfoWindow.open({
          map: map.value,
          anchor: resolveAnchor()
        });
      }

      emit('load', nextInfoWindow);
    };

    const destroyInfoWindow = () => {
      if (!google.value || !infoWindow.value) {
        return;
      }

      infoWindow.value.close();
      stopEvents?.();
      stopEvents = null;
      clearGoogleMapsInstanceListeners(google.value, infoWindow.value);
      emit('unmount', infoWindow.value);
      infoWindow.value = null;
    };

    watch([isLoaded, () => map.value, contentRef], createInfoWindow, { immediate: true });

    watch(
      () => props.open,
      (isOpen) => {
        if (!infoWindow.value || !map.value) {
          return;
        }

        if (isOpen) {
          infoWindow.value.open({
            map: map.value,
            anchor: resolveAnchor()
          });
        } else {
          infoWindow.value.close();
        }
      }
    );

    watch(
      () => props.position,
      (nextPosition) => {
        if (infoWindow.value && google.value && nextPosition) {
          infoWindow.value.setPosition(toLatLng(nextPosition, google.value));
        }
      },
      { deep: true }
    );

    onBeforeUnmount(destroyInfoWindow);

    expose?.({
      infoWindow,
      open: (anchor?: MarkerLike | null) => {
        if (infoWindow.value && map.value) {
          infoWindow.value.open({ map: map.value, anchor: anchor || resolveAnchor() });
        }
      },
      close: () => infoWindow.value?.close()
    });

    return () => h('div', { style: HIDDEN_SLOT_STYLE }, [h('div', { ref: contentRef }, slotNodes(slots.default))]);
  }
});

export const MapMarkerClusterer = defineComponent({
  name: 'MapMarkerClusterer',
  props: {
    algorithm: Object as PropType<Algorithm>,
    renderer: Object as PropType<Renderer>
  },
  emits: ['load', 'unmount', 'cluster-click'],
  setup(props, { slots, emit, expose }) {
    const { google, map, isLoaded } = useGoogleMap();
    const clusterer = shallowRef<MarkerClusterer | null>(null);
    const markers = new Set<MarkerLike>();

    const registerMarker = (marker: MarkerLike) => {
      markers.add(marker);
      clusterer.value?.addMarker(marker, true);
      clusterer.value?.render();
    };

    const unregisterMarker = (marker: MarkerLike) => {
      markers.delete(marker);
      clusterer.value?.removeMarker(marker, true);
      clusterer.value?.render();
    };

    const createClusterer = () => {
      if (!isLoaded.value || !google.value || !map.value || clusterer.value) {
        return;
      }

      const nextClusterer = new MarkerClusterer({
        map: map.value,
        algorithm: props.algorithm,
        renderer: props.renderer,
        onClusterClick: (event, cluster, clusterMap) => emit('cluster-click', event, cluster as Cluster, clusterMap)
      });

      clusterer.value = nextClusterer;
      emit('load', nextClusterer);

      if (markers.size) {
        nextClusterer.addMarkers(Array.from(markers), true);
        nextClusterer.render();
      }
    };

    watch([isLoaded, () => map.value], createClusterer, { immediate: true });

    onBeforeUnmount(() => {
      if (clusterer.value) {
        clusterer.value.clearMarkers(true);
        emit('unmount', clusterer.value);
        clusterer.value = null;
      }
    });

    provide(MARKER_CLUSTERER_CONTEXT_KEY, {
      clusterer,
      registerMarker,
      unregisterMarker
    });

    expose?.({
      clusterer,
      addMarker: (marker: MarkerLike, noDraw?: boolean) => clusterer.value?.addMarker(marker, noDraw),
      addMarkers: (nextMarkers: MarkerLike[], noDraw?: boolean) => clusterer.value?.addMarkers(nextMarkers, noDraw),
      removeMarker: (marker: MarkerLike, noDraw?: boolean) => clusterer.value?.removeMarker(marker, noDraw),
      clearMarkers: (noDraw?: boolean) => clusterer.value?.clearMarkers(noDraw),
      render: () => clusterer.value?.render()
    });

    return () => h('div', { style: HIDDEN_SLOT_STYLE }, slotNodes(slots.default));
  }
});
