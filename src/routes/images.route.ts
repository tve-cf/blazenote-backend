import { Hono } from "hono";
import { ContextExtended } from "../types";

const images = new Hono();

images.post('/upload', async (c: ContextExtended) => {
  try {
    // Cloudflare API details
    const API_URL = `https://api.cloudflare.com/client/v4/accounts/${c.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`;
    const TOKEN = c.env.CLOUDFLARE_API_TOKEN;
    const body = await c.req.parseBody();

    // Validate input
    if (!body.file) {
      return c.json({ error: 'Image file is required' }, 400);
    }

    // Make the API request to Cloudflare
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      body: body,
    });

    const result = await response.json();

    if (!response.ok) {
      return c.json({ error: result.errors || 'Failed to upload image' }, response.status);
    }

    return c.json({ success: true, data: result.result });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Something went wrong' }, 500);
  }
});

export default images;
