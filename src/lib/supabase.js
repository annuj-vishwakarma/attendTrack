// ─────────────────────────────────────────────────────────────
// Supabase REST client (no npm package needed)
// Reads credentials from .env  →  REACT_APP_SUPABASE_URL
//                                  REACT_APP_SUPABASE_ANON_KEY
// ─────────────────────────────────────────────────────────────

const URL  = process.env.REACT_APP_SUPABASE_URL;
const ANON = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isConfigured =
  URL  && URL  !== "https://YOUR_PROJECT_ID.supabase.co" &&
  ANON && ANON !== "YOUR_ANON_PUBLIC_KEY_HERE";

const BASE_HEADERS = {
  "Content-Type":  "application/json",
  "apikey":        ANON,
  "Authorization": `Bearer ${ANON}`,
  "Prefer":        "return=representation",
};

async function request(path, options = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...options,
    headers: { ...BASE_HEADERS, ...(options.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  // DELETE returns 204 No Content
  if (res.status === 204) return true;
  return res.json();
}

// ─── CRUD helpers ─────────────────────────────────────────────

/** SELECT rows from a table. query = PostgREST query string */
export const dbSelect = (table, query = "") =>
  request(`${table}?${query}`);

/** INSERT one or many rows */
export const dbInsert = (table, body) =>
  request(table, { method: "POST", body: JSON.stringify(body) });

/** UPDATE rows matching match object  e.g. { id: 'abc' } */
export const dbUpdate = (table, match, body) => {
  const qs = Object.entries(match)
    .map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`)
    .join("&");
  return request(`${table}?${qs}`, { method: "PATCH", body: JSON.stringify(body) });
};

/** UPSERT — insert or update on conflict column(s) */
export const dbUpsert = (table, body, onConflict) =>
  request(`${table}?on_conflict=${onConflict}`, {
    method: "POST",
    headers: { "Prefer": "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(body),
  });

/** DELETE rows matching match object */
export const dbDelete = (table, match) => {
  const qs = Object.entries(match)
    .map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`)
    .join("&");
  return request(`${table}?${qs}`, { method: "DELETE" });
};
