import { Hono } from "hono";
import { ContextExtended } from "../types";

const ai = new Hono();

ai.post("/summarize", async (ctx: ContextExtended) => {
});

ai.post("/paraphrase", async (ctx: ContextExtended) => {
});

ai.post("/translate", async (ctx: ContextExtended) => {
});

ai.post("/title", async (ctx: ContextExtended) => {
});

ai.post("/chat", async (ctx: ContextExtended) => {
});

export default ai;
