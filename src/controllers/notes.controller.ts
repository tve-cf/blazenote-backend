import { ContextExtended } from "../types";

export async function getAllNotes(c: ContextExtended) {
    const notes = await c.env.DB.exec(`select * from notes`);

    return 
} 