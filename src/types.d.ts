import { Context } from "hono";

type Bindings = {
    DB: D1Database;
}

export type ContextExtended = Context<{ Bindings: Bindings }>