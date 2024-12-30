import { Hono } from "hono";

const notes = new Hono();

notes.get('/', (ctx) => {
    return Response.json([])
});

notes.get('/:id', (ctx) => {
    return Response.json({})
});

notes.post('/', (ctx) => {
    return Response.json({ message: "note created" })
});

notes.put('/:id', (ctx) => {
    return Response.json({ message: "note updated" })
});

notes.delete('/:id', (ctx) => {
    return Response.json({ message: "note deleted" })
});

export default notes;