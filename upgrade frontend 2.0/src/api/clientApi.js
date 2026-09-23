import { initialState } from "../data/clinicalData.js";

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export function isTokenExpired(token) {
  if (!token || typeof token !== "string") return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function apiHeaders(extra = {}) {
  const token = localStorage.getItem("carepath-access-token");
  if (token && isTokenExpired(token)) {
    localStorage.removeItem("carepath-access-token");
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("carepath-session-expired", {
          detail: { message: "Invalid or expired token", status: 401 }
        })
      );
    }
  }
  const activeToken = localStorage.getItem("carepath-access-token");
  return {
    Accept: "application/json",
    ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
    ...extra
  };
}

export async function apiFetch(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: apiHeaders(options.headers || {})
    });
  } catch (networkErr) {
    const err = new Error(`Cannot reach the CarePath server at ${API_BASE}`);
    err.isNetworkError = true;
    err.cause = networkErr;
    console.error(`[CarePath Network Error] Cannot reach the CarePath server at ${API_BASE}${path}:`, networkErr);
    throw err;
  }
  if (!res.ok) {
    let message = "Backend request failed";
    let code = undefined;
    let body = null;
    try {
      body = await res.json();
      if (body) {
        if (body.error) message = body.error;
        if (body.code) code = body.code;
      }
    } catch {
      try {
        const text = await res.text();
        if (text) message = text;
      } catch {}
    }
    console.error(`[CarePath API Error] ${options.method || "GET"} ${path} returned HTTP ${res.status}:`, {
      status: res.status,
      code,
      body,
      message
    });
    if (res.status === 401) {
      localStorage.removeItem("carepath-access-token");
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("carepath-session-expired", {
            detail: { message, code, status: 401 }
          })
        );
      }
    }
    const err = new Error(code ? `${message} (${code})` : message);
    err.status = res.status;
    err.code = code;
    err.body = body;
    throw err;
  }
  return res;
}

export function getSharePin(s) {
  if (s?.pin && /^\d{6}$/.test(String(s.pin).trim())) return String(s.pin).trim();
  let hash = 0;
  const str = String(s?.id || "carepath-verbal-otp");
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String((Math.abs(hash) % 900000) + 100000);
}

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("carepath-state-v2"));
    if (saved) {
      if (Array.isArray(saved.shares)) {
        saved.shares = saved.shares.map(s => ({
          ...s,
          pin: s.pin || getSharePin(s)
        }));
      }
      return saved;
    }
    return initialState;
  } catch {
    return initialState;
  }
}

export function saveState(s) {
  localStorage.setItem("carepath-state-v2", JSON.stringify(s));
  const token = localStorage.getItem("carepath-access-token");
  if (token) {
    apiFetch("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s)
    }).catch(err => console.warn("CarePath state sync failed", err));
  }
}

export async function storeFile(id, file) {
  const body = new FormData();
  body.append("id", id);
  body.append("file", file, file.name);
  await apiFetch("/api/files", { method: "POST", body });
}

export async function getStoredFile(id) {
  const res = await apiFetch(`/api/files/${encodeURIComponent(id)}`);
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await res.json();
    if (!data.url) throw new Error(data.error || "File URL not available");
    const fileRes = await fetch(data.url);
    if (!fileRes.ok) throw new Error("Could not download file from storage provider");
    return {
      blob: await fileRes.blob(),
      type: fileRes.headers.get("content-type") || "application/octet-stream",
      name: data.name
    };
  }
  return { blob: await res.blob(), type: contentType };
}
