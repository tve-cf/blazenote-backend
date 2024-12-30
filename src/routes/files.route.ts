import { Hono } from "hono";

const files = new Hono();

files.get('/', (ctx) => {
    return Response.json([])
});

files.get('/:id', (ctx) => {
    return Response.json({})
});

files.post('/upload', (ctx) => {
    return Response.json({ message: "file uploaded" })
});

files.delete('/:id', (ctx) => {
    return Response.json({ message: "note deleted" })
});

export default files;