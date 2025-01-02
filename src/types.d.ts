import { Context } from "hono";

type Bindings = {
  DB: D1Database;
  R2_BUCKET: R2Bucket; // R2_BUCKET binds to toml [[r2_buckets]] binding
  R2_ACCESS_KEY: string;
  R2_SECRET_KEY: string;
};

export type ContextExtended = Context<{ Bindings: Bindings }>;