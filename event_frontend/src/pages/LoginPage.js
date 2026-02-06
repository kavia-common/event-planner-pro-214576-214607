import React, { useState } from "react";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { Alert } from "../components/Alert";

/**
 * PUBLIC_INTERFACE
 */
export function LoginPage({ auth }) {
  /** Log in form and redirect back to intended page. */
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const from = location.state?.from?.pathname || "/";

  if (auth.user) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    const ok = await auth.login({ email, password });
    if (ok) navigate(from, { replace: true });
  };

  return (
    <div className="container">
      <h1 className="pageTitle">Log in</h1>
      <p className="pageSubtitle">Insert coin to continue. Your token stays in local storage.</p>

      <section className="surface">
        <form className="formGrid" onSubmit={onSubmit}>
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
              autoComplete="current-password"
              required
            />
          </div>

          <div className="field fieldFull" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btnPrimary" type="submit" disabled={auth.loading}>
              {auth.loading ? "Logging in…" : "Log in"}
            </button>
            <Link className="btn btnLink" to="/register">
              Need an account?
            </Link>
          </div>

          {auth.error ? <Alert type="error" title="Login failed" message={auth.error} /> : null}
        </form>
      </section>
    </div>
  );
}
