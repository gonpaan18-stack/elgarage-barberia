// ─── Helpers de fecha sin bug UTC ───
export function fechaLocal(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

export function turnosKey(fecha) { return `turnos_${fecha}` }

// ─── API ───
export async function getData(clave) {
  try {
    const r = await fetch(`/api/datos/${encodeURIComponent(clave)}`)
    if (!r.ok) return null
    return r.json()
  } catch { return null }
}

export async function setData(clave, valor) {
  await fetch(`/api/datos/${encodeURIComponent(clave)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(valor),
  })
}

// ─── SSE hook ───
import { useEffect } from 'react'

export function useSync(onUpdate) {
  useEffect(() => {
    const es = new EventSource('/api/eventos')
    es.addEventListener('update', (e) => {
      try { onUpdate(JSON.parse(e.data).clave) } catch {}
    })
    es.onerror = () => { /* reconecta automáticamente */ }
    return () => es.close()
  }, [])
}
