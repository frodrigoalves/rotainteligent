// localStorage persistence for routes & waypoints — no backend.
export type ManeuverType =
  | "start"
  | "right"
  | "left"
  | "straight"
  | "highway"
  | "exit"
  | "terminal"
  | "uturn"
  | "merge"
  | "end";

export interface Waypoint {
  id: string;
  lat: number;
  lng: number;
  instruction: string;
  maneuver: ManeuverType;
  suggestedGear: string;
  maxSpeed: number; // km/h
  observation: string;
}

export interface Route {
  id: string;
  name: string;
  description?: string;
  cyclic?: boolean; // se true, fecha o trajeto (último ponto retorna ao primeiro)
  waypoints: Waypoint[];
  createdAt: number;
  updatedAt: number;
}

const ROUTES_KEY = "ra_routes_v1";
const ACTIVE_KEY = "ra_active_route_id_v1";

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function loadRoutes(): Route[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ROUTES_KEY);
    if (!raw) {
      const seeded = [seedRoute474()];
      localStorage.setItem(ROUTES_KEY, JSON.stringify(seeded));
      localStorage.setItem(ACTIVE_KEY, seeded[0].id);
      return seeded;
    }
    return JSON.parse(raw) as Route[];
  } catch {
    return [];
  }
}

export function saveRoutes(routes: Route[]) {
  localStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
}

export function getActiveRouteId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveRouteId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function seedRoute474(): Route {
  const now = Date.now();
  // Linha 474 — Chácaras Santa Terezinha / Cidade Industrial via Metrô
  // Operadora CONPASS · Contagem/MG · TransCon · Tarifa R$ 6,00
  // Ciclo: bairro → Estação Eldorado (metrô) → Cidade Industrial → retorno.
  // Coordenadas aproximadas (ajustáveis no Gestor por clique e arraste).
  const wps: Waypoint[] = ([
    {
      lat: -19.9012, lng: -44.0915,
      instruction: "Início do percurso no ponto das Chácaras Santa Terezinha. Confira cinto, espelhos e validador.",
      maneuver: "start", suggestedGear: "1ª", maxSpeed: 20,
      observation: "Saída do bairro, atenção a pedestres e ciclistas",
    },
    {
      lat: -19.8978, lng: -44.0876,
      instruction: "Siga em frente pela via principal das Chácaras em direção à Av. Severino Ballesteros.",
      maneuver: "straight", suggestedGear: "2ª", maxSpeed: 30,
      observation: "Trecho residencial, lombadas frequentes",
    },
    {
      lat: -19.8932, lng: -44.0824,
      instruction: "Vire à direita para acessar a Av. Severino Ballesteros.",
      maneuver: "right", suggestedGear: "2ª→3ª", maxSpeed: 40,
      observation: "Cruzamento sinalizado, dê preferência",
    },
    {
      lat: -19.8854, lng: -44.0758,
      instruction: "Continue pela Av. Severino Ballesteros em direção ao centro de Contagem.",
      maneuver: "straight", suggestedGear: "3ª", maxSpeed: 50,
      observation: "Avenida de fluxo médio, mantenha distância",
    },
    {
      lat: -19.8762, lng: -44.0671,
      instruction: "Acesse a Via Expressa de Contagem (sentido BH).",
      maneuver: "merge", suggestedGear: "3ª→4ª", maxSpeed: 60,
      observation: "Verifique retrovisor antes de entrar no fluxo expresso",
    },
    {
      lat: -19.8694, lng: -44.0529,
      instruction: "Siga pela Via Expressa em direção à Estação Eldorado do metrô.",
      maneuver: "highway", suggestedGear: "4ª→5ª", maxSpeed: 80,
      observation: "Mantenha faixa da direita para a próxima saída",
    },
    {
      lat: -19.8716, lng: -44.0432,
      instruction: "Pegue a saída para a Estação Eldorado / Terminal Metropolitano.",
      maneuver: "exit", suggestedGear: "4ª→3ª", maxSpeed: 50,
      observation: "Reduza progressivamente, pista de saída curva",
    },
    {
      lat: -19.8745, lng: -44.0394,
      instruction: "Parada no Terminal Metropolitano Eldorado. Embarque e desembarque de passageiros.",
      maneuver: "terminal", suggestedGear: "Neutro", maxSpeed: 10,
      observation: "Aguarde sinalização do despachante, integração com o metrô",
    },
    {
      lat: -19.8801, lng: -44.0451,
      instruction: "Saia do terminal e siga em direção à Av. Babita Camargos (Cidade Industrial).",
      maneuver: "left", suggestedGear: "1ª→2ª", maxSpeed: 30,
      observation: "Atenção a pedestres na saída do terminal",
    },
    {
      lat: -19.8884, lng: -44.0537,
      instruction: "Continue pela Av. Babita Camargos atendendo aos pontos da Cidade Industrial.",
      maneuver: "straight", suggestedGear: "3ª", maxSpeed: 50,
      observation: "Avenida industrial, atenção a caminhões manobrando",
    },
    {
      lat: -19.8951, lng: -44.0648,
      instruction: "Vire à esquerda na Av. Cardeal Eugênio Pacelli.",
      maneuver: "left", suggestedGear: "2ª→3ª", maxSpeed: 40,
      observation: "Cruzamento movimentado, semáforo presente",
    },
    {
      lat: -19.8997, lng: -44.0762,
      instruction: "Siga em frente pela Cardeal Eugênio Pacelli rumo ao retorno do bairro.",
      maneuver: "straight", suggestedGear: "3ª", maxSpeed: 50,
      observation: "Trecho com paradas frequentes",
    },
    {
      lat: -19.9035, lng: -44.0853,
      instruction: "Vire à direita para retornar pela rota do bairro Chácaras Santa Terezinha.",
      maneuver: "right", suggestedGear: "2ª", maxSpeed: 30,
      observation: "Curva fechada, sinalize com antecedência",
    },
    {
      lat: -19.9012, lng: -44.0915,
      instruction: "Encerramento do ciclo no ponto inicial das Chácaras Santa Terezinha. Aguarde nova partida conforme escala.",
      maneuver: "end", suggestedGear: "Neutro", maxSpeed: 10,
      observation: "Fim de viagem · ciclo completo",
    },
  ] as Omit<Waypoint, "id">[]).map((w) => ({ ...w, id: uid() }));

  return {
    id: uid(),
    name: "Linha 474 — Chácaras Santa Terezinha / Cid. Industrial via Metrô",
    description: "CONPASS · Contagem/MG · TransCon · Tarifa R$ 6,00 · Ciclo via Estação Eldorado",
    cyclic: true,
    waypoints: wps,
    createdAt: now,
    updatedAt: now,
  };
}

export function maneuverLabel(m: ManeuverType): string {
  const map: Record<ManeuverType, string> = {
    start: "Início",
    right: "Direita",
    left: "Esquerda",
    straight: "Em frente",
    highway: "Rodovia",
    exit: "Saída",
    terminal: "Terminal",
    uturn: "Retorno",
    merge: "Acesso",
    end: "Fim",
  };
  return map[m];
}
