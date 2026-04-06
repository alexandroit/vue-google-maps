import { defineComponent, h, onBeforeUnmount, shallowRef, watch, type PropType } from 'vue-demi';
import { useDirectionsService, useGoogleMap } from './hooks';
import { HIDDEN_SLOT_STYLE, slotNodes } from './utils';

export type DirectionsServiceResult = {
  request: google.maps.DirectionsRequest;
  result: google.maps.DirectionsResult;
  status: google.maps.DirectionsStatus;
};

export const MapDirectionsService = defineComponent({
  name: 'MapDirectionsService',
  props: {
    request: {
      type: Object as PropType<google.maps.DirectionsRequest>,
      required: true
    },
    autoRun: {
      type: Boolean,
      default: true
    }
  },
  emits: ['load', 'response', 'error'],
  setup(props, { slots, emit, expose }) {
    const directionsService = useDirectionsService();
    const lastResponse = shallowRef<DirectionsServiceResult | null>(null);

    const run = async (nextRequest = props.request) => {
      if (!directionsService.value || !nextRequest) {
        return null;
      }

      emit('load', directionsService.value);

      try {
        const result = await directionsService.value.route(nextRequest);
        const payload = {
          request: nextRequest,
          result,
          status: google.maps.DirectionsStatus.OK
        };
        lastResponse.value = payload;
        emit('response', payload);
        return payload;
      } catch (error) {
        emit('error', error);
        return null;
      }
    };

    watch(
      () => props.request,
      (nextRequest) => {
        if (props.autoRun && nextRequest) {
          void run(nextRequest);
        }
      },
      { deep: true, immediate: true }
    );

    expose?.({
      service: directionsService,
      lastResponse,
      run
    });

    return () => h('div', { style: HIDDEN_SLOT_STYLE }, slotNodes(slots.default));
  }
});

export const MapDirectionsRenderer = defineComponent({
  name: 'MapDirectionsRenderer',
  props: {
    directions: Object as PropType<google.maps.DirectionsResult>,
    routeIndex: Number,
    options: Object as PropType<google.maps.DirectionsRendererOptions>
  },
  emits: ['load', 'unmount', 'directions-changed'],
  setup(props, { slots, emit, expose }) {
    const { google, map, isLoaded } = useGoogleMap();
    const renderer = shallowRef<google.maps.DirectionsRenderer | null>(null);

    const createRenderer = () => {
      if (!isLoaded.value || !google.value || !map.value || renderer.value) {
        return;
      }

      const nextRenderer = new google.value.maps.DirectionsRenderer({
        ...(props.options || {}),
        map: map.value,
        directions: props.directions,
        routeIndex: props.routeIndex
      });

      google.value.maps.event.addListener(nextRenderer, 'directions_changed', () => emit('directions-changed'));
      renderer.value = nextRenderer;
      emit('load', nextRenderer);
    };

    watch([isLoaded, () => map.value], createRenderer, { immediate: true });
    watch(
      () => props.directions,
      (nextDirections) => {
        renderer.value?.setDirections(nextDirections || null);
      },
      { deep: true }
    );
    watch(() => props.routeIndex, (nextRouteIndex) => renderer.value?.setRouteIndex(nextRouteIndex ?? 0));
    watch(
      () => props.options,
      (nextOptions) => renderer.value?.setOptions(nextOptions || {}),
      { deep: true }
    );

    onBeforeUnmount(() => {
      if (renderer.value) {
        renderer.value.setMap(null);
        emit('unmount', renderer.value);
        renderer.value = null;
      }
    });

    expose?.({ renderer });
    return () => h('div', { style: HIDDEN_SLOT_STYLE }, slotNodes(slots.default));
  }
});
