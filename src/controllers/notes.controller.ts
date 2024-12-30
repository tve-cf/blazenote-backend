import { ContextExtended } from "../types";

export async function getAllNotes(c: ContextExtended) {
    const notes = await c.env.DB.prepare(`select * from notes`).all();

    return Response.json(notes);
} 