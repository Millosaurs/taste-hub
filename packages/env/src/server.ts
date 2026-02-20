import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    DATABASE_AUTH_TOKEN: z.string().min(1),
    CORS_ORIGIN: z.string().min(1),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  // Skip validation during build phase - env vars must be set in Vercel project settings
  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" ||
    process.env.CI === "true" ||
    process.env.CI === "1" ||
    process.env.VERCEL === "1" ||
    !!process.env.VERCEL_ENV, // If any Vercel env is set, we're on Vercel
});
