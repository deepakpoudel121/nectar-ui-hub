// Lightweight fetch wrapper for the FitBrain FastAPI backend.
// Configure the backend URL via VITE_API_URL or by setting `fitbrain.apiUrl`
// in localStorage from the Settings page.

const DEFAULT_API_URL = "https://fitbrain-production.up.railway.app";

export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("fitbrain.apiUrl");
    if (stored) return stored.replace(/\/$/, "");
  }
  const env = (import.meta as any).env?.VITE_API_URL as string | undefined;
  return (env || DEFAULT_API_URL).replace(/\/$/, "");
}

export function setApiUrl(url: string) {
  window.localStorage.setItem("fitbrain.apiUrl", url.replace(/\/$/, ""));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("fitbrain.token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem("fitbrain.token", token);
  else window.localStorage.removeItem("fitbrain.token");
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T = unknown>(
  path: string,
  opts: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = opts;
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };
  if (auth) {
    const token = getToken();
    if (token) h["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${getApiUrl()}${path}`, { ...rest, headers: h });
  const text = await res.text();
  const data = text ? safeParse(text) : null;
  if (!res.ok) {
    const detail =
      (data && (data.detail || data.message)) || res.statusText || "Request failed";
    throw new ApiError(res.status, typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return data as T;
}

function safeParse(t: string): any {
  try { return JSON.parse(t); } catch { return t; }
}

// ---------- Types ----------
export interface SessionSummary {
  id: number;
  notes: string | null;
  perceived_effort: number | null;
  logged_at: string;
}
export interface SessionListResponse {
  total: number;
  page: number;
  page_size: number;
  sessions: SessionSummary[];
}
export interface SetDetail {
  id: number;
  weight: number | null;
  unit: string | null;
  reps: number | null;
  rir: number | null;
  notes: string | null;
  set_order: number | null;
}
export interface ExerciseDetail {
  id: number;
  name: string;
  notes: string | null;
  superset_group: string | null;
  sets: SetDetail[];
}
export interface SessionDetail {
  id: number;
  raw_input: string;
  notes: string | null;
  perceived_effort: number | null;
  logged_at: string;
  exercises: ExerciseDetail[];
}
export interface SetSummary {
  weight: number | null;
  unit: string | null;
  reps: number | null;
  rir: number | null;
  set_order: number | null;
}
export interface ExerciseProgression {
  session_id: number;
  logged_at: string;
  sets: SetSummary[];
}

// ---------- Endpoints ----------
export const Auth = {
  register: (body: { name: string; email: string; password: string }) =>
    api<{ "access token": string; token_type: string }>("/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    api<{ "access token": string; token_type: string }>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify(body),
    }),
};

export const Workouts = {
  log: (workout: string) =>
    api<any>("/workouts/", { method: "POST", body: JSON.stringify({ workout }) }),
  list: (page = 1, page_size = 20) =>
    api<SessionListResponse>(`/workouts?page=${page}&page_size=${page_size}`),
  detail: (id: number | string) => api<SessionDetail>(`/workouts/${id}`),
  progression: (name: string) =>
    api<ExerciseProgression[]>(`/workouts/exercise/${encodeURIComponent(name)}`),
};
