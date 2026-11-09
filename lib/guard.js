import { getCurrentUser } from "./session";
import { HttpError, errorResponse, json } from "./http";

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

export const ADMIN = ["admin"];
export const STAFF = ["admin", "editor"];
export const ALL_ROLES = ["admin", "editor", "author"];

/**
 * Wraps an admin API handler: session check on every request, role check,
 * Origin + CSRF token check on state-changing requests, generic error output.
 */
export function adminRoute(handler, { roles } = {}) {
  return async (req, ctx) => {
    try {
      const user = await getCurrentUser();
      if (!user) return json({ error: "Unauthorized" }, 401);
      if (roles && !roles.includes(user.role)) return json({ error: "Forbidden" }, 403);

      if (!SAFE.has(req.method)) {
        const origin = req.headers.get("origin");
        const host = req.headers.get("host");
        let originHost = "";
        try {
          originHost = origin ? new URL(origin).host : "";
        } catch {
          originHost = "";
        }
        if (!origin || !host || originHost !== host) throw new HttpError(403, "Forbidden");
        const token = req.headers.get("x-csrf-token");
        if (!token || !user.csrf || token !== user.csrf) throw new HttpError(403, "Forbidden");
      }
      return await handler(req, { user, params: ctx?.params || {} });
    } catch (e) {
      return errorResponse(e);
    }
  };
}
