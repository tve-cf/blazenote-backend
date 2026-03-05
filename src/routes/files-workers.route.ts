import { Hono } from "hono";
import { ContextExtended } from "../types";

export const filesWorkers = new Hono();

// Placeholder endpoints - we'll implement these
filesWorkers.post("/upload", async (ctx: ContextExtended) => {
  return ctx.json({});
});

filesWorkers.get("/:key", async (ctx: ContextExtended) => {
  return ctx.json({});
});

filesWorkers.delete("/:key", async (ctx: ContextExtended) => {
  return ctx.json({});
});

filesWorkers.get("/list", async (ctx: ContextExtended) => {
  return ctx.json({});
});

export default filesWorkers;