// Minimal PostgREST-flavoured client for the Neon Data API, used by the MCP
// tool handlers and other Vercel functions. RLS is enforced by the Data API
// off the caller's JWT, so pass the end-user access token when available.

const DATA_API = process.env.NEON_DATA_API_URL!; // e.g. https://...apirest.../neondb/rest/v1

type Filter = { col: string; val: string | number | boolean | null };

function qs(filters: Filter[]): string {
  return filters
    .map((f) => `&${encodeURIComponent(f.col)}=eq.${encodeURIComponent(String(f.val))}`)
    .join("");
}

async function req(path: string, init: RequestInit, token?: string) {
  const res = await fetch(`${DATA_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: token ?? "",
      Authorization: `Bearer ${token ?? ""}`,
      ...(init.headers || {}),
    },
  });
  if (res.status === 204) return { data: null, error: null };
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) return { data: null, error: { message: (data && data.message) || res.statusText, status: res.status } };
  return { data, error: null };
}

export const db = (token?: string) => ({
  async select(table: string, columns = "*", filters: Filter[] = [], order?: { col: string; asc: boolean }, limit?: number) {
    let p = `/${table}?select=${encodeURIComponent(columns)}`;
    if (filters.length) p += qs(filters);
    if (order) p += `&order=${order.col}.${order.asc ? "asc" : "desc"}`;
    if (limit) p += `&limit=${limit}`;
    return req(p, { method: "GET" }, token);
  },
  async selectSingle(table: string, columns = "*", filters: Filter[] = []) {
    const r = await req(`/${table}?select=${encodeURIComponent(columns)}${qs(filters)}`, {
      method: "GET", headers: { Accept: "application/vnd.pgrst.object+json" },
    }, token);
    return { data: r.data, error: r.error };
  },
  async insert(table: string, rows: Record<string, any> | Record<string, any>[]) {
    return req(`/${table}`, {
      method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(rows),
    }, token);
  },
  async update(table: string, patch: Record<string, any>, filters: Filter[]) {
    return req(`/${table}?${qs(filters).slice(1)}`, {
      method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(patch),
    }, token);
  },
  async remove(table: string, filters: Filter[]) {
    return req(`/${table}?${qs(filters).slice(1)}`, { method: "DELETE" }, token);
  },
});
