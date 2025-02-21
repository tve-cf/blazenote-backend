import { Hono } from "hono";
import { ContextExtended } from "../types";
// TODO: In-Workshop Activities.
// import {
//   S3Client,
//   PutObjectCommand,
//   GetObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const files = new Hono();

// TODO: In-Workshop Activities.
// Helper to init the s3 client
function createR2Client(ctx: ContextExtended) {
}

// Route to get a list of files attached to a note from db
files.get("/list/:noteId", async (ctx: ContextExtended) => {
  const db = ctx.env.DB;
  const noteId = ctx.req.param("noteId");

  try {
    const query = "SELECT id, name FROM file WHERE note_id = ?";
    const results = await db.prepare(query).bind(noteId).all();

    if (!results.success || results.results.length === 0) {
      return ctx.json({
        success: true,
        names: [],
        message: "No files found for the specified note id",
      });
    }

    const names = results.results.map((row) => ({
      id: row.id,
      name: row.name,
    }));

    return ctx.json({ success: true, names });
  } catch (error) {
    console.error("Error retrieving files:", error);
    return ctx.json({
      success: false,
      message: "Error retrieving files",
    });
  }
});

// TODO: In-Workshop Activities.
// Route to generate pre-signed url for upload
files.post("/pre-signed-url", async (ctx: ContextExtended) => {
});

// TODO: In-Workshop Activities.
// Route to generate pre-signed url for download
files.get(
);

// Route to save files metadata to file table
files.post("/save", async (ctx: ContextExtended) => {
  try {
    const { noteId, objectKey } = await ctx.req.json();
    console.log("Received noteId:", noteId);
    console.log("Received file key:", objectKey);

    const id = crypto.randomUUID();
    const db = ctx.env.DB;

    // Get the current Unix timestamp
    const createdAt = Math.floor(Date.now() / 1000);

    // Insert the file metadata into the 'file' table
    const response = await db
      .prepare(
        `INSERT INTO file (id, note_id, name, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(id, noteId, objectKey, createdAt, createdAt)
      .run();

    if (response && response.success) {
      return ctx.json({ message: "File metadata saved successfully" });
    } else {
      return ctx.json({ message: "Failed to save file metadata" });
    }
  } catch (error) {
    console.error(`Failed to save file metadata. Reason: ${error}`);
    return ctx.json({
      success: false,
      message: `Failed to save file metadata`,
    });
  }
});

// Delete attachment based on noteId
files.delete("/:noteId", async (ctx: ContextExtended) => {
  const db = ctx.env.DB;
  const noteId = ctx.req.param("noteId");

  try {
    // Fetch files associated with the noteId
    const query = "SELECT id, name FROM file WHERE note_id = ?";
    const results = await db.prepare(query).bind(noteId).all();

    if (!results.success || results.results.length === 0) {
      return ctx.json({
        success: false,
        message: `No files found for: ${noteId}`,
      });
    }

    const names = results.results.map((row) => row.name as string);

    // Parallel deletion of files
    const deletePromises = names.map((name) =>
      ctx.env.R2_BUCKET.delete(name).catch((error) => {
        console.error(`Error deleting file ${name}:`, error.message);
      })
    );
    await Promise.all(deletePromises);

    // Return success response
    return ctx.json({
      success: true,
      message: "All files deleted.",
    });
  } catch (error) {
    console.error(`Failed to process files for ${noteId}: ${error}`);
    return ctx.json({
      success: false,
      message: `Failed to process files for deletion`,
    });
  }
});

export default files;
