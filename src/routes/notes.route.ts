import { Hono } from "hono";
import { ContextExtended } from "../types";

const notes = new Hono();

// TODO: In-Workshop Activities.
notes.get('/', async (ctx: ContextExtended) => {
    return Response.json([])
});

// TODO: In-Workshop Activities.
notes.get('/:id', async (ctx: ContextExtended) => {
    return Response.json({})
});

// TODO: In-Workshop Activities.
notes.post('/', async (ctx: ContextExtended) => {
    return Response.json({ message: "note created" })
});

// TODO: In-Workshop Activities.
notes.put('/:id', async (ctx: ContextExtended) => {
    return Response.json({ message: "note updated" })
});

// TODO: In-Workshop Activities.
notes.delete('/:id', async (ctx: ContextExtended) => {
    return Response.json({ message: "note deleted" })
});

export default notes;
