import { Hono } from "hono";
import { ContextExtended } from "../types";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const files = new Hono();

// Helper to init the s3 client
function createR2Client(ctx: ContextExtended) {
  const r2 = new S3Client({
    region: "auto",
    endpoint: ctx.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: ctx.env.R2_ACCESS_KEY,
      secretAccessKey: ctx.env.R2_SECRET_KEY,
    },
  });

  const bucket = ctx.env.R2_BUCKET_NAME;

  return { r2, bucket };
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

// Route to generate pre-signed url for upload
files.post("/pre-signed-url", async (ctx: ContextExtended) => {
  try {
    const { r2, bucket } = createR2Client(ctx);
    const { fileName } = await ctx.req.json();
    const fileExtension = fileName.split(".").pop();
    const baseName = fileName.replace(`.${fileExtension}`, "");
    const timestamp = Math.floor(Date.now() / 1000);
    const key = `${timestamp}-${baseName}.${fileExtension}`;

    const url = await getSignedUrl(
      r2,
      new PutObjectCommand({ Bucket: bucket, Key: key })
    );

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    return ctx.json({ key, url }, { headers });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return ctx.json({
      success: false,
      message: `Failed to generate pre-signed URL`,
    });
  }
});

// Route to generate pre-signed url for download
files.get(
  "/pre-signed-url/:fileName",
  async (ctx: ContextExtended) => {
    try {
      const { r2, bucket } = createR2Client(ctx);
      const fileName = ctx.req.param("fileName");

      if (!fileName) {
        throw new Error("File name is required.");
      }

      const url = await getSignedUrl(
        r2,
        new GetObjectCommand({
          Bucket: bucket,
          Key: fileName,
        }),
        { expiresIn: 900 }
      );

      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      };

      return ctx.json({ url }, { headers });
    } catch (error) {
      console.error("Error generating pre-signed URL:", error);
      return ctx.json({
        success: false,
        message: `Failed to generate pre-signed URL`,
      });
    }
  }
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
