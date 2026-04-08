# @stackline/vue-google-maps

> A maintained Vue 3 wrapper for the Google Maps JavaScript API with versioned demos, advanced markers, marker clustering, shapes, layers, directions, and geocoding.

[![npm version](https://img.shields.io/npm/v/@stackline/vue-google-maps.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/vue-google-maps)
[![npm downloads](https://img.shields.io/npm/dt/@stackline/vue-google-maps.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/vue-google-maps)
[![license](https://img.shields.io/npm/l/@stackline/vue-google-maps.svg?style=flat-square)](https://github.com/alexandroit/vue-google-maps/blob/main/LICENSE)
[![Vue 2 + Vue 3](https://img.shields.io/badge/Vue-2.7%20%2B%203.x-brightgreen?style=flat-square&logo=vuedotjs)](https://vuejs.org)

**[Documentation & Live Demos](https://alexandroit.github.io/vue-google-maps/)** | **[npm](https://www.npmjs.com/package/@stackline/vue-google-maps)** | **[Issues](https://github.com/alexandroit/vue-google-maps/issues)** | **[Repository](https://github.com/alexandroit/vue-google-maps)**

**Latest version:** `3.0.0`

## Why this library?

`@stackline/vue-google-maps` follows the same practical mental model that teams already use with Google Maps in Angular and vanilla JavaScript:

- one provider loads the Google Maps JavaScript API
- one `<GoogleMap>` owns the native `google.maps.Map`
- declarative Vue components wrap markers, advanced markers, shapes, layers, and services
- component refs still expose the native instances when you need imperative control

That keeps Vue in charge of templates and reactivity while preserving the full Google Maps API underneath.

## Vue Version Compatibility

Each package family only installs on its matching Vue family. Framework major and package major are not always the same package number, so use the package family column below.

| Package family | Framework family | Peer range | Tested release window | Demo link |
| :---: | :---: | :---: | :---: | :--- |
| **3.x** | **Vue 3 only** | **`>=3.0.0 <4.0.0`** | **3.0.0 -> 3.5.32** | [Vue 3 family docs](https://alexandroit.github.io/vue-google-maps/vue-3/) |
| **2.x** | **Vue 2 only** | **`>=2.0.0 <3.0.0`** | **2.0.0 -> 2.7.16** | [Vue 2 family docs](https://alexandroit.github.io/vue-google-maps/vue-2/) |


## Installation

```bash
npm install @stackline/vue-google-maps
```

Choose the package family from the compatibility table above. Each published family is locked to one framework major only.

## Quick Start

```ts
import Vue from 'vue';
import {
  GoogleMapsProvider,
  GoogleMap,
  MapAdvancedMarker
} from '@stackline/vue-google-maps';

export default Vue.extend({
  components: {
    GoogleMapsProvider,
    GoogleMap,
    MapAdvancedMarker
  },
  data() {
    return {
      apiKey: '',
      center: { lat: 40.7128, lng: -74.006 },
      mapLibraries: ['marker']
    };
  }
});
```

```html
<GoogleMapsProvider :api-key="apiKey" :libraries="mapLibraries">
  <GoogleMap :center="center" :zoom="11" :height="420">
    <MapAdvancedMarker :position="center">
      <template #content>
        <div class="pin-card">New York City</div>
      </template>
    </MapAdvancedMarker>
  </GoogleMap>
</GoogleMapsProvider>
```

## Main Components

- `GoogleMapsProvider`
- `GoogleMap`
- `MapMarker`
- `MapAdvancedMarker`
- `MapInfoWindow`
- `MapMarkerClusterer`
- `MapPolyline`
- `MapPolygon`
- `MapRectangle`
- `MapCircle`
- `MapGroundOverlay`
- `MapTrafficLayer`
- `MapTransitLayer`
- `MapBicyclingLayer`
- `MapKmlLayer`
- `MapHeatmapLayer`
- `MapDirectionsRenderer`
- `MapDirectionsService`
- `MapControl`

## Hooks and Utilities

- `useGoogleMapsApi()`
- `useGoogleMap()`
- `useMapGeocoder()`
- `useDirectionsService()`
- `createClusterRenderer()`
- `loadGoogleMapsApi()`

## Advanced Marker Content

Use the `content` slot to render your own marker HTML:

```html
<MapAdvancedMarker :position="warehouse">
  <template #content>
    <div class="warehouse-card">
      <strong>Warehouse</strong>
      <span>Open until 20:00</span>
    </div>
  </template>
</MapAdvancedMarker>
```

## Imperative Access

```ts
this.$refs.routeMap.fitBounds(bounds);
this.$refs.clusterer.render();
this.$refs.mainMarker.setPosition({ lat: 43.6532, lng: -79.3832 });
```

## Changelog

### 3.0.0
- Promoted the package line to Vue 3 as the maintained latest release
- Kept the same wrapper surface and versioned docs structure

### 2.0.0
- Initial Vue Google Maps wrapper line
- Added the first versioned docs line for Vue 2
- Wrapped maps, markers, advanced markers, clusterer, shapes, layers, directions, and geocoding
