"use client";
import { createContext, useCallback, useContext, useMemo } from "react";

const Ctx = createContext(null);

export function AdminProvider({ csrf, user, siteUrl, children }) {
  const api = useCallback(
    async (path, { method = "GET", body, form } = {}) => {
      const headers = {};
      if (method !== "GET") headers["x-csrf-token"] = csrf;
      let payload;
      if (form) payload = form;
      else if (body !== undefined) {
        headers["Content-Type"] = "application/json";
        payload = JSON.stringify(body);
      }
      const res = await fetch(path, { method, headers, body: payload, credentials: "same-origin" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.href = "/admin/login";
        throw new Error("Session expired. Please sign in again.");
      }
      if (!res.ok) throw new Error(data.error || "Request failed.");
      return data;
    },
    [csrf]
  );
  const value = useMemo(() => ({ api, user, siteUrl }), [api, user, siteUrl]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  return useContext(Ctx);
}
