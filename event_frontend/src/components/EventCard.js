import React from "react";
import { Link } from "react-router-dom";

function formatDateTime(value) {
  if (!value) return "TBD";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

/**
 * PUBLIC_INTERFACE
 */
export function EventCard({ event }) {
  /** Render an event summary card. */
  const title = event?.title || "Untitled Event";
  const when = formatDateTime(event?.start_time || event?.startTime || event?.date);
  const where = event?.location || "Somewhere (not specified)";
  const description = event?.description || "";

  return (
    <article className="surface card">
      <div className="kicker">
        <span className="kickerDot" aria-hidden="true" />
        <span>{when}</span>
      </div>

      <div className="cardTitleRow">
        <h3 className="cardTitle">{title}</h3>
        <span className="small">{where}</span>
      </div>

      <p className="cardMeta">
        {description ? description.slice(0, 140) + (description.length > 140 ? "…" : "") : "No description yet."}
      </p>

      <div className="cardActions">
        <Link className="btn btnPrimary" to={`/events/${event?.id}`}>
          View details
        </Link>
      </div>
    </article>
  );
}
