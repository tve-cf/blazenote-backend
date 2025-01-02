import { Context } from "hono";

type Bindings = {
  DB: D1Database;
  R2_BUCKET: blazenote;
  R2_ACCESS_KEY: string;
  R2_SECRET_KEY: string;
};

export type ContextExtended = Context<{ Bindings: Bindings }>;
