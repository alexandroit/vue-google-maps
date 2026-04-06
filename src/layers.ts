import { defineComponent, h, onBeforeUnmount, shallowRef, watch, type PropType } from 'vue-demi';
import { useGoogleMap } from './hooks';
import { HIDDEN_SLOT_STYLE, slotNodes, toHeatmapData, type LatLngLike } from './utils';

export type HeatmapDatum = LatLngLike | google.maps.visualization.WeightedLocation;

function createLayerComponent<T>(
  name: string,
  factory: (googleApi: typeof google, props: any) => T,
  updater?: (layer: T, googleApi: typeof google, props: any) => void
) {
  return defineComponent({
    name,
    props: {
      options: Object as PropType<Record<string, unknown>>
    },
    emits: ['load', 'unmount'],
    setup(props, { slots, emit, expose }) {
      const { google, map, isLoaded } = useGoogleMap();
      const layer = shallowRef<T | null>(null);

      const createLayer = () => {
        if (!isLoaded.value || !google.value || !map.value || layer.value) {
          return;
        }

        const nextLayer = factory(google.value, props);
        (nextLayer as any).setMap?.(map.value);
        layer.value = nextLayer;
        emit('load', nextLayer);
      };

      watch([isLoaded, () => map.value], createLayer, { immediate: true });

      watch(
        () => props,
        (nextProps) => {
          if (layer.value && google.value && updater) {
            updater(layer.value, google.value, nextProps);
          }
        },
        { deep: true }
      );

      onBeforeUnmount(() => {
        if (layer.value) {
          (layer.value as any).setMap?.(null);
          emit('unmount', layer.value);
          layer.value = null;
        }
      });

      expose?.({ layer });
      return () => h('div', { style: HIDDEN_SLOT_STYLE }, slotNodes(slots.default));
    }
  });
}

export const MapTrafficLayer = createLayerComponent('MapTrafficLayer', (googleApi) => new googleApi.maps.TrafficLayer());
export const MapTransitLayer = createLayerComponent('MapTransitLayer', (googleApi) => new googleApi.maps.TransitLayer());
export const MapBicyclingLayer = createLayerComponent('MapBicyclingLayer', (googleApi) => new googleApi.maps.BicyclingLayer());

export const MapKmlLayer = createLayerComponent(
  'MapKmlLayer',
  (googleApi, props) =>
    new googleApi.maps.KmlLayer({
      url: props.url,
      ...props.options
    }),
  (layer: google.maps.KmlLayer, _googleApi, props) => {
    layer.setUrl(props.url);
    layer.setOptions(props.options || {});
  }
);

export const MapHeatmapLayer = defineComponent({
  name: 'MapHeatmapLayer',
  props: {
    data: {
      type: Array as PropType<HeatmapDatum[]>,
      required: true
    },
    options: Object as PropType<google.maps.visualization.HeatmapLayerOptions>
  },
  emits: ['load', 'unmount'],
  setup(props, { slots, emit, expose }) {
    const { google, map, isLoaded } = useGoogleMap();
    const layer = shallowRef<google.maps.visualization.HeatmapLayer | null>(null);

    const createHeatmap = () => {
      if (!isLoaded.value || !google.value || !map.value || layer.value || !google.value.maps.visualization?.HeatmapLayer) {
        return;
      }

      const nextLayer = new google.value.maps.visualization.HeatmapLayer({
        ...(props.options || {}),
        data: toHeatmapData(google.value, props.data)
      });
      nextLayer.setMap(map.value);
      layer.value = nextLayer;
      emit('load', nextLayer);
    };

    watch([isLoaded, () => map.value], createHeatmap, { immediate: true });

    watch(
      () => props.data,
      (nextData) => {
        if (layer.value && google.value) {
          layer.value.setData(toHeatmapData(google.value, nextData));
        }
      },
      { deep: true }
    );

    watch(
      () => props.options,
      (nextOptions) => {
        layer.value?.setOptions(nextOptions || {});
      },
      { deep: true }
    );

    onBeforeUnmount(() => {
      if (layer.value) {
        layer.value.setMap(null);
        emit('unmount', layer.value);
        layer.value = null;
      }
    });

    expose?.({ layer });
    return () => h('div', { style: HIDDEN_SLOT_STYLE }, slotNodes(slots.default));
  }
});
