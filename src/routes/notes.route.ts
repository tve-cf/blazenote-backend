import { Hono } from "hono";
import { ContextExtended } from "../types";

const notes = new Hono();

notes.get("/", async (ctx: ContextExtended) => {});

notes.get("/:id", async (ctx: ContextExtended) => {});

notes.post("/", async (ctx: ContextExtended) => {});

notes.put("/:id", async (ctx: ContextExtended) => {});

notes.delete("/:id", async (ctx: ContextExtended) => {});

export default notes;
