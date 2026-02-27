import { Hono } from "hono";
import { ContextExtended } from "../types";

const notes = new Hono();

// Get all notes
notes.get("/", async (ctx: ContextExtended) => {
  const db = ctx.env.DB;
  const notes = await db.prepare("SELECT * FROM note LIMIT 50").run();

  return Response.json(notes.results);
});

// Get single note
notes.get("/:id", async (ctx: ContextExtended) => {
  const id = ctx.req.path.split("/").slice(-1).join();
  const db = ctx.env.DB;
  const note = await db
    .prepare("SELECT * FROM note WHERE id = ?1")
    .bind(id)
    .first();

  return Response.json(note);
});

// Create new note
notes.post("/", async (ctx: ContextExtended) => {
  try {
    const { id, title, description } = await ctx.req.json();
    const db = ctx.env.DB;
    const response = await db
      .prepare(`INSERT INTO note (id, title, description) VALUES (?1, ?2, ?3)`)
      .bind(id, title, description)
      .run();

    return response.success
      ? Response.json({ message: "note created" })
      : Response.json({ message: "failed to create note" });
  } catch (e) {
    console.error(`failed to create note. reason: ${e}`);
    return Response.json({ message: `failed to create note. reason: ${e}` });
  }
});

// Update existing note
notes.put("/:id", async (ctx: ContextExtended) => {
  try {
    const id = ctx.req.path.split("/").slice(-1).join();
    const { title, description } = await ctx.req.json();
    const db = ctx.env.DB;
    const response = await db
      .prepare(
        `UPDATE note
            SET title = ?1, description = ?2
            WHERE id = ?3`
      )
      .bind(title, description, id)
      .run();

    return response.success
      ? Response.json({ message: "note updated" })
      : Response.json({ message: "failed to update note" });
  } catch (e) {
    console.error(`failed to update note. reason: ${e}`);
    return Response.json({ message: `failed to update note. reason: ${e}` });
  }
});

// Delete note
notes.delete("/:id", async (ctx: ContextExtended) => {
  try {
    const id = ctx.req.path.split("/").slice(-1).join();
    const db = ctx.env.DB;

    // First delete associated files
    const fileResponse = await db
      .prepare("DELETE FROM file where note_id == ?1")
      .bind(id)
      .run();

    if (fileResponse.success) {
      // Then delete the note
      const noteResponse = await db
        .prepare("DELETE FROM note where id == ?1")
        .bind(id)
        .run();

      return noteResponse.success
        ? Response.json({ message: "note deleted" })
        : Response.json({ message: "failed to delete note" });
    } else {
      console.log("failed to delete note");
      return Response.json({ message: "failed to delete note" });
    }
  } catch (e) {
    console.error(`failed to delete note. reason: ${e}`);
    return Response.json({ message: `failed to delete note. reason: ${e}` });
  }
});
export default notes;