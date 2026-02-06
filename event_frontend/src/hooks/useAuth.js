import { useCallback, useEffect, useMemo, useState } from "react";
import { apiLogin, apiMe, apiRegister, authStore } from "../api/client";

/**
 * PUBLIC_INTERFACE
 */
export function useAuth() {
  /** Manage auth state (token + user) with restore-on-load behavior. */

  const store = useMemo(() => authStore(), []);
  const [token, setToken] = useState(() => store.getToken());
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  const refreshMe = useCallback(
    async (tkn) => {
      setError("");
      if (!tkn) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const me = await apiMe(tkn);
        setUser(me);
      } catch (e) {
        // token invalid or backend down
        store.clearToken();
        setToken(null);
        setUser(null);
        setError(e.message || "Failed to restore session.");
      } finally {
        setLoading(false);
      }
    },
    [store]
  );

  useEffect(() => {
    refreshMe(token);
  }, [token, refreshMe]);

  const login = useCallback(
    async ({ email, password }) => {
      setError("");
      setLoading(true);
      try {
        const res = await apiLogin({ email, password });
        const tkn = res?.token || res?.access_token || null;
        if (!tkn) throw new Error("Login succeeded but no token returned.");
        store.setToken(tkn);
        setToken(tkn);

        // If backend returns user inline, use it; else fetch /me
        if (res?.user) {
          setUser(res.user);
          setLoading(false);
        } else {
          await refreshMe(tkn);
        }
        return true;
      } catch (e) {
        setError(e.message || "Login failed.");
        setLoading(false);
        return false;
      }
    },
    [refreshMe, store]
  );

  const register = useCallback(
    async ({ email, password, name }) => {
      setError("");
      setLoading(true);
      try {
        const res = await apiRegister({ email, password, name });
        const tkn = res?.token || res?.access_token || null;
        if (!tkn) throw new Error("Registration succeeded but no token returned.");
        store.setToken(tkn);
        setToken(tkn);

        if (res?.user) {
          setUser(res.user);
          setLoading(false);
        } else {
          await refreshMe(tkn);
        }
        return true;
      } catch (e) {
        setError(e.message || "Registration failed.");
        setLoading(false);
        return false;
      }
    },
    [refreshMe, store]
  );

  const logout = useCallback(() => {
    store.clearToken();
    setToken(null);
    setUser(null);
    setError("");
    setLoading(false);
  }, [store]);

  return {
    token,
    user,
    loading,
    error,
    login,
    register,
    logout
  };
}
