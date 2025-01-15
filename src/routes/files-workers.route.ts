import { Hono } from "hono";
import { ContextExtended } from "../types";

const filesWorkers = new Hono();

// Route to get all files (empty list for now)
/*filesWorkers.get("/", (ctx) => {
  return ctx.json([]);
});
*/

// Route to list all files in the bucket
filesWorkers.get("/list", async (ctx) => {
  const bucket = ctx.env.R2_BUCKET;

  try {
    const objects = await bucket.list();
    //console.log(objects); // Log the raw response
    const keys = objects.objects.map((object) => object.key);
    return ctx.json({ success: true, keys });
  } catch (error) {
    return ctx.json({
      success: false,
      message: "Error listing objects",
      error: error.message,
    });
  }
});

// Route to upload a file
filesWorkers.post("/upload", async (ctx) => {
  const formData = await ctx.req.formData();
  const file = formData.get("file"); // Assuming 'file' is the key in the form

  if (!file) {
    return ctx.json({ success: false, message: "No file uploaded" });
  }

  // Append timestamp to the file name to ensure uniqueness
  const timestamp = Math.floor(Date.now() / 1000);
  const key = `${timestamp}-${file.name}`;

  try {
    // Upload the file with the new unique filename
    await ctx.env.R2_BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    return ctx.json({
      success: true,
      message: "File uploaded successfully",
      filename: key,
    });
  } catch (error) {
    return ctx.json({
      success: false,
      message: "Error uploading file",
      error: error.message,
    });
  }
});

// Route to delete a specific file by ID
filesWorkers.delete("/:key", async (ctx) => {
  const filename = ctx.req.param("key");

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
filesWorkers.get("/:key", async (ctx) => {
  const filename = ctx.req.param("key");

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

export default filesWorkers;
