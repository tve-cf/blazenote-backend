import { Hono } from 'hono'
import notes from './routes/notes.route'
import files from './routes/files.route'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/notes', notes);
app.route('/files', files);

export default app
