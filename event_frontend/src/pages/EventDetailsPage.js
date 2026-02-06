import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { apiDeleteEvent, apiGetEvent, apiRsvpNo, apiRsvpYes } from "../api/client";
import { Alert } from "../components/Alert";

function formatDateTime(value) {
  if (!value) return "TBD";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

/**
 * PUBLIC_INTERFACE
 */
export function EventDetailsPage({ auth }) {
  /** View event details and RSVP. */
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const token = auth.token;

  const when = useMemo(() => formatDateTime(event?.start_time || event?.startTime || event?.date), [event]);
  const where = event?.location || "Somewhere (not specified)";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const ev = await apiGetEvent(eventId);
        if (!mounted) return;
        setEvent(ev);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Failed to load event.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  const onRsvp = async (status) => {
    if (!auth.user) {
      navigate("/login", { state: { from: { pathname: `/events/${eventId}` } } });
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (status === "yes") {
        await apiRsvpYes(token, eventId);
        setNotice("RSVP saved: YES. See you there!");
      } else {
        await apiRsvpNo(token, eventId);
        setNotice("RSVP saved: NO. Maybe next time.");
      }
    } catch (e) {
      setError(e.message || "Failed to RSVP.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!auth.user) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm("Delete this event? This cannot be undone.");
    if (!ok) return;

    setBusy(true);
    setError("");
    try {
      await apiDeleteEvent(token, eventId);
      navigate("/", { replace: true });
    } catch (e) {
      setError(e.message || "Failed to delete event.");
    } finally {
      setBusy(false);
    }
  };

  if (!eventId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="pageTitle">Event details</h1>
          <p className="pageSubtitle">Inspect the mission briefing. RSVP below.</p>
        </div>
        <Link className="btn" to="/">
          ← Back
        </Link>
      </div>

      {loading ? (
        <div className="surface card">
          <div className="skeleton" style={{ width: "85%", height: 24, marginBottom: 10 }} />
          <div className="skeleton" style={{ width: "35%", marginBottom: 8 }} />
          <div className="skeleton" style={{ width: "55%", marginBottom: 8 }} />
          <div className="skeleton" style={{ width: "95%", marginTop: 14, height: 18 }} />
          <div className="skeleton" style={{ width: "85%", marginTop: 10, height: 18 }} />
        </div>
      ) : error ? (
        <Alert type="error" title="Could not load event" message={error} />
      ) : !event ? (
        <Alert type="info" title="Event not found" message="This event may have been deleted." />
      ) : (
        <>
          <section className="surface card">
            <div className="kicker">
              <span className="kickerDot" aria-hidden="true" />
              <span>{when}</span>
              <span style={{ opacity: 0.6 }}>•</span>
              <span>{where}</span>
            </div>

            <h2 className="cardTitle" style={{ marginTop: 12 }}>
              {event?.title || "Untitled Event"}
            </h2>

            <p className="cardMeta">{event?.description || "No description yet."}</p>

            <hr className="hr" />

            <div className="cardActions">
              <button className="btn btnPrimary" type="button" onClick={() => onRsvp("yes")} disabled={busy}>
                RSVP: Yes
              </button>
              <button className="btn" type="button" onClick={() => onRsvp("no")} disabled={busy}>
                RSVP: No
              </button>

              {auth.user ? (
                <>
                  <Link className="btn" to={`/events/${eventId}/edit`}>
                    Edit
                  </Link>
                  <button className="btn btnDanger" type="button" onClick={onDelete} disabled={busy}>
                    Delete
                  </button>
                </>
              ) : (
                <span className="small">Log in to edit or RSVP faster.</span>
              )}
            </div>

            {notice ? <Alert type="success" title="Saved" message={notice} /> : null}
            {error ? <Alert type="error" title="Action failed" message={error} /> : null}
          </section>

          <div className="small" style={{ marginTop: 14 }}>
            Event ID: <code>{eventId}</code>
          </div>
        </>
      )}
    </div>
  );
}
