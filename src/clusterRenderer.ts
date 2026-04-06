import type { Cluster, ClusterStats, Renderer } from '@googlemaps/markerclusterer';

export type ClusterRendererContext = {
  cluster: Cluster;
  stats: ClusterStats;
  count: number;
  position: google.maps.LatLng;
  google: typeof google;
  map: google.maps.Map;
};

export type CreateClusterRendererOptions = {
  className?: string;
  background?: string;
  color?: string;
  zIndex?: number;
  render?: (context: ClusterRendererContext) => HTMLElement | string;
};

export function createClusterRenderer(options: CreateClusterRendererOptions = {}): Renderer {
  return {
    render(cluster, stats, map) {
      const googleApi = window.google;
      const count = cluster.count;
      const position = cluster.position;
      const context: ClusterRendererContext = {
        cluster,
        stats,
        count,
        position,
        google: googleApi,
        map
      };

      const customContent = options.render?.(context);
      const content = typeof customContent === 'string' ? createClusterElement(customContent, options) : customContent;

      if (googleApi.maps.marker?.AdvancedMarkerElement && content instanceof HTMLElement) {
        return new googleApi.maps.marker.AdvancedMarkerElement({
          position,
          content,
          zIndex: options.zIndex ?? Number(googleApi.maps.Marker.MAX_ZINDEX) + count
        });
      }

      return new googleApi.maps.Marker({
        position,
        zIndex: options.zIndex ?? Number(googleApi.maps.Marker.MAX_ZINDEX) + count,
        label: {
          text: String(count),
          color: options.color ?? '#ffffff',
          fontWeight: '700'
        },
        icon: {
          path: googleApi.maps.SymbolPath.CIRCLE,
          fillColor: options.background ?? '#143d63',
          fillOpacity: 0.96,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 24
        }
      });
    }
  };
}

function createClusterElement(text: string, options: CreateClusterRendererOptions) {
  const element = document.createElement('div');
  element.className = options.className || 'revivejs-google-cluster';
  element.style.display = 'grid';
  element.style.placeItems = 'center';
  element.style.minWidth = '48px';
  element.style.height = '48px';
  element.style.padding = '0 14px';
  element.style.borderRadius = '999px';
  element.style.background = options.background || '#143d63';
  element.style.color = options.color || '#ffffff';
  element.style.font = '700 14px/1.1 Georgia, serif';
  element.style.boxShadow = '0 12px 24px rgba(20, 61, 99, 0.22)';
  element.textContent = text;
  return element;
}
