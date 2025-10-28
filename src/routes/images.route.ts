import { Hono } from "hono";
import { ContextExtended } from "../types";

const images = new Hono();

// Cloudflare API details
// TODO: In-Workshop Activities.
const ACCOUNT_ID = "YOUR-ACCOUNT-ID"
const API_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`;

// TODO: In-Workshop Activities.
images.post('/upload', async (c: ContextExtended) => { 
  return c.json({});
});
images.post("/upload", async (c: ContextExtended) => {});

export default images;