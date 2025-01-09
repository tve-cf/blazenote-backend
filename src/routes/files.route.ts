import { Hono } from "hono";
import { ContextExtended } from "../types";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const files = new Hono<ContextExtended>();

// Route to get all files (empty list for now)
/*files.get("/", (ctx) => {
  return ctx.json([]);
});
*/

// Route to get a list of object keys (files) for a note id
files.get("/list/:note_id", async (ctx) => {
  const db = ctx.env.DB;
  const noteId = ctx.req.param("note_id");

  try {
    const query = "SELECT id, name FROM file WHERE note_id = ?";
    console.log(`Executing query: ${query} with note_id = ${noteId}`); // Log the query and parameter

    const results = await db.prepare(query).bind(noteId).all();

    if (!results.success || results.results.length === 0) {
      return ctx.json({
        success: true,
        names: [],
        message: "No files found for the specified note_id",
      });
    }

    const names = results.results.map((row) => ({
      id: row.id,
      name: row.name,
    }));

    return ctx.json({ success: true, names });
  } catch (error) {
    return ctx.json({
      success: false,
      message: "Error retrieving files",
      error: error.message,
    });
  }
});

// Route to upload a file
files.post("/upload", async (ctx) => {
  const formData = await ctx.req.formData();
  const file = formData.get("file"); // Assuming 'file' is the key in the form

  if (!file) {
    return ctx.json({ success: false, message: "No file uploaded" });
  }

  // Append timestamp to the file name to ensure uniqueness
  const timestamp = Date.now();
  const uniqueFilename = `${timestamp}-${file.name}`;

  try {
    // Upload the file with the new unique filename
    await ctx.env.R2_BUCKET.put(uniqueFilename, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    return ctx.json({
      success: true,
      message: "File uploaded successfully",
      filename: uniqueFilename,
    });
  } catch (error) {
    return ctx.json({
      success: false,
      message: "Error uploading file",
      error: error.message,
    });
  }
});

// Route to generate pre-signed url
files.post("/pre-signed-url", async (ctx) => {
  try {
    const { r2, bucket } = createR2Client(ctx);
    const { fileName } = await ctx.req.json(); // Extract the file name from the request body

    if (!fileName) {
      throw new Error("File name is required.");
    }

    // Extract the file extension
    const fileExtension = fileName.split(".").pop();
    const baseName = fileName.replace(`.${fileExtension}`, "");

    // Generate the key with timestamp
    const timestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp
    const key = `${timestamp}-${baseName}.${fileExtension}`;

    // Generate the signed URL
    const url = await getSignedUrl(
      r2,
      new PutObjectCommand({ Bucket: bucket, Key: key })
    );

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    return ctx.json({ key, url }, { headers });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return ctx.json(
      { message: "Failed to generate pre-signed URL", error: error.message },
      { status: 500 }
    );
  }
});

// Route to delete a specific file by ID
files.delete("/:id", async (ctx) => {
  const filename = ctx.req.param("id"); // Use ctx.req.param() to access the URL parameter

  if (!filename) {
    return ctx.json({
      success: false,
      message: "No file key provided",
    });
  }

  try {
    // Attempt to delete the file from the R2 bucket
    await ctx.env.R2_BUCKET.delete(filename);

    return ctx.json({
      success: true,
      message: `File ${filename} deleted successfully`,
    });
  } catch (error) {
    return ctx.json({
      success: false,
      message: `Error deleting file ${filename}`,
      error: error.message,
    });
  }
});

// Route to get a specific file by ID
/*
files.get("/:id", async (ctx) => {
  const filename = ctx.req.param("id"); // Get the file key (ID) from the URL parameter

  if (!filename) {
    return ctx.json({
      success: false,
      message: "No file key provided",
    });
  }

  try {
    // Attempt to retrieve the file from the R2 bucket using the key (filename)
    const file = await ctx.env.R2_BUCKET.get(filename);

    if (file) {
      // File exists, return the file content with the appropriate content type
      return ctx.body(file.body, {
        headers: { "Content-Type": file.httpMetadata.contentType },
      });
    } else {
      return ctx.json({
        success: false,
        message: `File with key ${filename} not found`,
      });
    }
  } catch (error) {
    return ctx.json({
      success: false,
      message: `Error retrieving file ${filename}`,
      error: error.message,
    });
  }
});
*/

// Route to get a specific file by key
files.get("/:key", async (ctx) => {
  const { r2, bucket } = createR2Client(ctx);
  const fileKey = ctx.req.param("key");

  if (!fileKey) {
    return ctx.json({
      success: false,
      message: "No file key provided",
    });
  }

  try {
    const url = await getSignedUrl(
      r2,
      new GetObjectCommand({ Bucket: bucket, Key: fileKey }),
      { expiresIn: 3600 }
    );

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    return ctx.json({ success: true, key: fileKey, url }, { headers });
  } catch (error) {
    return ctx.json({
      success: false,
      message: `Error generating pre-signed URL for file ${fileKey}`,
      error: error.message,
    });
  }
});

files.post("/save", async (ctx) => {
  try {
    const { noteId, objectKey } = await ctx.req.json();
    // Log the extracted values
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
      .bind(id, noteId, objectKey, createdAt, createdAt) // Insert note ID, file key, and timestamps
      .run();

    if (response && response.affectedRows > 0) {
      return Response.json({ message: "File metadata saved successfully" });
    } else {
      return Response.json({ message: "Failed to save file metadata" });
    }
  } catch (e) {
    console.error(`Failed to save file metadata. Reason: ${e}`);
    return Response.json({
      message: `Failed to save file metadata. Reason: ${e}`,
    });
  }
});

// Helper to init the s3 client
function createR2Client(ctx: any) {
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

export default files;
