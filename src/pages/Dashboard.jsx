import { useState, useEffect } from 'react'
import { getData, fechaLocal, turnosKey } from '../api'

function diasDelRango(desde, hasta) {
  const dias = []
  const cur = new Date(desde + 'T00:00:00')
  const fin = new Date(hasta + 'T00:00:00')
  while (cur <= fin) {
    dias.push(fechaLocal(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return dias
}

function primerDiaMes(year, month) {
  return `${year}-${String(month).padStart(2,'0')}-01`
}
function ultimoDiaMes(year, month) {
  const d = new Date(year, month, 0)
  return fechaLocal(d)
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_N = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

export default function Dashboard({ onClose }) {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth() + 1)
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [desde, setDesde] = useState(primerDiaMes(hoy.getFullYear(), hoy.getMonth() + 1))
  const [hasta, setHasta] = useState(fechaLocal(hoy))
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargar()
  }, [desde, hasta])

  async function cargar() {
    setCargando(true)
    const dias = diasDelRango(desde, hasta)
    const resultados = await Promise.all(dias.map(f => getData(turnosKey(f))))
    const porDia = dias.map((f, i) => {
      const turnos = resultados[i] || {}
      const lista = Object.values(turnos).filter(t => t?.nombre)
      const rec = lista.reduce((a, t) => a + (Number(String(t.precio||0).replace(/\./g,'')) || 0), 0)
      const hechos = lista.filter(t => t.estado === 'hecho').length
      const d = new Date(f + 'T00:00:00')
      return { fecha: f, dia: d.getDate(), dow: d.getDay(), cantidad: lista.length, recaudacion: rec, hechos }
    })
    setDatos(porDia)
    setCargando(false)
  }

  function cambiarMes(delta) {
    let nm = mes + delta, na = anio
    if (nm > 12) { nm = 1; na++ }
    if (nm < 1) { nm = 12; na-- }
    setMes(nm); setAnio(na)
    const primer = primerDiaMes(na, nm)
    const ultimo = ultimoDiaMes(na, nm)
    // No ir más allá de hoy
    const ultFinal = ultimo > fechaLocal(hoy) ? fechaLocal(hoy) : ultimo
    setDesde(primer)
    setHasta(ultFinal)
  }

  const totalTurnos = datos.reduce((a, d) => a + d.cantidad, 0)
  const totalRec = datos.reduce((a, d) => a + d.recaudacion, 0)
  const totalHechos = datos.reduce((a, d) => a + d.hechos, 0)
  const maxCantidad = Math.max(...datos.map(d => d.cantidad), 1)
  const diasConTurnos = datos.filter(d => d.cantidad > 0)

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto px-5 pt-3 pb-6 gap-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-none">
        <p className="font-bebas text-[28px] tracking-wide text-[#F3F0E9] leading-none m-0">Dashboard</p>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#16181C] border border-white/10 flex items-center justify-center cursor-pointer border-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8c8c89" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Navegación de mes */}
      <div className="bg-[#16181C] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button onClick={() => cambiarMes(-1)} className="w-9 h-9 rounded-xl bg-[#0E0F11] border border-white/10 flex items-center justify-center cursor-pointer border-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cfcfca" strokeWidth="2.2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span className="font-bebas text-[22px] tracking-wide text-[#F3F0E9]">{MESES[mes-1]} {anio}</span>
          <button onClick={() => cambiarMes(1)} disabled={`${anio}-${String(mes).padStart(2,'0')}` >= `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}`}
            className="w-9 h-9 rounded-xl bg-[#0E0F11] border border-white/10 flex items-center justify-center cursor-pointer border-0 disabled:opacity-30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cfcfca" strokeWidth="2.2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        {/* Rango personalizado */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[#CE2434] tracking-widest uppercase">Desde</span>
            <input type="date" value={desde}
              min={primerDiaMes(anio, mes)} max={hasta}
              onChange={e => setDesde(e.target.value)}
              className="bg-[#0E0F11] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-[#F3F0E9] outline-none w-full"
              style={{fontFamily:'Barlow,sans-serif', colorScheme:'dark'}}/>
          </div>
          <div className="text-[#6b6e74] text-[12px] mt-4">→</div>
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[#CE2434] tracking-widest uppercase">Hasta</span>
            <input type="date" value={hasta}
              min={desde} max={ultimoDiaMes(anio, mes) > fechaLocal(hoy) ? fechaLocal(hoy) : ultimoDiaMes(anio, mes)}
              onChange={e => setHasta(e.target.value)}
              className="bg-[#0E0F11] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-[#F3F0E9] outline-none w-full"
              style={{fontFamily:'Barlow,sans-serif', colorScheme:'dark'}}/>
          </div>
        </div>
      </div>

      {cargando ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#CE2434] border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : <>

        {/* Stats */}
        <div className="flex gap-2">
          <StatCard value={totalTurnos} label="turnos" />
          <StatCard value={totalHechos} label="completados" />
          <StatCard value={`$${(totalRec/1000).toFixed(0)}k`} label="recaudado" red />
        </div>

        {/* Gráfico de barras */}
        {diasConTurnos.length > 0 && (
          <div className="bg-[#16181C] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-[11px] text-[#8c8c89] font-semibold mb-3 m-0">Turnos por día</p>
            <div className="flex items-end gap-1 overflow-x-auto pb-1" style={{minHeight:80}}>
              {datos.filter(d => d.cantidad > 0 || diasConTurnos.length <= 15).map((d, i) => {
                const h = Math.max((d.cantidad / maxCantidad) * 64, d.cantidad > 0 ? 12 : 3)
                const esHoy = d.fecha === fechaLocal(new Date())
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-none" style={{minWidth: datos.length > 20 ? 18 : 24}}>
                    {d.cantidad > 0 && <span className="text-[9px] font-bold text-[#F3F0E9]">{d.cantidad}</span>}
                    <div className="w-full rounded-md" style={{
                      height: h,
                      background: esHoy ? '#CE2434' : d.cantidad > 0 ? '#21458F' : '#1e2024',
                      minWidth: datos.length > 20 ? 14 : 18,
                    }}/>
                    <span className="text-[8px] font-semibold" style={{color: esHoy ? '#CE2434' : '#4a4d54'}}>{d.dia}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Detalle por día */}
        {diasConTurnos.length > 0 ? (
          <div>
            <p className="text-[11px] font-bold tracking-widest text-[#CE2434] mb-2 uppercase m-0">Detalle</p>
            <div className="bg-[#16181C] border border-white/[0.08] rounded-2xl overflow-hidden">
              {diasConTurnos.map((d, i) => {
                const esHoy = d.fecha === fechaLocal(new Date())
                const fecha = new Date(d.fecha + 'T00:00:00')
                return (
                  <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] last:border-0">
                    <div className="flex items-center gap-2">
                      {esHoy && <div className="w-1.5 h-1.5 rounded-full bg-[#CE2434] flex-none"/>}
                      <span className="text-[13px] font-semibold" style={{color: esHoy ? '#F3F0E9' : '#cfcfca'}}>
                        {DIAS_N[d.dow]} {d.dia}
                      </span>
                      {esHoy && <span className="text-[9px] text-[#CE2434] font-bold">HOY</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-[#8c8c89]">{d.cantidad} turno{d.cantidad !== 1 ? 's' : ''}</span>
                      {d.recaudacion > 0 && (
                        <span className="text-[12px] font-bold text-[#F3F0E9]">${d.recaudacion.toLocaleString('es-AR')}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <span className="text-[#3a3d44] text-[32px]">📊</span>
            <p className="text-[13px] text-[#6b6e74] m-0">Sin turnos en este período</p>
          </div>
        )}

      </>}
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
