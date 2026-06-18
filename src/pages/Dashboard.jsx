import { useState, useEffect } from 'react'
import { getData, fechaLocal, turnosKey } from '../api'

function semanaActual() {
  const hoy = new Date()
  const lunes = new Date(hoy)
  const dow = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1
  lunes.setDate(hoy.getDate() - dow)
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(lunes)
    d.setDate(lunes.getDate() + i)
    return fechaLocal(d)
  })
}

export default function Dashboard({ onClose }) {
  const [stats, setStats] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const dias = semanaActual()
      const resultados = await Promise.all(dias.map(f => getData(turnosKey(f))))
      let totalSemana = 0, recaudacionSemana = 0
      let hechosTotal = 0
      const porDia = dias.map((f, i) => {
        const turnos = resultados[i] || {}
        const lista = Object.values(turnos).filter(t => t?.nombre)
        const rec = lista.reduce((a, t) => a + (Number(String(t.precio||0).replace(/\./g,'')) || 0), 0)
        const hechos = lista.filter(t => t.estado === 'hecho').length
        totalSemana += lista.length
        recaudacionSemana += rec
        hechosTotal += hechos
        return { fecha: f, cantidad: lista.length, recaudacion: rec, hechos }
      })

      // Hoy
      const hoyFecha = fechaLocal(new Date())
      const hoyTurnos = resultados[dias.indexOf(hoyFecha)] || {}
      const hoyLista = Object.values(hoyTurnos).filter(t => t?.nombre)
      const hoyRec = hoyLista.reduce((a, t) => a + (Number(String(t.precio||0).replace(/\./g,'')) || 0), 0)

      setStats({ totalSemana, recaudacionSemana, hechosTotal, porDia, dias, hoyCount: hoyLista.length, hoyRec })
      setCargando(false)
    }
    cargar()
  }, [])

  if (cargando) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#CE2434] border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  const DIAS_N = ['Lun','Mar','Mié','Jue','Vie','Sáb']

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto px-5 pt-3 pb-6 gap-5">
      <div className="flex items-center justify-between">
        <p className="font-bebas text-[28px] tracking-wide text-[#F3F0E9] leading-none m-0">Dashboard</p>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#16181C] border border-white/10 flex items-center justify-center cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8c8c89" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Hoy */}
      <div>
        <p className="text-[11px] font-bold tracking-widest text-[#CE2434] mb-2 uppercase m-0">Hoy</p>
        <div className="flex gap-2">
          <StatCard value={stats.hoyCount} label="turnos hoy" />
          <StatCard value={`$${stats.hoyRec.toLocaleString('es-AR')}`} label="estimado hoy" red />
        </div>
      </div>

      {/* Semana */}
      <div>
        <p className="text-[11px] font-bold tracking-widest text-[#CE2434] mb-2 uppercase m-0">Esta semana</p>
        <div className="flex gap-2 mb-3">
          <StatCard value={stats.totalSemana} label="turnos totales" />
          <StatCard value={stats.hechosTotal} label="completados" />
          <StatCard value={`$${stats.recaudacionSemana.toLocaleString('es-AR')}`} label="recaudado" red />
        </div>

        {/* Barra por día */}
        <div className="bg-[#16181C] border border-white/[0.08] rounded-2xl p-4">
          <p className="text-[11px] text-[#8c8c89] font-semibold mb-3 m-0">Turnos por día</p>
          <div className="flex items-end gap-2" style={{height:80}}>
            {stats.porDia.map((d, i) => {
              const max = Math.max(...stats.porDia.map(x => x.cantidad), 1)
              const h = d.cantidad > 0 ? Math.max((d.cantidad / max) * 64, 12) : 4
              const esHoy = d.fecha === fechaLocal(new Date())
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  {d.cantidad > 0 && <span className="text-[10px] font-bold text-[#F3F0E9]">{d.cantidad}</span>}
                  <div className="w-full rounded-lg transition-all" style={{
                    height: h, background: esHoy ? '#CE2434' : d.cantidad > 0 ? '#21458F' : '#1e2024'
                  }}/>
                  <span className="text-[9.5px] font-semibold" style={{color: esHoy ? '#CE2434' : '#6b6e74'}}>{DIAS_N[i]}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Detalle por día */}
      <div>
        <p className="text-[11px] font-bold tracking-widest text-[#CE2434] mb-2 uppercase m-0">Detalle semanal</p>
        <div className="bg-[#16181C] border border-white/[0.08] rounded-2xl overflow-hidden">
          {stats.porDia.map((d, i) => {
            const esHoy = d.fecha === fechaLocal(new Date())
            return (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] last:border-0">
                <div className="flex items-center gap-2">
                  {esHoy && <div className="w-1.5 h-1.5 rounded-full bg-[#CE2434]"/>}
                  <span className="text-[13px] font-semibold" style={{color: esHoy ? '#F3F0E9' : '#9a9a97'}}>{DIAS_N[i]}</span>
                  {esHoy && <span className="text-[10px] text-[#CE2434] font-bold">HOY</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-[#8c8c89]">{d.cantidad} turno{d.cantidad !== 1 ? 's' : ''}</span>
                  {d.recaudacion > 0 && (
                    <span className="text-[12px] font-semibold text-[#F3F0E9]">${d.recaudacion.toLocaleString('es-AR')}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label, red }) {
  return (
    <div className="flex-1 bg-[#16181C] border border-white/[0.08] rounded-2xl px-3 py-2.5">
      <div className={`font-bebas text-[22px] leading-none ${red ? 'text-[#CE2434]' : 'text-[#F3F0E9]'}`}>{value}</div>
      <div className="text-[10px] text-[#8c8c89] mt-0.5">{label}</div>
    </div>
  )
}
