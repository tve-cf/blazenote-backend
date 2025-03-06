import { Hono } from "hono";
import { ContextExtended } from "../types";

const images = new Hono();

// Cloudflare API details
const API_URL = "https://api.cloudflare.com/client/v4/accounts/e206e81b43614ccd76aed224ad5e1cbc/images/v1";

images.post('/upload', async (c: ContextExtended) => {
  try {
    const TOKEN = c.env.CLOUDFLARE_API_TOKEN;
    const body = await c.req.parseBody();
    console.log(body['file']);
    // Validate input
    if (!body.file) {
      return c.json({ error: 'Image file is required' }, 400);
    }

    // Create FormData to send to Cloudflare API
    // const formData = new FormData();
    // formData.append('file', form.file, form.file.name);

    // Make the API request to Cloudflare
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      body: body,
    });
    console.log('Cloudflare Token:', TOKEN);
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
