import { Hono } from "hono";
import { ContextExtended } from "../types";

const ai = new Hono();

ai.post("/summarize", async (ctx: ContextExtended) => {
  const ai = ctx.env.AI;
  const body = await ctx.req.json();

  const response = await ai.run("@cf/meta/llama-4-scout-17b-16e-instruct", {
    prompt: `Summarize the following text. Limit to 1000 words and 3 paragraphs. Format it in html.: ${body.text}`,
    temperature: 0.5,
    max_tokens: 1000,
  });

  return new Response(JSON.stringify(response));
});

ai.post("/paraphrase", async (ctx: ContextExtended) => {
  const ai = ctx.env.AI;
  const body = await ctx.req.json();

  const response = await ai.run("@cf/meta/llama-4-scout-17b-16e-instruct", {
    prompt: `Paraphrase the following text. Format it in html.: ${body.text}`,
    temperature: 0.5,
    max_tokens: 8000,
  });

  return new Response(JSON.stringify(response));
});

ai.post("/translate", async (ctx: ContextExtended) => {
  const ai = ctx.env.AI;
  const body = await ctx.req.json();

  const response = await ai.run("@cf/meta/llama-4-scout-17b-16e-instruct", {
    prompt: `Translate the following text from ${body.fromLanguage} to ${body.toLanguage}. Format it in html.: ${body.text}`,
    temperature: 0.5,
    max_tokens: 8000,
  });

  return new Response(JSON.stringify(response));
});

ai.post("/title", async (ctx: ContextExtended) => {
  const ai = ctx.env.AI;
  const body = await ctx.req.json();

  const response = await ai.run("@cf/meta/llama-4-scout-17b-16e-instruct", {
    prompt: `Generate a title for the following text. Make it one sentence, short and concise. Only return the generated title, no other text or instructions. Return text without any formatting like markdown, html, etc. this is important: ${body.text}`,
    temperature: 0.2,
    max_tokens: 100,
  });

  return new Response(JSON.stringify(response));
});

ai.post("/chat", async (ctx: ContextExtended) => {
  const ai = ctx.env.AI;
  const body = await ctx.req.json();


  const response = await ai.run("@cf/meta/llama-4-scout-17b-16e-instruct", {
    messages: body.messages,
    prompt: body.prompt,
    temperature: 0.5,
    max_tokens: 2500,
  });

  return new Response(JSON.stringify(response));
});
export default ai;
