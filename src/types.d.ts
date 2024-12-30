import { Context } from "hono";

type Bindings = {
  DB: D1Database;
  R2_BUCKET: blazenote;
};

export type ContextExtended = Context<{ Bindings: Bindings }>;
