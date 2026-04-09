import { computed, defineComponent, h, onMounted, provide, shallowRef, watch, type PropType } from 'vue-demi';
import { GOOGLE_MAPS_API_CONTEXT_KEY, type GoogleMapsStatus } from './internal';
import { getDefaultGoogleMapsLibraries, loadGoogleMapsApi, type GoogleMapsApiLoadOptions } from './loadGoogleMapsApi';
import { slotNodes } from './utils';

export type GoogleMapsProviderProps = GoogleMapsApiLoadOptions & {
  autoLoad?: boolean;
};

export const GoogleMapsProvider = defineComponent({
  name: 'GoogleMapsProvider',
  props: {
    apiKey: String,
    version: String,
    language: String,
    region: String,
    libraries: {
      type: Array as PropType<string[]>,
      default: () => getDefaultGoogleMapsLibraries()
    },
    mapIds: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    authReferrerPolicy: String,
    channel: String,
    solutionChannel: String,
    nonce: String,
    autoLoad: {
      type: Boolean,
      default: true
    }
  },
  emits: ['loaded', 'error', 'status-change'],
  setup(props, { slots, emit, expose }) {
    const status = shallowRef<GoogleMapsStatus>('idle');
    const error = shallowRef<Error | null>(null);
    const googleApi = shallowRef<typeof google | null>(typeof window !== 'undefined' ? window.google ?? null : null);
    const isLoaded = computed(() => Boolean(googleApi.value?.maps));
    const loaderOptions = shallowRef<GoogleMapsApiLoadOptions>({
      apiKey: props.apiKey,
      version: props.version,
      language: props.language,
      region: props.region,
      libraries: props.libraries,
      mapIds: props.mapIds,
      authReferrerPolicy: props.authReferrerPolicy,
      channel: props.channel,
      solutionChannel: props.solutionChannel,
      nonce: props.nonce
    });

    const reload = async () => {
      if (!props.autoLoad) {
        return googleApi.value;
      }

      try {
        status.value = 'loading';
        emit('status-change', status.value);
        googleApi.value = await loadGoogleMapsApi(loaderOptions.value);
        status.value = 'loaded';
        error.value = null;
        emit('loaded', googleApi.value);
        emit('status-change', status.value);
        return googleApi.value;
      } catch (nextError) {
        error.value = nextError as Error;
        status.value = 'error';
        emit('error', error.value);
        emit('status-change', status.value);
        return null;
      }
    };

    watch(
      () => ({
        apiKey: props.apiKey,
        version: props.version,
        language: props.language,
        region: props.region,
        libraries: props.libraries,
        mapIds: props.mapIds,
        authReferrerPolicy: props.authReferrerPolicy,
        channel: props.channel,
        solutionChannel: props.solutionChannel,
        nonce: props.nonce
      }),
      (value) => {
        loaderOptions.value = { ...value };
      },
      { deep: true }
    );

    onMounted(() => {
      if (props.autoLoad) {
        void reload();
      }
    });

    provide(GOOGLE_MAPS_API_CONTEXT_KEY, {
      status,
      error,
      google: googleApi,
      isLoaded,
      loaderOptions,
      reload
    });

    expose?.({
      status,
      error,
      google: googleApi,
      isLoaded,
      reload
    });

    return () =>
      h(
        'div',
        {
          class: 'stackline-google-maps-provider',
          style: { display: 'contents' }
        },
        slotNodes(slots.default)
      );
  }
});
