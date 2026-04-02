/**
 * Production-safe logger utility
 * Logs are shown in development mode OR when ?debug=true is in the URL
 */

const isDev = import.meta.env.DEV;
const isDebug = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug");

const enabled = isDev || isDebug;

export const logger = {
  error: (...args: unknown[]) => {
    if (enabled) console.error(...args);
  },
  log: (...args: unknown[]) => {
    if (enabled) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (enabled) console.warn(...args);
  },
  info: (...args: unknown[]) => {
    if (enabled) console.info(...args);
  },
};
