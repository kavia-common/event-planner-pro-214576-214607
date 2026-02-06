import React, { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { Alert } from "../components/Alert";

/**
 * PUBLIC_INTERFACE
 */
export function RegisterPage({ auth }) {
  /** Registration form. */
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (auth.user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    const ok = await auth.register({ name, email, password });
    if (ok) navigate("/", { replace: true });
  };

  return (
    <div className="container">
      <h1 className="pageTitle">Register</h1>
      <p className="pageSubtitle">New player detected. Create a profile to create events and RSVP.</p>

      <section className="surface">
        <form className="formGrid" onSubmit={onSubmit}>
          <div className="field fieldFull">
            <label className="label" htmlFor="name">
              Display name (optional)
            </label>
            <input
              className="input"
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="nickname"
              placeholder="e.g., Alex"
            />
          </div>

          <div className="field fieldFull">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              className="input"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="field fieldFull">
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              className="input"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
            <div className="small">Tip: use at least 6 characters.</div>
          </div>

          <div className="field fieldFull" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btnPrimary" type="submit" disabled={auth.loading}>
              {auth.loading ? "Registering…" : "Register"}
            </button>
            <Link className="btn btnLink" to="/login">
              Already have an account?
            </Link>
          </div>

          {auth.error ? <Alert type="error" title="Registration failed" message={auth.error} /> : null}
        </form>
      </section>
    </div>
  );
}
