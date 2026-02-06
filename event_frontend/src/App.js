import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import { Navbar } from "./components/Navbar";
import { RequireAuth } from "./components/RequireAuth";

import { useAuth } from "./hooks/useAuth";

import { EventsListPage } from "./pages/EventsListPage";
import { EventDetailsPage } from "./pages/EventDetailsPage";
import { EventFormPage } from "./pages/EventFormPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

/**
 * PUBLIC_INTERFACE
 */
function App() {
  /** App shell and routing for Event Planner Pro. */
  const auth = useAuth();

  return (
    <BrowserRouter>
      <div className="appShell">
        <Navbar user={auth.user} onLogout={auth.logout} />

        <main className="main">
          <Routes>
            <Route path="/" element={<EventsListPage />} />
            <Route path="/events/:eventId" element={<EventDetailsPage auth={auth} />} />

            <Route
              path="/events/new"
              element={
                <RequireAuth user={auth.user}>
                  <EventFormPage auth={auth} mode="create" />
                </RequireAuth>
              }
            />
            <Route
              path="/events/:eventId/edit"
              element={
                <RequireAuth user={auth.user}>
                  <EventFormPage auth={auth} mode="edit" />
                </RequireAuth>
              }
            />

            <Route path="/login" element={<LoginPage auth={auth} />} />
            <Route path="/register" element={<RegisterPage auth={auth} />} />

            <Route
              path="*"
              element={
                <div className="container">
                  <h1 className="pageTitle">404</h1>
                  <p className="pageSubtitle">You wandered off the map.</p>
                  <a className="btn btnPrimary" href="/">
                    Back to events
                  </a>
                </div>
              }
            />
          </Routes>
        </main>

        <footer className="footer">
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <span>Event Planner Pro • Retro Theme UI</span>
              <span>
                Backend: <code>REACT_APP_API_BASE_URL</code>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
