/**
 * Shared API configuration constants.
 * In local development, defaults to "http://localhost:3001".
 * In production (Vercel deployment), resolves to window.location.origin.
 */
const metaEnv = (import.meta as unknown as { env?: Record<string, string | boolean> }).env;

const isProd =
  typeof metaEnv?.PROD !== "undefined"
    ? Boolean(metaEnv.PROD)
    : typeof process !== "undefined" && process.env?.NODE_ENV === "production";

export const API_BASE_URL =
  (typeof metaEnv?.VITE_API_BASE_URL === "string" ? metaEnv.VITE_API_BASE_URL : "") ||
  (isProd
    ? typeof window !== "undefined"
      ? window.location.origin
      : ""
    : "http://localhost:3001");

export const JSON_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
};
