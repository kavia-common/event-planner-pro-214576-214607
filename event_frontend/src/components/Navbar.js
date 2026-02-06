import React from "react";
import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 */
export function Navbar({ user, onLogout }) {
  /** Top navigation bar with brand + auth actions. */
  return (
    <header className="navbar">
      <div className="container navbarInner">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <div>
            <div className="brandTitle">Event Planner Pro</div>
            <div className="small">Retro RSVP machine</div>
          </div>
        </div>

        <nav className="navLinks" aria-label="Main navigation">
          <Link className="navPill" to="/">
            Events
          </Link>

          {user ? (
            <>
              <Link className="navPill" to="/events/new">
                + Create
              </Link>
              <span className="navUser" title="Signed in user">
                Signed in as <strong>{user?.email || user?.name || "User"}</strong>
              </span>
              <button className="navPill" onClick={onLogout} type="button">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="navPill" to="/login">
                Log in
              </Link>
              <Link className="navPill" to="/register">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
