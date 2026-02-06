/**
 * Retro Event Planner Pro - API Client
 *
 * Note: The backend OpenAPI spec available in this repo is currently minimal.
 * This client implements the expected endpoints (auth, events CRUD, RSVP).
 *
 * Env var:
 * - REACT_APP_API_BASE_URL: base URL for backend, e.g. "http://localhost:3001"
 */

const TOKEN_KEY = "epp_token";

function getApiBaseUrl() {
  return process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";
}

function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (!token) {
    window.localStorage.removeItem(TOKEN_KEY);
  } else {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

async function request(path, { method = "GET", token, body, headers = {} } = {}) {
  const url = `${getApiBaseUrl()}${path}`;

  const finalHeaders = {
    Accept: "application/json",
    ...headers
  };

  // Only set JSON content-type when sending a body
  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let data = null;
  if (isJson) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = text ? { detail: text } : null;
  }

  if (!res.ok) {
    const message =
      (data && (data.detail || data.message || data.error)) ||
      `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// PUBLIC_INTERFACE
export function authStore() {
  /** Token storage helpers. */
  return {
    getToken,
    setToken,
    clearToken: () => setToken(null)
  };
}

// PUBLIC_INTERFACE
export async function apiLogin({ email, password }) {
  /** Log in and return {token, user?}. */
  return request("/auth/login", { method: "POST", body: { email, password } });
}

// PUBLIC_INTERFACE
export async function apiRegister({ email, password, name }) {
  /** Register and return {token, user?}. */
  return request("/auth/register", { method: "POST", body: { email, password, name } });
}

// PUBLIC_INTERFACE
export async function apiMe(token) {
  /** Fetch current user profile. */
  return request("/auth/me", { method: "GET", token });
}

// PUBLIC_INTERFACE
export async function apiListEvents({ q } = {}) {
  /** List events (optionally filtered). */
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  return request(`/events${qs}`, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function apiGetEvent(eventId) {
  /** Get event details by id. */
  return request(`/events/${encodeURIComponent(eventId)}`, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function apiCreateEvent(token, payload) {
  /** Create event. Requires auth. */
  return request("/events", { method: "POST", token, body: payload });
}

// PUBLIC_INTERFACE
export async function apiUpdateEvent(token, eventId, payload) {
  /** Update event. Requires auth. */
  return request(`/events/${encodeURIComponent(eventId)}`, {
    method: "PUT",
    token,
    body: payload
  });
}

// PUBLIC_INTERFACE
export async function apiDeleteEvent(token, eventId) {
  /** Delete event. Requires auth. */
  return request(`/events/${encodeURIComponent(eventId)}`, { method: "DELETE", token });
}

// PUBLIC_INTERFACE
export async function apiRsvpYes(token, eventId) {
  /** RSVP yes for an event. Requires auth. */
  return request(`/events/${encodeURIComponent(eventId)}/rsvp`, {
    method: "POST",
    token,
    body: { status: "yes" }
  });
}

// PUBLIC_INTERFACE
export async function apiRsvpNo(token, eventId) {
  /** RSVP no for an event. Requires auth. */
  return request(`/events/${encodeURIComponent(eventId)}/rsvp`, {
    method: "POST",
    token,
    body: { status: "no" }
  });
}
