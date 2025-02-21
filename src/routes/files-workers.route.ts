import { Hono } from "hono";
import { ContextExtended } from "../types";

const filesWorkers = new Hono();

// TODO: In-Workshop Activities.
// Route to list all files in the bucket
filesWorkers.get("/list", async (ctx: ContextExtended) => {
  return ctx.json({})
});

// TODO: In-Workshop Activities.
// Route to upload a file
filesWorkers.post("/upload", async (ctx: ContextExtended) => {
  return ctx.json({})
});

// TODO: In-Workshop Activities.
// Route to delete a specific file by ID
filesWorkers.delete("/:key", async (ctx: ContextExtended) => {
  return ctx.json({})
});

// TODO: In-Workshop Activities.
// Route to get a specific file by ID
filesWorkers.get("/:key", async (ctx: ContextExtended) => {
  return ctx.json({})
});

export default filesWorkers;
