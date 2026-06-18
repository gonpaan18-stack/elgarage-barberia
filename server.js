import express from 'express'
import pg from 'pg'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

// ─── Base de datos ───
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
})

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS datos (
      clave TEXT PRIMARY KEY,
      valor TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)
  console.log('Base de datos lista')
}
await initDB()

app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist')))

// ─── SSE: clientes conectados ───
const clients = new Set()

function broadcast(clave) {
  const msg = `event: update\ndata: ${JSON.stringify({ clave })}\n\n`
  clients.forEach(res => { try { res.write(msg) } catch {} })
}

app.get('/api/eventos', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.flushHeaders()
  // Heartbeat cada 25s para mantener la conexión
  const hb = setInterval(() => { try { res.write(': ping\n\n') } catch {} }, 25000)
  clients.add(res)
  req.on('close', () => { clients.delete(res); clearInterval(hb) })
})

// ─── GET datos ───
app.get('/api/datos/:clave', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT valor FROM datos WHERE clave = $1', [req.params.clave])
    res.json(rows[0] ? JSON.parse(rows[0].valor) : null)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ─── PUT datos ───
app.put('/api/datos/:clave', async (req, res) => {
  try {
    const valor = JSON.stringify(req.body)
    await pool.query(
      `INSERT INTO datos (clave, valor) VALUES ($1, $2)
       ON CONFLICT (clave) DO UPDATE SET valor = $2, updated_at = NOW()`,
      [req.params.clave, valor]
    )
    broadcast(req.params.clave)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ─── Servir SPA y reservar.html ───
app.get('*', (req, res) => {
  if (req.path === '/reservar' || req.path === '/reservar.html') {
    return res.sendFile(path.join(__dirname, 'dist', 'reservar.html'))
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => console.log(`El Garage corriendo en puerto ${PORT}`))
