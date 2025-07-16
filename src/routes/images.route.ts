import { Hono } from "hono";
import { ContextExtended } from "../types";

const images = new Hono();

images.post("/upload", async (c: ContextExtended) => {});

export default images;
