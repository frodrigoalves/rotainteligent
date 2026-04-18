import { useEffect, useRef } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import type { Waypoint } from "@/lib/storage";

// Disable default icons (we use divIcon)
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;

interface RouteMapProps {
  waypoints: Waypoint[];
  editable?: boolean;
  onAddWaypoint?: (lat: number, lng: number) => void;
  onMoveWaypoint?: (id: string, lat: number, lng: number) => void;
  busPosition?: { lat: number; lng: number } | null;
  selectedWaypointId?: string | null;
  onSelectWaypoint?: (id: string) => void;
  cyclic?: boolean;
  immersive?: boolean;
}

function ClickHandler({
  onAdd,
}: {
  onAdd?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onAdd?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FitBounds({ waypoints, active }: { waypoints: Waypoint[]; active: boolean }) {
  const map = useMap();
  const didFitRef = useRef(false);
  useEffect(() => {
    // Só auto-ajusta enquanto NÃO está seguindo o ônibus,
    // e apenas uma vez por mudança significativa de waypoints.
    if (active) return;
    if (waypoints.length === 0) return;
    const bounds = L.latLngBounds(waypoints.map((w) => [w.lat, w.lng]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    didFitRef.current = true;
  }, [waypoints, map, active]);
  return null;
}

function FollowBus({ pos, immersive }: { pos: { lat: number; lng: number } | null; immersive?: boolean }) {
  const map = useMap();
  const firstRef = useRef(true);
  useEffect(() => {
    if (!pos) {
      firstRef.current = true;
      return;
    }
    if (firstRef.current) {
      const targetZoom = immersive ? 18 : 16;
      map.flyTo([pos.lat, pos.lng], targetZoom, { animate: true, duration: 1.1 });
      firstRef.current = false;
    } else {
      map.panTo([pos.lat, pos.lng], { animate: true, duration: 1.0 });
    }
  }, [pos, map, immersive]);
  return null;
}

function ImmersiveTilt({ active }: { active: boolean }) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (active) {
      container.classList.add("ra-map-3d");
    } else {
      container.classList.remove("ra-map-3d");
    }
    // Leaflet precisa recalcular tamanho quando o container muda visualmente
    setTimeout(() => map.invalidateSize(), 350);
    return () => {
      container.classList.remove("ra-map-3d");
    };
  }, [active, map]);
  return null;
}


function makeMarkerIcon(label: string, kind: "start" | "end" | "mid") {
  return L.divIcon({
    className: "",
    html: `<div class="ra-marker ${kind}">${label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function makeBusIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="ra-bus-marker">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

export default function RouteMap({
  waypoints,
  editable,
  onAddWaypoint,
  onMoveWaypoint,
  busPosition,
  selectedWaypointId,
  onSelectWaypoint,
  cyclic,
  immersive,
}: RouteMapProps) {
  const center: [number, number] =
    waypoints.length > 0
      ? [waypoints[0].lat, waypoints[0].lng]
      : [-19.9012, -44.0915]; // Contagem/MG (Linha 474)
  const polyline = waypoints.map((w) => [w.lat, w.lng]) as [number, number][];
  // Se for cíclico, fecha o trajeto retornando ao primeiro ponto
  const closedPolyline: [number, number][] =
    cyclic && polyline.length > 1 ? [...polyline, polyline[0]] : polyline;
  const busIconRef = useRef(makeBusIcon());

  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom
      zoomControl={false}
      className="h-full w-full"
    >
      {/* Tiles dark imersivos (CartoDB Dark Matter) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      {/* Camada de labels nítida por cima */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
        attribution=""
      />
      {editable && <ClickHandler onAdd={onAddWaypoint} />}
      <FitBounds waypoints={waypoints} active={!!busPosition} />
      <ImmersiveTilt active={!!immersive} />
      {busPosition && <FollowBus pos={busPosition} immersive={immersive} />}

      {closedPolyline.length > 1 && (
        <>
          {/* Glow de fundo */}
          <Polyline
            positions={closedPolyline}
            pathOptions={{
              color: "oklch(0.72 0.2 245)",
              weight: 14,
              opacity: 0.18,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
          {/* Linha principal */}
          <Polyline
            positions={closedPolyline}
            pathOptions={{
              color: "oklch(0.78 0.18 245)",
              weight: 5,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </>
      )}

      {waypoints.map((w, i) => {
        // Em rota cíclica, o último ponto também é "fim" mas visualmente fecha no início
        const kind: "start" | "end" | "mid" =
          i === 0 ? "start" : i === waypoints.length - 1 ? "end" : "mid";
        const label = String(i + 1);
        const isSelected = selectedWaypointId === w.id;
        return (
          <Marker
            key={w.id}
            position={[w.lat, w.lng]}
            draggable={editable}
            icon={makeMarkerIcon(label, kind)}
            eventHandlers={{
              click: () => onSelectWaypoint?.(w.id),
              dragend: (e) => {
                const m = e.target as L.Marker;
                const ll = m.getLatLng();
                onMoveWaypoint?.(w.id, ll.lat, ll.lng);
              },
            }}
            opacity={isSelected ? 1 : 0.95}
          />
        );
      })}

      {busPosition && (
        <Marker
          position={[busPosition.lat, busPosition.lng]}
          icon={busIconRef.current}
          interactive={false}
        />
      )}
    </MapContainer>
  );
}
