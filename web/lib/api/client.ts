import { createClient } from "@/lib/supabase/client";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function apiRequest(path: string, options: RequestOptions = {}) {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error ?? `Request failed with status ${res.status}`);
  }

  return json.data;
}

export const api = {
  get: (path: string) => apiRequest(path),
  post: (path: string, body?: unknown) => apiRequest(path, { method: "POST", body }),
  patch: (path: string, body?: unknown) => apiRequest(path, { method: "PATCH", body }),
  delete: (path: string) => apiRequest(path, { method: "DELETE" }),
};
