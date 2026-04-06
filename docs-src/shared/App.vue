<template>
  <div class="docs-page">
    <section class="hero-grid">
      <article class="panel hero-copy">
        <span class="eyebrow">{{ docsMeta.badge }}</span>
        <h1>@revivejs/vue-google-maps</h1>
        <p class="lede">
          A migration-friendly Vue wrapper for the Google Maps JavaScript API with advanced markers, marker clustering,
          shapes, layers, directions, and geocoding.
        </p>

        <div class="feature-grid">
          <div class="feature-card" v-for="feature in featureCards" :key="feature.title">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.body }}</p>
          </div>
        </div>

        <div class="hero-actions">
          <a href="#example-workbench" class="button button-primary">See examples</a>
          <a :href="docsMeta.readmeUrl" class="button button-secondary">README</a>
        </div>
      </article>

      <aside class="panel hero-setup">
        <h2>Setup in 3 steps</h2>
        <div class="setup-grid">
          <div class="setup-step" v-for="step in setupSteps" :key="step.title">
            <div class="step-badge">{{ step.index }}</div>
            <div class="step-body">
              <h3>{{ step.title }}</h3>
              <pre><code>{{ step.code }}</code></pre>
            </div>
          </div>
        </div>
      </aside>
    </section>

    <section class="panel hero-map-panel">
      <GoogleMapsProvider ref="heroProvider" :api-key="apiKey" :libraries="libraries">
        <GoogleMap :center="heroCenter" :zoom="5" :height="480" @map-load="pushLog('Hero map ready.')">
          <MapAdvancedMarker :position="heroCenter">
            <template v-slot:content>
              <div class="hero-marker hero-marker-main">
                <strong>Toronto</strong>
                <span>Advanced marker card</span>
              </div>
            </template>
          </MapAdvancedMarker>

          <MapAdvancedMarker :position="{ lat: 45.5019, lng: -73.5674 }">
            <template v-slot:content>
              <div class="hero-marker">
                <strong>Montreal</strong>
                <span>Cluster-ready content</span>
              </div>
            </template>
          </MapAdvancedMarker>

          <MapCircle
            :center="{ lat: 43.6532, lng: -79.3832 }"
            :radius="95000"
            :options="{
              fillColor: '#1d6fb8',
              fillOpacity: 0.14,
              strokeColor: '#143d63',
              strokeOpacity: 0.8,
              strokeWeight: 2
            }"
          />
        </GoogleMap>
      </GoogleMapsProvider>
    </section>

    <section id="example-workbench" class="workbench-grid">
      <aside class="panel test-menu-panel">
        <h2>Test menu</h2>
        <p>Use the menu as a practical checklist. Each item swaps the live map on the right.</p>
        <div class="test-group">
          <button
            v-for="example in examples"
            :key="example.id"
            :class="['test-button', { active: selectedExampleId === example.id }]"
            @click="setExample(example.id)"
            type="button"
          >
            {{ example.label }}
          </button>
        </div>
      </aside>

      <article class="panel example-panel">
        <div class="example-header">
          <div>
            <span class="eyebrow">{{ selectedExample.category }}</span>
            <h2>{{ selectedExample.label }}</h2>
            <p>{{ selectedExample.description }}</p>
          </div>

          <div class="example-toolbar">
            <template v-if="selectedExampleId === 'controlled-center-zoom'">
              <button class="button button-secondary button-small" @click="focusCity('toronto')" type="button">Toronto</button>
              <button class="button button-secondary button-small" @click="focusCity('montreal')" type="button">Montreal</button>
              <button class="button button-secondary button-small" @click="workbenchZoom += 1" type="button">Zoom in</button>
              <button class="button button-secondary button-small" @click="workbenchZoom -= 1" type="button">Zoom out</button>
            </template>

            <template v-else-if="selectedExampleId === 'geocoding'">
              <button class="button button-secondary button-small" @click="runGeocode('Ottawa, ON')" type="button">Find Ottawa</button>
              <button class="button button-secondary button-small" @click="runGeocode('New York, NY')" type="button">Find New York</button>
            </template>
          </div>
        </div>

        <GoogleMapsProvider ref="workbenchProvider" :api-key="apiKey" :libraries="libraries">
          <GoogleMap
            ref="workbenchMap"
            :center="workbenchCenter"
            :zoom="workbenchZoom"
            :height="560"
            @click="handleMapClick"
            @map-load="pushLog(`${selectedExample.label} map ready.`)"
          >
            <MapAdvancedMarker v-if="selectedExampleId === 'basic-map-bootstrapping'" :position="workbenchCenter">
              <template v-slot:content>
                <div class="pin-card">
                  <strong>Toronto</strong>
                  <span>Bootstrapped map</span>
                </div>
              </template>
            </MapAdvancedMarker>

            <template v-else-if="selectedExampleId === 'controlled-center-zoom'">
              <MapAdvancedMarker :position="workbenchCenter">
                <template v-slot:content>
                  <div class="pin-card">
                    <strong>{{ workbenchCityLabel }}</strong>
                    <span>Reactive camera state</span>
                  </div>
                </template>
              </MapAdvancedMarker>
            </template>

            <template v-else-if="selectedExampleId === 'click-events'">
              <MapAdvancedMarker v-if="clickedPosition" :position="clickedPosition">
                <template v-slot:content>
                  <div class="pin-card">
                    <strong>Last click</strong>
                    <span>{{ clickedPosition.lat.toFixed(4) }}, {{ clickedPosition.lng.toFixed(4) }}</span>
                  </div>
                </template>
              </MapAdvancedMarker>
            </template>

            <template v-else-if="selectedExampleId === 'markers-and-info-windows'">
              <MapAdvancedMarker :position="storePosition">
                <template v-slot:content>
                  <div class="pin-card pin-card-accent">
                    <strong>Downtown store</strong>
                    <span>Click marker for details</span>
                  </div>
                </template>
                <MapInfoWindow :open="true">
                  <div class="info-card">
                    <h3>Downtown store</h3>
                    <p>Open until 20:00 with curbside pickup enabled.</p>
                  </div>
                </MapInfoWindow>
              </MapAdvancedMarker>
            </template>

            <template v-else-if="selectedExampleId === 'advanced-markers'">
              <MapAdvancedMarker :position="{ lat: 45.4215, lng: -75.6972 }">
                <template v-slot:content>
                  <div class="advanced-card">
                    <strong>Ottawa</strong>
                    <span>HTML marker card</span>
                  </div>
                </template>
              </MapAdvancedMarker>
              <MapAdvancedMarker :position="{ lat: 45.5019, lng: -73.5674 }">
                <template v-slot:content>
                  <div class="advanced-card accent">
                    <strong>Montreal</strong>
                    <span>Second advanced marker</span>
                  </div>
                </template>
              </MapAdvancedMarker>
            </template>

            <template v-else-if="selectedExampleId === 'draggable-markers'">
              <MapAdvancedMarker
                :position="draggablePosition"
                :gmp-draggable="true"
                @dragend="handleMarkerDragEnd"
              >
                <template v-slot:content>
                  <div class="advanced-card draggable">
                    <strong>Drag me</strong>
                    <span>{{ draggablePosition.lat.toFixed(4) }}, {{ draggablePosition.lng.toFixed(4) }}</span>
                  </div>
                </template>
              </MapAdvancedMarker>
            </template>

            <template v-else-if="selectedExampleId === 'marker-clustering'">
              <MapMarkerClusterer :renderer="clusterRenderer">
                <MapAdvancedMarker
                  v-for="marker in clusterMarkers"
                  :key="marker.id"
                  :position="marker.position"
                >
                  <template v-slot:content>
                    <div class="cluster-pin">{{ marker.short }}</div>
                  </template>
                </MapAdvancedMarker>
              </MapMarkerClusterer>
            </template>

            <template v-else-if="selectedExampleId === 'geometry-shapes'">
              <MapPolyline
                :path="polylinePath"
                :options="{ strokeColor: '#143d63', strokeWeight: 4, strokeOpacity: 0.9 }"
              />
              <MapPolygon
                :paths="polygonPath"
                :options="{
                  strokeColor: '#1d6fb8',
                  strokeWeight: 2,
                  fillColor: '#1d6fb8',
                  fillOpacity: 0.2
                }"
              />
              <MapRectangle
                :bounds="rectangleBounds"
                :options="{
                  strokeColor: '#006b5f',
                  strokeWeight: 2,
                  fillColor: '#00a58c',
                  fillOpacity: 0.12
                }"
              />
              <MapCircle
                :center="{ lat: 43.6532, lng: -79.3832 }"
                :radius="78000"
                :options="{
                  strokeColor: '#9a3d0b',
                  strokeWeight: 2,
                  fillColor: '#d67e1f',
                  fillOpacity: 0.16
                }"
              />
            </template>

            <template v-else-if="selectedExampleId === 'ground-overlays'">
              <MapGroundOverlay
                url="https://developers.google.com/maps/documentation/javascript/examples/full/images/talkeetna.png"
                :bounds="groundOverlayBounds"
                :opacity="0.7"
              />
            </template>

            <template v-else-if="selectedExampleId === 'traffic-transit-bicycling'">
              <MapTrafficLayer />
              <MapTransitLayer />
              <MapBicyclingLayer />
            </template>

            <template v-else-if="selectedExampleId === 'kml-layers'">
              <MapKmlLayer url="https://developers.google.com/maps/documentation/javascript/examples/kml/westcampus.kml" />
            </template>

            <template v-else-if="selectedExampleId === 'heatmaps'">
              <MapHeatmapLayer
                :data="heatmapPoints"
                :options="{
                  radius: 38,
                  opacity: 0.65,
                  gradient: ['rgba(0,255,255,0)', '#00d2ff', '#1d6fb8', '#143d63']
                }"
              />
            </template>

            <template v-else-if="selectedExampleId === 'directions'">
              <MapDirectionsService :request="directionsRequest" @response="handleDirectionsResponse" />
              <MapDirectionsRenderer v-if="directionsResult" :directions="directionsResult" />
            </template>

            <template v-else-if="selectedExampleId === 'geocoding'">
              <MapAdvancedMarker v-if="geocodeResult" :position="geocodeResult">
                <template v-slot:content>
                  <div class="pin-card">
                    <strong>Geocode result</strong>
                    <span>{{ geocodeLabel }}</span>
                  </div>
                </template>
              </MapAdvancedMarker>
            </template>
          </GoogleMap>
        </GoogleMapsProvider>

        <div class="example-details">
          <div class="detail-card">
            <h3>Selected example</h3>
            <pre><code>{{ selectedExample.code }}</code></pre>
          </div>
          <div class="detail-card">
            <h3>Implementation notes</h3>
            <ul class="detail-list">
              <li v-for="note in selectedExample.notes" :key="note">{{ note }}</li>
            </ul>
          </div>
        </div>
      </article>

      <aside class="panel side-panel">
        <section class="log-section">
          <div class="section-head">
            <h2>Event Log</h2>
            <button class="button button-secondary button-small" @click="clearLogs" type="button">Clear</button>
          </div>
          <p>Map clicks, service responses, and example changes appear here.</p>
          <div class="log-list">
            <div class="log-item" v-for="entry in logEntries" :key="entry.id">
              <strong>{{ entry.time }}</strong>
              <span>{{ entry.message }}</span>
            </div>
          </div>
        </section>

        <section class="release-section">
          <h2>Release line</h2>
          <p>This docs build is pinned to the maintained Vue compatibility line and published npm package.</p>
          <div class="meta-grid">
            <div class="meta-chip">
              <strong>Package line</strong>
              <span>{{ docsMeta.packageLine }}</span>
            </div>
            <div class="meta-chip">
              <strong>Vue line</strong>
              <span>{{ docsMeta.vueLine }}</span>
            </div>
            <div class="meta-chip">
              <strong>Docs path</strong>
              <span>{{ docsMeta.docsPath }}</span>
            </div>
            <div class="meta-chip">
              <strong>Includes</strong>
              <span>advanced markers, clusterer, shapes, layers, directions, geocoder</span>
            </div>
          </div>
        </section>
      </aside>
    </section>

    <section class="panel api-panel">
      <h2>API reference</h2>
      <p>The library keeps the surface declarative, but component refs still expose the native instances underneath.</p>

      <div class="api-grid">
        <div class="api-card" v-for="group in apiGroups" :key="group.title">
          <h3>{{ group.title }}</h3>
          <div class="api-items">
            <div class="api-item" v-for="item in group.items" :key="item.name">
              <code>{{ item.name }}</code>
              <span>{{ item.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import docsMeta from '@docs-meta';
import {
  GoogleMap,
  GoogleMapsProvider,
  MapAdvancedMarker,
  MapBicyclingLayer,
  MapCircle,
  MapDirectionsRenderer,
  MapDirectionsService,
  MapGroundOverlay,
  MapHeatmapLayer,
  MapInfoWindow,
  MapKmlLayer,
  MapMarkerClusterer,
  MapPolygon,
  MapPolyline,
  MapRectangle,
  MapTrafficLayer,
  MapTransitLayer,
  createClusterRenderer
} from '@revivejs/vue-google-maps';

const TORONTO = { lat: 43.6532, lng: -79.3832 };
const MONTREAL = { lat: 45.5019, lng: -73.5674 };
const OTTAWA = { lat: 45.4215, lng: -75.6972 };
const NEW_YORK = { lat: 40.7128, lng: -74.006 };

export default {
  name: 'VueGoogleMapsDocs',
  components: {
    GoogleMapsProvider,
    GoogleMap,
    MapAdvancedMarker,
    MapInfoWindow,
    MapMarkerClusterer,
    MapPolyline,
    MapPolygon,
    MapRectangle,
    MapCircle,
    MapGroundOverlay,
    MapTrafficLayer,
    MapTransitLayer,
    MapBicyclingLayer,
    MapKmlLayer,
    MapHeatmapLayer,
    MapDirectionsService,
    MapDirectionsRenderer
  },
  data() {
    return {
      docsMeta,
      apiKey: '',
      libraries: ['marker', 'visualization'],
      heroCenter: TORONTO,
      selectedExampleId: 'advanced-markers',
      workbenchCenter: TORONTO,
      workbenchZoom: 6,
      workbenchCityLabel: 'Toronto',
      clickedPosition: null,
      storePosition: { lat: 43.6426, lng: -79.3871 },
      draggablePosition: { lat: 45.4215, lng: -75.6972 },
      directionsResult: null,
      geocodeResult: null,
      geocodeLabel: '',
      logEntries: [
        {
          id: 1,
          time: this.timestamp(),
          message: `Loaded docs line ${docsMeta.packageLine}.`
        }
      ],
      featureCards: [
        {
          title: 'Advanced markers first',
          body: 'Use HTML-rich markers by default and keep classic Marker as a fallback for legacy migrations.'
        },
        {
          title: 'Official clustering',
          body: 'Built on top of @googlemaps/markerclusterer with a helper for custom cluster rendering.'
        },
        {
          title: 'Maps + services',
          body: 'Shapes, overlays, transport layers, directions, and geocoding sit in the same maintained package.'
        },
        {
          title: 'Versioned docs history',
          body: 'Vue 2 and Vue 3 each keep their own docs build so demos stay aligned with the maintained line.'
        }
      ],
      setupSteps: [
        {
          index: 1,
          title: 'Install',
          code: 'npm install @revivejs/vue-google-maps'
        },
        {
          index: 2,
          title: 'Load the API',
          code:
            "import { GoogleMapsProvider } from '@revivejs/vue-google-maps';\n\n<GoogleMapsProvider :api-key=\"apiKey\" :libraries=\"['marker']\">"
        },
        {
          index: 3,
          title: 'Render the map',
          code:
            "<GoogleMap :center=\"center\" :zoom=\"11\" :height=\"420\">\n  <MapAdvancedMarker :position=\"center\" />\n</GoogleMap>"
        }
      ],
      examples: [
        {
          id: 'basic-map-bootstrapping',
          category: 'Setup',
          label: 'Basic map bootstrapping',
          description: 'The smallest working map: provider, map, and a single advanced marker.',
          code:
            "import { GoogleMapsProvider, GoogleMap, MapAdvancedMarker } from '@revivejs/vue-google-maps';\n\n<GoogleMapsProvider :api-key=\"apiKey\" :libraries=\"['marker']\">\n  <GoogleMap :center=\"center\" :zoom=\"11\" :height=\"420\">\n    <MapAdvancedMarker :position=\"center\" />\n  </GoogleMap>\n</GoogleMapsProvider>",
          notes: ['Use this as the base shell before adding overlays or services.']
        },
        {
          id: 'controlled-center-zoom',
          category: 'Camera',
          label: 'Controlled center and zoom',
          description: 'Drive the camera from reactive state and update it from external buttons.',
          code:
            "<GoogleMap :center=\"workbenchCenter\" :zoom=\"workbenchZoom\" />\n<button @click=\"focusCity('toronto')\">Toronto</button>",
          notes: ['Map center and zoom can stay fully reactive in Vue state.']
        },
        {
          id: 'click-events',
          category: 'Events',
          label: 'Click events',
          description: 'Capture map clicks and drop an advanced marker on the last clicked location.',
          code:
            "<GoogleMap @click=\"handleMapClick\">\n  <MapAdvancedMarker v-if=\"clickedPosition\" :position=\"clickedPosition\" />\n</GoogleMap>",
          notes: ['Use the map click payload to drive custom overlays or forms.']
        },
        {
          id: 'markers-and-info-windows',
          category: 'Markers',
          label: 'Markers and info windows',
          description: 'Anchor a rich info window to a declarative advanced marker.',
          code:
            "<MapAdvancedMarker :position=\"storePosition\">\n  <template v-slot:content>...</template>\n  <MapInfoWindow :open=\"true\">...</MapInfoWindow>\n</MapAdvancedMarker>",
          notes: ['Nested info windows attach to the current marker automatically.']
        },
        {
          id: 'advanced-markers',
          category: 'Markers',
          label: 'Advanced markers',
          description: 'Render HTML marker cards with the content slot that Google now recommends.',
          code:
            "<MapAdvancedMarker :position=\"OTTAWA\">\n  <template v-slot:content>\n    <div class=\"advanced-card\">Ottawa</div>\n  </template>\n</MapAdvancedMarker>",
          notes: ['Use the content slot for cards, badges, pricing, or image-based markers.']
        },
        {
          id: 'draggable-markers',
          category: 'Markers',
          label: 'Draggable markers',
          description: 'Turn an advanced marker into a draggable editing handle and react to drag end.',
          code:
            "<MapAdvancedMarker :position=\"draggablePosition\" :gmp-draggable=\"true\" @dragend=\"handleMarkerDragEnd\" />",
          notes: ['Great for editors, delivery zones, and route builders.']
        },
        {
          id: 'marker-clustering',
          category: 'Clustering',
          label: 'Marker clustering',
          description: 'Group a dense marker set with the official clusterer and custom HTML cluster badges.',
          code:
            "<MapMarkerClusterer :renderer=\"clusterRenderer\">\n  <MapAdvancedMarker v-for=\"marker in clusterMarkers\" :key=\"marker.id\" :position=\"marker.position\" />\n</MapMarkerClusterer>",
          notes: ['The helper keeps cluster rendering expressive without losing the official Google package.']
        },
        {
          id: 'geometry-shapes',
          category: 'Shapes',
          label: 'Polylines, polygons, rectangles, circles',
          description: 'Render the common geometry overlays you need for routes, zones, and coverage areas.',
          code:
            "<MapPolyline :path=\"polylinePath\" />\n<MapPolygon :paths=\"polygonPath\" />\n<MapRectangle :bounds=\"rectangleBounds\" />\n<MapCircle :center=\"center\" :radius=\"78000\" />",
          notes: ['All four geometry primitives are wrapped declaratively.']
        },
        {
          id: 'ground-overlays',
          category: 'Overlays',
          label: 'Ground overlays',
          description: 'Project an image on top of the map for historical maps, weather, or floor plans.',
          code:
            "<MapGroundOverlay url=\".../talkeetna.png\" :bounds=\"groundOverlayBounds\" :opacity=\"0.7\" />",
          notes: ['The bounds literal stays reactive and easy to version in code.']
        },
        {
          id: 'traffic-transit-bicycling',
          category: 'Layers',
          label: 'Traffic, transit, and bicycling layers',
          description: 'Overlay transportation data without leaving declarative Vue components.',
          code:
            "<MapTrafficLayer />\n<MapTransitLayer />\n<MapBicyclingLayer />",
          notes: ['These layers can be stacked and toggled based on product state.']
        },
        {
          id: 'kml-layers',
          category: 'Layers',
          label: 'KML layers',
          description: 'Load KML feeds into the map with a dedicated declarative wrapper.',
          code: "<MapKmlLayer url=\"https://developers.google.com/maps/documentation/javascript/examples/kml/westcampus.kml\" />",
          notes: ['Useful when a team already has existing KML assets to preserve.']
        },
        {
          id: 'heatmaps',
          category: 'Layers',
          label: 'Heatmaps',
          description: 'Visualize density with the Google visualization library from reactive point sets.',
          code:
            "<MapHeatmapLayer :data=\"heatmapPoints\" :options=\"{ radius: 38, opacity: 0.65 }\" />",
          notes: ['Load the visualization library once and keep the data array reactive.']
        },
        {
          id: 'directions',
          category: 'Services',
          label: 'Directions',
          description: 'Request routes declaratively and render them on the same live map surface.',
          code:
            "<MapDirectionsService :request=\"directionsRequest\" @response=\"handleDirectionsResponse\" />\n<MapDirectionsRenderer v-if=\"directionsResult\" :directions=\"directionsResult\" />",
          notes: ['This is the friendliest way to keep routing flows inside Vue state.']
        },
        {
          id: 'geocoding',
          category: 'Services',
          label: 'Geocoding',
          description: 'Use the live Google geocoder and place the response result back on the map.',
          code:
            "const geocoder = new google.maps.Geocoder();\nconst result = await geocoder.geocode({ address: 'Ottawa, ON' });",
          notes: ['The component suite stays declarative, but the raw service instances remain accessible.']
        }
      ],
      apiGroups: [
        {
          title: 'Core components',
          items: [
            { name: '<GoogleMapsProvider />', description: 'Loads the JavaScript API and shares the google namespace.' },
            { name: '<GoogleMap />', description: 'Owns the native google.maps.Map and exposes imperative helpers through refs.' },
            { name: '<MapAdvancedMarker />', description: 'Renders HTML-rich advanced markers with a content slot.' },
            { name: '<MapInfoWindow />', description: 'Anchors info windows to markers or explicit positions.' },
            { name: '<MapMarkerClusterer />', description: 'Wraps the official marker clusterer package.' }
          ]
        },
        {
          title: 'Shapes and layers',
          items: [
            { name: '<MapPolyline />', description: 'Polyline paths for route visualizations.' },
            { name: '<MapPolygon />', description: 'Polygon areas for service zones and shapes.' },
            { name: '<MapRectangle />', description: 'Bounds-based rectangles.' },
            { name: '<MapCircle />', description: 'Radius overlays for coverage or proximity.' },
            { name: '<MapGroundOverlay />', description: 'Image overlays on a bounds area.' },
            { name: '<MapTrafficLayer /> / <MapTransitLayer /> / <MapBicyclingLayer />', description: 'Transport layers.' },
            { name: '<MapKmlLayer />', description: 'KML feeds.' },
            { name: '<MapHeatmapLayer />', description: 'Visualization heatmaps.' }
          ]
        },
        {
          title: 'Services and helpers',
          items: [
            { name: '<MapDirectionsService />', description: 'Runs route requests and emits results.' },
            { name: '<MapDirectionsRenderer />', description: 'Draws route results on the map.' },
            { name: 'useGoogleMapsApi()', description: 'Reads provider loading state and the live google namespace.' },
            { name: 'useGoogleMap()', description: 'Gets the current native map from inside descendants.' },
            { name: 'useMapGeocoder()', description: 'Returns a memoized geocoder instance.' },
            { name: 'useDirectionsService()', description: 'Returns a memoized directions service instance.' },
            { name: 'createClusterRenderer()', description: 'Builds custom cluster badges with the official clusterer.' }
          ]
        }
      ],
      polylinePath: [
        { lat: 43.6532, lng: -79.3832 },
        { lat: 44.2312, lng: -76.486 },
        { lat: 45.4215, lng: -75.6972 },
        { lat: 45.5019, lng: -73.5674 }
      ],
      polygonPath: [
        { lat: 43.95, lng: -79.95 },
        { lat: 44.45, lng: -79.1 },
        { lat: 44.15, lng: -78.15 },
        { lat: 43.72, lng: -78.55 }
      ],
      rectangleBounds: {
        north: 46.2,
        south: 45.0,
        east: -73.0,
        west: -75.2
      },
      groundOverlayBounds: {
        north: 62.281819,
        south: 62.269295,
        east: -150.005608,
        west: -150.017505
      },
      clusterMarkers: [
        { id: 1, short: 'TO', position: { lat: 43.6532, lng: -79.3832 } },
        { id: 2, short: 'MI', position: { lat: 43.589, lng: -79.6441 } },
        { id: 3, short: 'BR', position: { lat: 43.7315, lng: -79.7624 } },
        { id: 4, short: 'HA', position: { lat: 43.2557, lng: -79.8711 } },
        { id: 5, short: 'KI', position: { lat: 43.4516, lng: -80.4925 } },
        { id: 6, short: 'OT', position: { lat: 45.4215, lng: -75.6972 } },
        { id: 7, short: 'MO', position: { lat: 45.5019, lng: -73.5674 } },
        { id: 8, short: 'QC', position: { lat: 46.8139, lng: -71.208 } },
        { id: 9, short: 'NY', position: { lat: 40.7128, lng: -74.006 } },
        { id: 10, short: 'NJ', position: { lat: 40.7357, lng: -74.1724 } }
      ],
      heatmapPoints: [
        { lat: 43.6532, lng: -79.3832 },
        { lat: 43.6542, lng: -79.3812 },
        { lat: 43.6558, lng: -79.3845 },
        { lat: 43.6564, lng: -79.3891 },
        { lat: 43.661, lng: -79.395 },
        { lat: 43.6641, lng: -79.4003 },
        { lat: 43.6672, lng: -79.404 },
        { lat: 43.6725, lng: -79.3892 }
      ],
      directionsRequest: {
        origin: 'Toronto, ON',
        destination: 'Ottawa, ON',
        travelMode: 'DRIVING'
      },
      clusterRenderer: null
    };
  },
  computed: {
    selectedExample() {
      return this.examples.find((example) => example.id === this.selectedExampleId) || this.examples[0];
    }
  },
  created() {
    this.clusterRenderer = createClusterRenderer({
      render: ({ count }) => {
        const element = document.createElement('div');
        element.className = 'cluster-badge';
        element.textContent = `${count}`;
        return element;
      }
    });
  },
  methods: {
    timestamp() {
      return new Date().toLocaleTimeString([], { hour12: false });
    },
    pushLog(message) {
      this.logEntries.unshift({
        id: Date.now() + Math.random(),
        time: this.timestamp(),
        message
      });
      this.logEntries = this.logEntries.slice(0, 10);
    },
    clearLogs() {
      this.logEntries = [];
    },
    setExample(exampleId) {
      this.selectedExampleId = exampleId;

      if (exampleId === 'ground-overlays') {
        this.workbenchCenter = { lat: 62.2759, lng: -150.0115 };
        this.workbenchZoom = 13;
      } else if (exampleId === 'kml-layers') {
        this.workbenchCenter = { lat: 37.422, lng: -122.084 };
        this.workbenchZoom = 15;
      } else if (exampleId === 'heatmaps') {
        this.workbenchCenter = TORONTO;
        this.workbenchZoom = 12;
      } else if (exampleId === 'directions') {
        this.workbenchCenter = { lat: 44.5, lng: -77.6 };
        this.workbenchZoom = 7;
      } else if (exampleId === 'geocoding') {
        this.workbenchCenter = OTTAWA;
        this.workbenchZoom = 10;
      } else {
        this.workbenchCenter = TORONTO;
        this.workbenchZoom = 6;
      }

      this.pushLog(`Selected example: ${this.selectedExample.label}.`);
    },
    handleMapClick(event) {
      if (!event || !event.latLng) {
        return;
      }

      this.clickedPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      this.pushLog(`Map click at ${this.clickedPosition.lat.toFixed(4)}, ${this.clickedPosition.lng.toFixed(4)}.`);
    },
    focusCity(city) {
      if (city === 'montreal') {
        this.workbenchCenter = MONTREAL;
        this.workbenchZoom = 10;
        this.workbenchCityLabel = 'Montreal';
      } else {
        this.workbenchCenter = TORONTO;
        this.workbenchZoom = 10;
        this.workbenchCityLabel = 'Toronto';
      }

      this.pushLog(`Controlled camera moved to ${this.workbenchCityLabel}.`);
    },
    handleMarkerDragEnd(event) {
      if (!event || !event.latLng) {
        return;
      }

      this.draggablePosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      this.pushLog(`Draggable marker moved to ${this.draggablePosition.lat.toFixed(4)}, ${this.draggablePosition.lng.toFixed(4)}.`);
    },
    handleDirectionsResponse(payload) {
      this.directionsResult = payload.result;
      this.pushLog('Directions request returned successfully.');
    },
    async runGeocode(address) {
      if (!window.google || !window.google.maps) {
        this.pushLog('Google Maps API is not available yet.');
        return;
      }

      try {
        const geocoder = new window.google.maps.Geocoder();
        const response = await geocoder.geocode({ address });

        if (response.results && response.results[0]) {
          const location = response.results[0].geometry.location;
          this.geocodeResult = { lat: location.lat(), lng: location.lng() };
          this.geocodeLabel = response.results[0].formatted_address;
          this.workbenchCenter = this.geocodeResult;
          this.workbenchZoom = 11;
          this.pushLog(`Geocoded ${address}.`);
        }
      } catch (error) {
        this.pushLog(`Geocoding failed for ${address}.`);
      }
    }
  }
};
</script>

<style>
:root {
  color-scheme: light;
  --page-bg: linear-gradient(180deg, #eef6ff 0%, #fff7eb 100%);
  --panel-bg: rgba(255, 255, 255, 0.94);
  --panel-border: rgba(23, 50, 77, 0.12);
  --shadow: 0 24px 60px rgba(23, 50, 77, 0.12);
  --ink: #17324d;
  --muted: #5a7087;
  --brand: #c7643b;
  --brand-dark: #143d63;
  --chip: #eef5fb;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  margin: 0;
  min-height: 100%;
}

body {
  font-family: Georgia, "Times New Roman", serif;
  background: var(--page-bg);
  color: var(--ink);
}

a {
  color: inherit;
}

pre,
code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
}

.docs-page {
  width: min(1480px, calc(100% - 32px));
  margin: 24px auto 72px;
}

.panel {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 28px;
  box-shadow: var(--shadow);
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(360px, 0.9fr);
  gap: 20px;
}

.hero-copy,
.hero-setup,
.hero-map-panel,
.test-menu-panel,
.example-panel,
.side-panel,
.api-panel {
  padding: 28px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: #143d63;
  color: #fff;
  padding: 7px 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1,
h2,
h3 {
  margin: 0;
  line-height: 1.05;
}

h1 {
  margin-top: 16px;
  font-size: clamp(2.2rem, 4vw, 4rem);
}

h2 {
  font-size: clamp(1.6rem, 2vw, 2.3rem);
}

h3 {
  font-size: 1.05rem;
}

.lede,
.hero-copy p,
.hero-setup p,
.example-header p,
.side-panel p,
.api-panel p,
.test-menu-panel p {
  color: var(--muted);
  line-height: 1.6;
}

.feature-grid,
.setup-grid,
.example-details,
.meta-grid,
.api-grid {
  display: grid;
  gap: 16px;
}

.feature-grid {
  margin-top: 24px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.feature-card,
.detail-card,
.meta-chip,
.api-card,
.setup-step {
  border: 1px solid rgba(23, 50, 77, 0.1);
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(242,247,252,0.92) 100%);
}

.feature-card {
  padding: 18px;
}

.feature-card p {
  margin: 8px 0 0;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid rgba(23, 50, 77, 0.14);
  text-decoration: none;
  font-weight: 700;
  cursor: pointer;
  transition: transform 120ms ease, border-color 120ms ease;
  background: #fff;
  color: var(--ink);
}

.button:hover {
  transform: translateY(-1px);
}

.button-primary {
  background: var(--brand);
  border-color: transparent;
  color: #fff;
}

.button-secondary {
  background: #fff;
}

.button-small {
  min-height: 36px;
  padding: 0 14px;
  font-size: 0.9rem;
}

.hero-setup h2 {
  margin-bottom: 18px;
}

.setup-grid {
  grid-template-columns: 1fr;
}

.setup-step {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 14px;
  padding: 16px;
}

.step-badge {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #1d6fb8;
  color: #fff;
  font-weight: 700;
}

.step-body pre,
.detail-card pre {
  margin: 12px 0 0;
  overflow: auto;
  max-width: 100%;
  padding: 16px;
  border-radius: 18px;
  background: #132941;
  color: #eef5fb;
  font-size: 0.88rem;
  line-height: 1.6;
}

.hero-map-panel {
  margin-top: 20px;
}

.hero-marker,
.pin-card,
.advanced-card,
.cluster-pin,
.cluster-badge {
  border-radius: 18px;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(23, 50, 77, 0.18);
  color: var(--ink);
  border: 1px solid rgba(23, 50, 77, 0.08);
}

.hero-marker,
.pin-card,
.advanced-card {
  display: grid;
  gap: 4px;
}

.hero-marker span,
.pin-card span,
.advanced-card span {
  color: var(--muted);
  font-size: 0.9rem;
}

.hero-marker-main {
  background: linear-gradient(180deg, #143d63 0%, #1d6fb8 100%);
  color: #fff;
}

.hero-marker-main span {
  color: rgba(255, 255, 255, 0.84);
}

.advanced-card.accent {
  background: linear-gradient(180deg, #fff 0%, #fff4e8 100%);
}

.advanced-card.draggable {
  border-style: dashed;
}

.pin-card-accent {
  background: linear-gradient(180deg, #fff 0%, #eef7ff 100%);
}

.cluster-pin {
  min-width: 38px;
  text-align: center;
  font-weight: 700;
}

.cluster-badge {
  min-width: 52px;
  text-align: center;
  background: #143d63;
  color: #fff;
  font-weight: 700;
}

.workbench-grid {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 300px;
  gap: 20px;
  margin-top: 24px;
  align-items: start;
}

.test-group {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.test-button {
  width: 100%;
  text-align: left;
  border: 1px solid rgba(23, 50, 77, 0.12);
  background: #f6fafc;
  color: var(--ink);
  border-radius: 14px;
  padding: 14px 16px;
  font: inherit;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease, transform 140ms ease;
}

.test-button:hover {
  transform: translateY(-1px);
}

.test-button.active {
  background: #143d63;
  color: #fff;
}

.example-panel {
  display: grid;
  gap: 18px;
}

.example-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.example-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.example-details {
  grid-template-columns: 1.1fr 0.9fr;
}

.detail-card {
  padding: 18px;
}

.detail-list {
  margin: 12px 0 0;
  padding-left: 18px;
  color: var(--muted);
  line-height: 1.7;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.log-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.log-item {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #f4f8fb;
  border: 1px solid rgba(23, 50, 77, 0.08);
  color: var(--muted);
}

.meta-grid {
  grid-template-columns: 1fr;
  margin-top: 16px;
}

.meta-chip {
  padding: 14px 16px;
  display: grid;
  gap: 6px;
}

.meta-chip span {
  color: var(--muted);
}

.api-panel {
  margin-top: 24px;
}

.api-grid {
  margin-top: 18px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.api-card {
  padding: 18px;
}

.api-items {
  display: grid;
  gap: 14px;
  margin-top: 14px;
}

.api-item {
  display: grid;
  gap: 6px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(23, 50, 77, 0.08);
}

.api-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.api-item code {
  font-weight: 700;
  color: #18598f;
}

.api-item span {
  color: var(--muted);
  line-height: 1.5;
}

.info-card h3 {
  margin-bottom: 8px;
}

.info-card p {
  margin: 0;
  color: var(--muted);
}

@media (max-width: 1200px) {
  .workbench-grid {
    grid-template-columns: 260px minmax(0, 1fr);
  }

  .side-panel {
    grid-column: 1 / -1;
  }

  .api-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .docs-page {
    width: min(100%, calc(100% - 24px));
  }

  .hero-grid,
  .workbench-grid,
  .feature-grid,
  .example-details {
    grid-template-columns: 1fr;
  }

  .example-header {
    flex-direction: column;
  }

  .hero-copy,
  .hero-setup,
  .hero-map-panel,
  .test-menu-panel,
  .example-panel,
  .side-panel,
  .api-panel {
    padding: 22px;
  }
}

@media (max-width: 640px) {
  .docs-page {
    width: calc(100% - 16px);
    margin-top: 16px;
  }

  .panel {
    border-radius: 22px;
  }

  .feature-grid {
    gap: 12px;
  }
}
</style>
