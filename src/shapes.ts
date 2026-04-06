import { defineComponent, h, onBeforeUnmount, ref, shallowRef, watch, type PropType } from 'vue-demi';
import { useGoogleMap } from './hooks';
import { bindGoogleMapsEvents, clearGoogleMapsInstanceListeners, HIDDEN_SLOT_STYLE, removeUndefined, slotNodes, toLatLng, type LatLngLike } from './utils';

export const MapPolyline = defineComponent({
  name: 'MapPolyline',
  props: {
    path: {
      type: Array as PropType<LatLngLike[]>,
      required: true
    },
    options: Object as PropType<google.maps.PolylineOptions>
  },
  emits: ['load', 'unmount', 'click', 'dblclick', 'drag', 'dragend', 'dragstart', 'mousedown', 'mouseout', 'mouseover', 'mouseup', 'rightclick'],
  setup(props, { emit, expose, slots }) {
    const { google, map, isLoaded } = useGoogleMap();
    const polyline = shallowRef<google.maps.Polyline | null>(null);
    let stopEvents: (() => void) | null = null;

    const createPolyline = () => {
      if (!isLoaded.value || !google.value || !map.value || polyline.value) {
        return;
      }

      const nextPolyline = new google.value.maps.Polyline({
        ...removeUndefined(props.options || {}),
        map: map.value,
        path: props.path.map((point) => toLatLng(point, google.value) as google.maps.LatLng)
      });

      polyline.value = nextPolyline;
      stopEvents = bindGoogleMapsEvents(google.value, nextPolyline, {
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
      emit('load', nextPolyline);
    };

    watch([isLoaded, () => map.value], createPolyline, { immediate: true });
    watch(
      () => props.path,
      (nextPath) => {
        if (polyline.value && google.value) {
          polyline.value.setPath(nextPath.map((point) => toLatLng(point, google.value) as google.maps.LatLng));
        }
      },
      { deep: true }
    );
    watch(
      () => props.options,
      (nextOptions) => polyline.value?.setOptions(removeUndefined(nextOptions || {})),
      { deep: true }
    );

    onBeforeUnmount(() => {
      if (google.value && polyline.value) {
        stopEvents?.();
        clearGoogleMapsInstanceListeners(google.value, polyline.value);
        polyline.value.setMap(null);
        emit('unmount', polyline.value);
      }
    });

    expose?.({ polyline });
    return () => h('div', { style: HIDDEN_SLOT_STYLE }, slotNodes(slots.default));
  }
});

export const MapPolygon = defineComponent({
  name: 'MapPolygon',
  props: {
    paths: {
      type: Array as PropType<LatLngLike[] | LatLngLike[][]>,
      required: true
    },
    options: Object as PropType<google.maps.PolygonOptions>
  },
  emits: ['load', 'unmount', 'click', 'dblclick', 'drag', 'dragend', 'dragstart', 'mousedown', 'mouseout', 'mouseover', 'mouseup', 'rightclick'],
  setup(props, { emit, expose, slots }) {
    const { google, map, isLoaded } = useGoogleMap();
    const polygon = shallowRef<google.maps.Polygon | null>(null);
    let stopEvents: (() => void) | null = null;

    const normalizePaths = () => {
      if (!google.value) {
        return props.paths;
      }

      if (Array.isArray(props.paths[0])) {
        return (props.paths as LatLngLike[][]).map((path) => path.map((point) => toLatLng(point, google.value) as google.maps.LatLng));
      }

      return (props.paths as LatLngLike[]).map((point) => toLatLng(point, google.value) as google.maps.LatLng);
    };

    const createPolygon = () => {
      if (!isLoaded.value || !google.value || !map.value || polygon.value) {
        return;
      }

      const nextPolygon = new google.value.maps.Polygon({
        ...removeUndefined(props.options || {}),
        map: map.value,
        paths: normalizePaths()
      });

      polygon.value = nextPolygon;
      stopEvents = bindGoogleMapsEvents(google.value, nextPolygon, {
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
      emit('load', nextPolygon);
    };

    watch([isLoaded, () => map.value], createPolygon, { immediate: true });
    watch(
      () => props.paths,
      () => {
        if (polygon.value) {
          polygon.value.setPaths(normalizePaths() as any);
        }
      },
      { deep: true }
    );
    watch(
      () => props.options,
      (nextOptions) => polygon.value?.setOptions(removeUndefined(nextOptions || {})),
      { deep: true }
    );

    onBeforeUnmount(() => {
      if (google.value && polygon.value) {
        stopEvents?.();
        clearGoogleMapsInstanceListeners(google.value, polygon.value);
        polygon.value.setMap(null);
        emit('unmount', polygon.value);
      }
    });

    expose?.({ polygon });
    return () => h('div', { style: HIDDEN_SLOT_STYLE }, slotNodes(slots.default));
  }
});

export const MapRectangle = defineComponent({
  name: 'MapRectangle',
  props: {
    bounds: {
      type: Object as PropType<google.maps.LatLngBoundsLiteral>,
      required: true
    },
    options: Object as PropType<google.maps.RectangleOptions>
  },
  emits: ['load', 'unmount', 'bounds-changed', 'click', 'dblclick', 'drag', 'dragend', 'dragstart', 'mousedown', 'mouseout', 'mouseover', 'mouseup', 'rightclick'],
  setup(props, { emit, expose, slots }) {
    const { google, map, isLoaded } = useGoogleMap();
    const rectangle = shallowRef<google.maps.Rectangle | null>(null);
    let stopEvents: (() => void) | null = null;

    const createRectangle = () => {
      if (!isLoaded.value || !google.value || !map.value || rectangle.value) {
        return;
      }

      const nextRectangle = new google.value.maps.Rectangle({
        ...removeUndefined(props.options || {}),
        map: map.value,
        bounds: props.bounds
      });

      rectangle.value = nextRectangle;
      stopEvents = bindGoogleMapsEvents(google.value, nextRectangle, {
        bounds_changed: () => emit('bounds-changed'),
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
      emit('load', nextRectangle);
    };

    watch([isLoaded, () => map.value], createRectangle, { immediate: true });
    watch(
      () => props.bounds,
      (nextBounds) => rectangle.value?.setBounds(nextBounds),
      { deep: true }
    );
    watch(
      () => props.options,
      (nextOptions) => rectangle.value?.setOptions(removeUndefined(nextOptions || {})),
      { deep: true }
    );

    onBeforeUnmount(() => {
      if (google.value && rectangle.value) {
        stopEvents?.();
        clearGoogleMapsInstanceListeners(google.value, rectangle.value);
        rectangle.value.setMap(null);
        emit('unmount', rectangle.value);
      }
    });

    expose?.({ rectangle });
    return () => h('div', { style: HIDDEN_SLOT_STYLE }, slotNodes(slots.default));
  }
});

export const MapCircle = defineComponent({
  name: 'MapCircle',
  props: {
    center: {
      type: Object as PropType<LatLngLike>,
      required: true
    },
    radius: {
      type: Number,
      required: true
    },
    options: Object as PropType<google.maps.CircleOptions>
  },
  emits: ['load', 'unmount', 'center-changed', 'radius-changed', 'click', 'dblclick', 'drag', 'dragend', 'dragstart', 'mousedown', 'mouseout', 'mouseover', 'mouseup', 'rightclick'],
  setup(props, { emit, expose, slots }) {
    const { google, map, isLoaded } = useGoogleMap();
    const circle = shallowRef<google.maps.Circle | null>(null);
    let stopEvents: (() => void) | null = null;

    const createCircle = () => {
      if (!isLoaded.value || !google.value || !map.value || circle.value) {
        return;
      }

      const nextCircle = new google.value.maps.Circle({
        ...removeUndefined(props.options || {}),
        map: map.value,
        center: toLatLng(props.center, google.value),
        radius: props.radius
      });

      circle.value = nextCircle;
      stopEvents = bindGoogleMapsEvents(google.value, nextCircle, {
        center_changed: () => emit('center-changed'),
        radius_changed: () => emit('radius-changed'),
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
      emit('load', nextCircle);
    };

    watch([isLoaded, () => map.value], createCircle, { immediate: true });
    watch(
      () => props.center,
      (nextCenter) => {
        if (circle.value && google.value) {
          const center = toLatLng(nextCenter, google.value);
          if (center) {
            circle.value.setCenter(center);
          }
        }
      },
      { deep: true }
    );
    watch(() => props.radius, (nextRadius) => circle.value?.setRadius(nextRadius));
    watch(
      () => props.options,
      (nextOptions) => circle.value?.setOptions(removeUndefined(nextOptions || {})),
      { deep: true }
    );

    onBeforeUnmount(() => {
      if (google.value && circle.value) {
        stopEvents?.();
        clearGoogleMapsInstanceListeners(google.value, circle.value);
        circle.value.setMap(null);
        emit('unmount', circle.value);
      }
    });

    expose?.({ circle });
    return () => h('div', { style: HIDDEN_SLOT_STYLE }, slotNodes(slots.default));
  }
});

export const MapGroundOverlay = defineComponent({
  name: 'MapGroundOverlay',
  props: {
    url: {
      type: String,
      required: true
    },
    bounds: {
      type: Object as PropType<google.maps.LatLngBoundsLiteral>,
      required: true
    },
    opacity: Number,
    clickable: Boolean
  },
  emits: ['load', 'unmount', 'click', 'dblclick'],
  setup(props, { emit, expose, slots }) {
    const { google, map, isLoaded } = useGoogleMap();
    const overlay = shallowRef<google.maps.GroundOverlay | null>(null);
    let stopEvents: (() => void) | null = null;

    const createOverlay = () => {
      if (!isLoaded.value || !google.value || !map.value || overlay.value) {
        return;
      }

      const nextOverlay = new google.value.maps.GroundOverlay(props.url, props.bounds, {
        opacity: props.opacity,
        clickable: props.clickable
      });

      nextOverlay.setMap(map.value);
      overlay.value = nextOverlay;
      stopEvents = bindGoogleMapsEvents(google.value, nextOverlay, {
        click: (...args) => emit('click', ...args),
        dblclick: (...args) => emit('dblclick', ...args)
      });
      emit('load', nextOverlay);
    };

    watch([isLoaded, () => map.value], createOverlay, { immediate: true });

    onBeforeUnmount(() => {
      if (google.value && overlay.value) {
        stopEvents?.();
        clearGoogleMapsInstanceListeners(google.value, overlay.value);
        overlay.value.setMap(null);
        emit('unmount', overlay.value);
      }
    });

    expose?.({ overlay });
    return () => h('div', { style: HIDDEN_SLOT_STYLE }, slotNodes(slots.default));
  }
});

export const MapControl = defineComponent({
  name: 'MapControl',
  props: {
    position: {
      type: Number as PropType<google.maps.ControlPosition>,
      required: true
    },
    index: Number
  },
  setup(props, { slots, expose }) {
    const { map } = useGoogleMap();
    const hostRef = ref<HTMLElement | null>(null);

    const attachControl = () => {
      if (!map.value || !hostRef.value) {
        return;
      }

      const controlArray = map.value.controls[props.position];
      const element = hostRef.value;

      if (!Array.from({ length: controlArray.getLength() }).some((_, index) => controlArray.getAt(index) === element)) {
        controlArray.push(element);
      }

      if (props.index !== undefined) {
        (element as any).index = props.index;
      }
    };

    watch([() => map.value, hostRef], attachControl, { immediate: true });

    onBeforeUnmount(() => {
      if (!map.value || !hostRef.value) {
        return;
      }

      const controls = map.value.controls[props.position];
      for (let index = controls.getLength() - 1; index >= 0; index -= 1) {
        if (controls.getAt(index) === hostRef.value) {
          controls.removeAt(index);
        }
      }
    });

    expose?.({ element: hostRef });

    return () =>
      h(
        'div',
        {
          ref: hostRef
        },
        slotNodes(slots.default)
      );
  }
});
