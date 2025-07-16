import { Hono } from "hono";
import { ContextExtended } from "../types";

const files = new Hono();

// Route to get a list of files attached to a note from db
files.get("/list/:noteId", async (ctx: ContextExtended) => {});

// Route to generate pre-signed url for upload
files.post("/pre-signed-url", async (ctx: ContextExtended) => {});

// Route to generate pre-signed url for download
files.get("/pre-signed-url/:fileName", async (ctx: ContextExtended) => {});

// Route to save files metadata to file table
files.post("/save", async (ctx: ContextExtended) => {});

// Delete attachment based on noteId
files.delete("/:noteId", async (ctx: ContextExtended) => {});

export default files;
