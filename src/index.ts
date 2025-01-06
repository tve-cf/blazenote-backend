import { Hono } from 'hono'
import { cors } from 'hono/cors'
import notes from './routes/notes.route'
import files from './routes/files.route'

const app = new Hono()
// https://hono.dev/docs/middleware/builtin/cors
app.use(
  cors({
    origin: ['http://localhost:5173'], // TODO: To add prod origin
    allowMethods: ['POST', 'GET', 'DELETE', 'PUT'],
    maxAge: 600,
  })
)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/notes', notes);
app.route('/files', files);

export default app
