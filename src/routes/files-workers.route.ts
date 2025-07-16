import { Hono } from "hono";
import { ContextExtended } from "../types";

const filesWorkers = new Hono();

// Route to list all files in the bucket
filesWorkers.get("/list", async (ctx: ContextExtended) => {});

// Route to upload a file
filesWorkers.post("/upload", async (ctx: ContextExtended) => {});

// Route to delete a specific file by ID
filesWorkers.delete("/:key", async (ctx: ContextExtended) => {});

// Route to get a specific file by ID
filesWorkers.get("/:key", async (ctx: ContextExtended) => {});

export default filesWorkers;
