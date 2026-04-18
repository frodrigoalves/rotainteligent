// Export / import de rotas em JSON — formato demonstrativo, autoexplicativo.
import {
  uid,
  maneuverLabel,
  type Route as RouteData,
  type Waypoint,
  type ManeuverType,
} from "./storage";

const MANIFEST_VERSION = "1.0";

export interface DemoExport {
  manifest: {
    app: "RA Routes";
    version: string;
    exportedAt: string;
    type: "demo";
    description: string;
    fields: Record<string, string>;
  };
  routes: Array<{
    name: string;
    description?: string;
    totalWaypoints: number;
    waypoints: Array<{
      order: number;
      latitude: number;
      longitude: number;
      instruction: string;
      maneuver: ManeuverType;
      maneuverLabel: string;
      suggestedGear: string;
      maxSpeedKmh: number;
      observation: string;
    }>;
  }>;
}

function buildManifest(): DemoExport["manifest"] {
  return {
    app: "RA Routes",
    version: MANIFEST_VERSION,
    exportedAt: new Date().toISOString(),
    type: "demo",
    description:
      "Modelo demonstrativo de rotas exportadas do RA Routes. Cada waypoint contém a orientação textual (falada por voz no modo Motorista), tipo de manobra, marcha sugerida, velocidade máxima e observação.",
    fields: {
      order: "Posição do waypoint na sequência da rota (1-indexed)",
      latitude: "Coordenada geográfica em graus decimais",
      longitude: "Coordenada geográfica em graus decimais",
      instruction:
        "Texto da orientação — exibido visualmente e falado em voz no modo Motorista",
      maneuver: "Tipo de manobra (start, right, left, straight, highway, exit, terminal, uturn, merge, end)",
      suggestedGear: "Marcha sugerida para o trecho",
      maxSpeedKmh: "Velocidade máxima permitida no trecho, em km/h",
      observation: "Observação adicional para o motorista",
    },
  };
}

export function exportRoutesAsDemo(routes: RouteData[]): DemoExport {
  return {
    manifest: buildManifest(),
    routes: routes.map((r) => ({
      name: r.name,
      description: r.description,
      totalWaypoints: r.waypoints.length,
      waypoints: r.waypoints.map((w, i) => ({
        order: i + 1,
        latitude: Number(w.lat.toFixed(6)),
        longitude: Number(w.lng.toFixed(6)),
        instruction: w.instruction,
        maneuver: w.maneuver,
        maneuverLabel: maneuverLabel(w.maneuver),
        suggestedGear: w.suggestedGear,
        maxSpeedKmh: w.maxSpeed,
        observation: w.observation,
      })),
    })),
  };
}

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "rota";
}

export function downloadRouteDemo(route: RouteData) {
  const payload = exportRoutesAsDemo([route]);
  downloadJson(payload, `ra-routes-${slugify(route.name)}-demo.json`);
}

export function downloadAllRoutesDemo(routes: RouteData[]) {
  const payload = exportRoutesAsDemo(routes);
  downloadJson(payload, `ra-routes-demo-completo.json`);
}

const VALID_MANEUVERS: ManeuverType[] = [
  "start", "right", "left", "straight", "highway",
  "exit", "terminal", "uturn", "merge", "end",
];

export function importRoutesFromJson(json: unknown): RouteData[] {
  const obj = json as Partial<DemoExport>;
  if (!obj || !Array.isArray(obj.routes)) {
    throw new Error("Arquivo inválido: campo 'routes' não encontrado.");
  }
  const now = Date.now();
  return obj.routes.map((r) => {
    const waypoints: Waypoint[] = (r.waypoints ?? []).map((w) => {
      const maneuver: ManeuverType = VALID_MANEUVERS.includes(
        w.maneuver as ManeuverType,
      )
        ? (w.maneuver as ManeuverType)
        : "straight";
      return {
        id: uid(),
        lat: Number(w.latitude),
        lng: Number(w.longitude),
        instruction: String(w.instruction ?? ""),
        maneuver,
        suggestedGear: String(w.suggestedGear ?? "3ª"),
        maxSpeed: Number(w.maxSpeedKmh ?? 40),
        observation: String(w.observation ?? ""),
      };
    });
    return {
      id: uid(),
      name: String(r.name ?? "Rota importada"),
      description: r.description,
      waypoints,
      createdAt: now,
      updatedAt: now,
    };
  });
}
