/**
 * Retro Event Planner Pro - API Client
 *
 * This client matches the FastAPI backend implemented in event_backend:
 * - POST /auth/register  { email, password, full_name }
 * - POST /auth/login     { email, password }
 * - GET  /events
 * - POST /events         (Bearer)
 * - PUT  /events/{id}    (Bearer)
 * - DELETE /events/{id}  (Bearer)
 * - PUT  /events/{event_id}/rsvps/me     { status: going|interested|declined } (Bearer)
 * - DELETE /events/{event_id}/rsvps/me   (Bearer)
 *
 * Env var:
 * - REACT_APP_API_BASE_URL: base URL for backend, e.g. "http://localhost:3001"
 */

const TOKEN_KEY = "epp_token";

function getApiBaseUrl() {
  // Default to the backend preview URL if the env var isn't set.
  // The orchestrator should set REACT_APP_API_BASE_URL in the real .env for this container.
  return (
    process.env.REACT_APP_API_BASE_URL ||
    "https://vscode-internal-22662-qa.qa01.cloud.kavia.ai:3001"
  );
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
  /** Log in and return TokenResponse: { access_token, token_type, user }. */
  return request("/auth/login", { method: "POST", body: { email, password } });
}

// PUBLIC_INTERFACE
export async function apiRegister({ email, password, full_name }) {
  /** Register and return TokenResponse: { access_token, token_type, user }. */
  return request("/auth/register", {
    method: "POST",
    body: { email, password, full_name }
  });
}

// PUBLIC_INTERFACE
export async function apiListEvents() {
  /** List events. */
  return request("/events", { method: "GET" });
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
export async function apiSetMyRsvp(token, eventId, status) {
  /** Set RSVP status for current user. Requires auth. */
  return request(`/events/${encodeURIComponent(eventId)}/rsvps/me`, {
    method: "PUT",
    token,
    body: { status }
  });
}

// PUBLIC_INTERFACE
export async function apiDeleteMyRsvp(token, eventId) {
  /** Remove RSVP for current user. Requires auth. */
  return request(`/events/${encodeURIComponent(eventId)}/rsvps/me`, {
    method: "DELETE",
    token
  });
}
