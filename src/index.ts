import type { App } from 'vue-demi';
import { GoogleMap } from './GoogleMap';
import { GoogleMapsProvider } from './GoogleMapsProvider';
import { createClusterRenderer } from './clusterRenderer';
import { MapDirectionsRenderer, MapDirectionsService } from './directions';
import {
  MapBicyclingLayer,
  MapHeatmapLayer,
  MapKmlLayer,
  MapTrafficLayer,
  MapTransitLayer
} from './layers';
import { getDefaultGoogleMapsLibraries, loadGoogleMapsApi } from './loadGoogleMapsApi';
import { MapAdvancedMarker, MapInfoWindow, MapMarker, MapMarkerClusterer } from './markers';
import { MapCircle, MapControl, MapGroundOverlay, MapPolygon, MapPolyline, MapRectangle } from './shapes';
import { useDirectionsService, useGoogleMap, useGoogleMapsApi, useMapGeocoder } from './hooks';

export {
  GoogleMapsProvider,
  GoogleMap,
  MapMarker,
  MapAdvancedMarker,
  MapInfoWindow,
  MapMarkerClusterer,
  MapPolyline,
  MapPolygon,
  MapRectangle,
  MapCircle,
  MapGroundOverlay,
  MapControl,
  MapTrafficLayer,
  MapTransitLayer,
  MapBicyclingLayer,
  MapKmlLayer,
  MapHeatmapLayer,
  MapDirectionsRenderer,
  MapDirectionsService,
  createClusterRenderer,
  getDefaultGoogleMapsLibraries,
  loadGoogleMapsApi,
  useGoogleMapsApi,
  useGoogleMap,
  useMapGeocoder,
  useDirectionsService
};

const components = [
  GoogleMapsProvider,
  GoogleMap,
  MapMarker,
  MapAdvancedMarker,
  MapInfoWindow,
  MapMarkerClusterer,
  MapPolyline,
  MapPolygon,
  MapRectangle,
  MapCircle,
  MapGroundOverlay,
  MapControl,
  MapTrafficLayer,
  MapTransitLayer,
  MapBicyclingLayer,
  MapKmlLayer,
  MapHeatmapLayer,
  MapDirectionsRenderer,
  MapDirectionsService
];

const VueGoogleMapsPlugin = {
  install(app: App) {
    components.forEach((component) => {
      if (component.name) {
        app.component(component.name as string, component);
      }
    });
  }
};

export default VueGoogleMapsPlugin;
