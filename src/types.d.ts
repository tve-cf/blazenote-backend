import { Context } from "hono";

type Bindings = {
  CLOUDFLARE_API_TOKEN: string
  DB: D1Database;
  R2_BUCKET: R2Bucket; // R2_BUCKET binds to toml [[r2_buckets]] binding
  R2_ACCESS_KEY: string;
  R2_SECRET_KEY: string;
  R2_ENDPOINT: string;
  R2_BUCKET_NAME: string;
  AI: Ai;
};

export type ContextExtended = Context<{ Bindings: Bindings }>;