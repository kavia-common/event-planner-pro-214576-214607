import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { apiCreateEvent, apiGetEvent, apiUpdateEvent } from "../api/client";
import { Alert } from "../components/Alert";

function toInputValue(dateValue) {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  // yyyy-MM-ddThh:mm
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromInputValue(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString();
}

/**
 * PUBLIC_INTERFACE
 */
export function EventFormPage({ auth, mode }) {
  /** Create/edit event form. Requires auth. */
  const navigate = useNavigate();
  const params = useParams();

  const eventId = params.eventId;
  const isEdit = mode === "edit";

  const titleText = isEdit ? "Edit event" : "Create event";
  const subtitleText = isEdit
    ? "Patch the timeline. Update the event details below."
    : "Spawn a new event into the universe.";

  const [loading, setLoading] = useState(Boolean(isEdit));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [description, setDescription] = useState("");

  const token = auth.token;

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    return true;
  }, [title]);

  useEffect(() => {
    let mounted = true;
    if (!isEdit) return;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const ev = await apiGetEvent(eventId);
        if (!mounted) return;

        setTitle(ev?.title || "");
        setLocation(ev?.location || "");
        setStartTime(toInputValue(ev?.start_time || ev?.startTime || ev?.date));
        setDescription(ev?.description || "");
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
  }, [eventId, isEdit]);

  if (!auth.user) {
    return <Navigate to="/login" replace state={{ from: { pathname: isEdit ? `/events/${eventId}/edit` : "/events/new" } }} />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!canSubmit) {
      setError("Please provide at least a title.");
      return;
    }

    const payload = {
      title: title.trim(),
      location: location.trim() || null,
      start_time: fromInputValue(startTime),
      description: description.trim() || null
    };

    try {
      setSaving(true);
      const res = isEdit ? await apiUpdateEvent(token, eventId, payload) : await apiCreateEvent(token, payload);
      const id = res?.id || eventId;
      setSuccessMsg(isEdit ? "Event updated." : "Event created.");
      navigate(`/events/${id}`, { replace: true });
    } catch (e2) {
      setError(e2.message || "Failed to save event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <h1 className="pageTitle">{titleText}</h1>
      <p className="pageSubtitle">{subtitleText}</p>

      {loading ? (
        <div className="surface card">
          <div className="skeleton" style={{ width: "60%", height: 22, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: "90%", marginBottom: 8 }} />
          <div className="skeleton" style={{ width: "82%", marginBottom: 8 }} />
          <div className="skeleton" style={{ width: "75%", marginBottom: 8 }} />
        </div>
      ) : (
        <section className="surface">
          <form className="formGrid" onSubmit={onSubmit}>
            <div className="field fieldFull">
              <label className="label" htmlFor="title">
                Title *
              </label>
              <input className="input" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="field">
              <label className="label" htmlFor="startTime">
                Start time
              </label>
              <input
                className="input"
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="location">
                Location
              </label>
              <input className="input" id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            <div className="field fieldFull">
              <label className="label" htmlFor="description">
                Description
              </label>
              <textarea
                className="textarea"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What’s the vibe? Dress code? Agenda? Arcade tokens?"
              />
            </div>

            <div className="field fieldFull" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btnPrimary" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button className="btn" type="button" onClick={() => navigate(-1)} disabled={saving}>
                Cancel
              </button>
            </div>

            {error ? <Alert type="error" title="Save failed" message={error} /> : null}
            {successMsg ? <Alert type="success" title="Success" message={successMsg} /> : null}
          </form>
        </section>
      )}
    </div>
  );
}
