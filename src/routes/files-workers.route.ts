import { Hono } from "hono";
import { ContextExtended } from "../types";

export const filesWorkers = new Hono();

// Placeholder endpoints - we'll implement these
filesWorkers.post("/upload", async (ctx: ContextExtended) => {
  const formData = await ctx.req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return ctx.json({ success: false, message: "No file uploaded" });
  }

  // Create unique filename with timestamp
  const timestamp = Math.floor(Date.now() / 1000);
  const key = `${timestamp}-${file.name}`;

  try {
    // Upload file to R2 bucket
    await ctx.env.R2_BUCKET.put(key, file, {
      httpMetadata: { contentType: file.type },
    });

    return ctx.json({
      success: true,
      message: "File uploaded successfully",
      filename: key,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return ctx.json({
      success: false,
      message: "Error uploading file",
    });
  }
});

filesWorkers.get("/:key", async (ctx: ContextExtended) => {
  const filename = ctx.req.param("key");

  if (!filename) {
    return ctx.json({
      success: false,
      message: "No file key provided",
    });
  }

  try {
    // Get file from R2 bucket
    const file = await ctx.env.R2_BUCKET.get(filename);

    if (file) {
      // Return the file with proper content type
      return ctx.body(file.body, {
        headers: { "Content-Type": file.httpMetadata?.contentType || "" },
      });
    } else {
      return ctx.json({
        success: false,
        message: `File with key ${filename} not found`,
      });
    }
  } catch (error) {
    console.error("Error retrieving file:", error);
    return ctx.json({
      success: false,
      message: `Error retrieving file ${filename}`,
    });
  }
});

filesWorkers.delete("/:key", async (ctx: ContextExtended) => {
  const filename = ctx.req.param("key");

  if (!filename) {
    return ctx.json({
      success: false,
      message: "No file key provided",
    });
  }

  try {
    // Delete file from R2 bucket
    await ctx.env.R2_BUCKET.delete(filename);

    return ctx.json({
      success: true,
      message: `File ${filename} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return ctx.json({
      success: false,
      message: `Error deleting file ${filename}`,
    });
  }
});

filesWorkers.get("/list", async (ctx: ContextExtended) => {
  const bucket = ctx.env.R2_BUCKET;

  try {
    // Get list of all files in bucket
    const objects = await bucket.list();
    const keys = objects.objects.map((object) => object.key);

    return ctx.json({ success: true, keys });
  } catch (error) {
    console.error("Error listing objects:", error);
    return ctx.json({
      success: false,
      message: "Error listing objects",
    });
  }
});

export default filesWorkers;