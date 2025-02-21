import { Hono } from "hono";
import { cors } from "hono/cors";
import notes from "./routes/notes.route";
import files from "./routes/files.route";
import filesWorkers from "./routes/files-workers.route";

const app = new Hono();

// TODO: In-Workshop Activities.
// Define allowed origins
const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://<your-domain>.<tld>",
]);

// https://hono.dev/docs/middleware/builtin/cors
app.use(
  "*",
  cors({
    origin: (origin) => {
      if (allowedOrigins.has(origin)) {
        return origin; // Allow this origin
      }
      return null; // Disallow this origin
    },
    credentials: true,
    allowMethods: ["POST", "GET", "DELETE", "PUT"],
    allowHeaders: [
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Cache-Control",
    ],
  })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/notes", notes);
app.route("/files", files);
app.route("/files-workers", filesWorkers);

export default app;
