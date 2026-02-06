import React, { useEffect, useMemo, useState } from "react";
import { apiListEvents } from "../api/client";
import { Alert } from "../components/Alert";
import { EventCard } from "../components/EventCard";

/**
 * PUBLIC_INTERFACE
 */
export function EventsListPage() {
  /** Browse events. */
  const [q, setQ] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return events;
    return events.filter((e) => {
      const hay = `${e?.title || ""} ${e?.location || ""} ${e?.description || ""}`.toLowerCase();
      return hay.includes(query);
    });
  }, [events, q]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiListEvents();
        if (!mounted) return;
        const list = Array.isArray(res) ? res : res?.items || res?.events || [];
        setEvents(list);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Failed to load events.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="container">
      <h1 className="pageTitle">Events</h1>
      <p className="pageSubtitle">
        Browse upcoming gatherings. View details to RSVP. Sign in to create or edit events.
      </p>

      <section className="surface card" style={{ marginBottom: 14 }}>
        <div className="field fieldFull" style={{ margin: 0 }}>
          <label className="label" htmlFor="q">
            Search
          </label>
          <input
            className="input"
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type to filter by title, location, description…"
          />
        </div>
      </section>

      {loading ? (
        <section className="grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="col6" key={i}>
              <div className="surface card">
                <div className="skeleton" style={{ width: "50%", marginBottom: 12 }} />
                <div className="skeleton" style={{ width: "80%", height: 22, marginBottom: 10 }} />
                <div className="skeleton" style={{ width: "95%", marginBottom: 8 }} />
                <div className="skeleton" style={{ width: "70%", marginBottom: 8 }} />
                <div className="skeleton" style={{ width: "35%", marginTop: 14, height: 38 }} />
              </div>
            </div>
          ))}
        </section>
      ) : error ? (
        <Alert type="error" title="Could not load events" message={error} />
      ) : filtered.length === 0 ? (
        <Alert type="info" title="No events found" message="Try a different search, or create the first event." />
      ) : (
        <section className="grid">
          {filtered.map((event) => (
            <div className="col6" key={event?.id || JSON.stringify(event)}>
              <EventCard event={event} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
