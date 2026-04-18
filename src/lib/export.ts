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

// ===== Demonstrativo VISUAL (HTML standalone, imprimível como PDF) =====

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const MANEUVER_EMOJI_FREE_SVG: Record<ManeuverType, string> = {
  // ícones SVG de linha contínua (sem emoji), inline
  start: '<path d="M5 12h14M13 6l6 6-6 6" />',
  right: '<path d="M5 19V9a4 4 0 0 1 4-4h10M15 1l4 4-4 4" />',
  left: '<path d="M19 19V9a4 4 0 0 0-4-4H5M9 1 5 5l4 4" />',
  straight: '<path d="M12 19V5M6 11l6-6 6 6" />',
  highway: '<path d="M3 21l4-18M21 21l-4-18M12 3v18" />',
  exit: '<path d="M9 5H5v14h4M14 9l5 3-5 3M19 12H9" />',
  terminal: '<rect x="3" y="6" width="18" height="12" rx="2" /><path d="M7 18v2M17 18v2M3 12h18" />',
  uturn: '<path d="M5 19V9a5 5 0 0 1 10 0v8M11 13l4 4 4-4" />',
  merge: '<path d="M6 21V11a8 8 0 0 1 8-8M10 7l4-4 4 4" />',
  end: '<circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" />',
};

function renderRouteVisualHtml(route: RouteData): string {
  const wps = route.waypoints;
  const generatedAt = new Date().toLocaleString("pt-BR");

  // bbox para o iframe do OpenStreetMap
  let mapEmbed = "";
  if (wps.length > 0) {
    const lats = wps.map((w) => w.lat);
    const lngs = wps.map((w) => w.lng);
    const pad = 0.005;
    const minLat = Math.min(...lats) - pad;
    const maxLat = Math.max(...lats) + pad;
    const minLng = Math.min(...lngs) - pad;
    const maxLng = Math.max(...lngs) + pad;
    const marker = `&marker=${wps[0].lat},${wps[0].lng}`;
    const bbox = `${minLng},${minLat},${maxLng},${maxLat}`;
    mapEmbed = `<iframe class="map" src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${marker}" loading="lazy"></iframe>`;
  }

  const steps = wps
    .map((w, i) => {
      const svg = MANEUVER_EMOJI_FREE_SVG[w.maneuver] ?? MANEUVER_EMOJI_FREE_SVG.straight;
      return `
      <li class="step">
        <div class="step-num">${i + 1}</div>
        <div class="step-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>
        </div>
        <div class="step-body">
          <div class="step-meta">
            <span class="tag">${escapeHtml(maneuverLabel(w.maneuver))}</span>
            <span class="tag tag-mono">Marcha ${escapeHtml(w.suggestedGear)}</span>
            <span class="tag tag-mono">Máx ${w.maxSpeed} km/h</span>
            <span class="tag tag-mono tag-muted">${w.lat.toFixed(5)}, ${w.lng.toFixed(5)}</span>
          </div>
          <p class="instruction">${escapeHtml(w.instruction)}</p>
          ${w.observation ? `<p class="observation"><strong>Observação:</strong> ${escapeHtml(w.observation)}</p>` : ""}
        </div>
      </li>`;
    })
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(route.name)} — Demonstrativo Visual · RA Routes</title>
<style>
  :root {
    --bg: #0f172a;
    --surface: #1e293b;
    --surface-2: #273449;
    --border: #334155;
    --text: #f1f5f9;
    --muted: #94a3b8;
    --primary: #38bdf8;
    --accent: #a78bfa;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.5; }
  .wrap { max-width: 960px; margin: 0 auto; padding: 32px 24px 64px; }
  header.hero { display: flex; align-items: center; gap: 16px; padding-bottom: 20px;
    border-bottom: 1px solid var(--border); margin-bottom: 28px; }
  .logo { width: 44px; height: 44px; border-radius: 12px; background: var(--primary);
    display: grid; place-items: center; color: #0b1220; flex-shrink: 0; }
  h1 { font-size: 24px; margin: 0; letter-spacing: -0.01em; }
  .subtitle { font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); margin-top: 4px; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 0 0 24px; }
  .stat { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px; }
  .stat-label { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 0.2em;
    text-transform: uppercase; color: var(--muted); }
  .stat-value { font-size: 22px; font-weight: 600; margin-top: 4px; font-variant-numeric: tabular-nums; }
  .map { width: 100%; height: 360px; border: 1px solid var(--border); border-radius: 14px;
    background: var(--surface); margin-bottom: 28px; }
  h2 { font-size: 14px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted);
    margin: 0 0 14px; font-weight: 600; }
  ol.steps { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
  .step { display: grid; grid-template-columns: 36px 44px 1fr; gap: 12px; align-items: flex-start;
    background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px; }
  .step-num { width: 36px; height: 36px; border-radius: 10px; background: var(--surface-2);
    color: var(--primary); display: grid; place-items: center; font-weight: 700;
    font-family: ui-monospace, monospace; }
  .step-icon { width: 44px; height: 44px; border-radius: 10px; background: rgba(56,189,248,0.12);
    color: var(--primary); display: grid; place-items: center; }
  .step-icon svg { width: 22px; height: 22px; }
  .step-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px;
    background: var(--surface-2); color: var(--text); border: 1px solid var(--border); }
  .tag-mono { font-family: ui-monospace, monospace; }
  .tag-muted { color: var(--muted); }
  .instruction { margin: 0; font-size: 15px; }
  .observation { margin: 8px 0 0; font-size: 12px; color: var(--muted); }
  footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--border);
    font-size: 11px; color: var(--muted); text-align: center;
    font-family: ui-monospace, monospace; letter-spacing: 0.15em; text-transform: uppercase; }
  @media print {
    :root { --bg: #ffffff; --surface: #ffffff; --surface-2: #f1f5f9;
      --border: #e2e8f0; --text: #0f172a; --muted: #64748b; }
    .map { height: 280px; }
    .step { break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <header class="hero">
      <div class="logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"/><path d="M16 6v6"/>
          <rect x="3" y="3" width="18" height="14" rx="2"/>
          <path d="M3 12h18"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>
        </svg>
      </div>
      <div>
        <h1>${escapeHtml(route.name)}</h1>
        <div class="subtitle">RA Routes · Demonstrativo visual · ${escapeHtml(generatedAt)}</div>
      </div>
    </header>

    <section class="stats">
      <div class="stat"><div class="stat-label">Etapas</div><div class="stat-value">${wps.length}</div></div>
      <div class="stat"><div class="stat-label">Vel. máx média</div><div class="stat-value">${
        wps.length ? Math.round(wps.reduce((a, w) => a + w.maxSpeed, 0) / wps.length) : 0
      } km/h</div></div>
      <div class="stat"><div class="stat-label">Tipo</div><div class="stat-value" style="font-size:14px">Orientação por voz + texto</div></div>
    </section>

    ${mapEmbed}

    <h2>Orientações do percurso</h2>
    <ol class="steps">${steps}</ol>

    <footer>RA Routes · Cada orientação acima é exibida em texto e narrada em voz no modo Motorista</footer>
  </div>
</body>
</html>`;
}

export function downloadRouteVisual(route: RouteData) {
  const html = renderRouteVisualHtml(route);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ra-routes-${slugify(route.name)}-demonstrativo.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
