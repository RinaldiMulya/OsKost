import pino from "pino";

/**
 * Centralized Pino Logger untuk OsKost.
 *
 * - Development: Pretty-print berwarna via `pino-pretty` (mudah dibaca di terminal).
 * - Production: JSON terstruktur murni (optimal untuk Vercel Logs / Axiom / Grafana Loki).
 *
 * Penggunaan:
 * ```ts
 * import logger from "@/lib/logger";
 * const log = logger.child({ module: "nama-modul" });
 *
 * log.info("Pesan informasi");
 * log.warn({ userId }, "Peringatan dengan konteks");
 * log.error({ err: error, invoiceId }, "Deskripsi error");
 * ```
 */
const logger = pino({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  ...(process.env.NODE_ENV !== "production" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  }),
});

export default logger;
