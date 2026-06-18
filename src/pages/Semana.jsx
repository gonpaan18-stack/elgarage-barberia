import { useState, useEffect } from 'react'
import { getData, fechaLocal, turnosKey } from '../api'

const DIAS_NOMBRE = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const PERFIL_DEFAULT = { horarioSemana: '10:00 – 20:00', horarioSabado: '09:00 – 19:00', intervalo: '20 min' }

function parseRango(rango) {
  const parts = rango.split(/[–-]/).map(s => s.trim())
  const [dh, dm] = parts[0].split(':').map(Number)
  const [hh, hm] = parts[1].split(':').map(Number)
  return { desdeH: dh, desdeM: dm || 0, hastaH: hh, hastaM: hm || 0 }
}

function generarSlots(perfil, diaSemana) {
  if (diaSemana === 0) return []
  const rango = (diaSemana === 6 ? perfil.horarioSabado : perfil.horarioSemana) || PERFIL_DEFAULT[diaSemana === 6 ? 'horarioSabado' : 'horarioSemana']
  const intervalo = parseInt(perfil.intervalo) || 20
  const { desdeH, desdeM, hastaH, hastaM } = parseRango(rango)
  const slots = []
  let h = desdeH, m = desdeM
  while (h < hastaH || (h === hastaH && m < hastaM)) {
    slots.push(`${h}:${m.toString().padStart(2, '0')}`)
    m += intervalo
    while (m >= 60) { m -= 60; h++ }
  }
  return slots
}

function buildSemana() {
  const hoy = new Date()
  const lunes = new Date(hoy)
  const dow = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1
  lunes.setDate(hoy.getDate() - dow)

  return Array.from({ length: 6 }, (_, i) => {
    const fecha = new Date(lunes)
    fecha.setDate(lunes.getDate() + i)
    return {
      dia: DIAS_NOMBRE[fecha.getDay()],
      num: fecha.getDate(),
      fecha,
      fechaISO: fechaLocal(fecha),
      hoy: fechaLocal(fecha) === fechaLocal(hoy),
    }
  })
}

export default function Semana() {
  const semana = buildSemana()
  const hoyIdx = semana.findIndex(d => d.hoy)
  const [selDia, setSelDia] = useState(hoyIdx >= 0 ? hoyIdx : 0)
  const [perfil, setPerfil] = useState(PERFIL_DEFAULT)
  const [turnosPorDia, setTurnosPorDia] = useState({})
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const p = await getData('perfil')
      if (p) setPerfil({ ...PERFIL_DEFAULT, ...p })
      const keys = semana.map(d => turnosKey(d.fechaISO))
      const results = await Promise.all(keys.map(k => getData(k)))
      const mapa = {}
      semana.forEach((d, i) => { mapa[d.fechaISO] = results[i] || {} })
      setTurnosPorDia(mapa)
      setCargando(false)
    }
    cargar()
  }, [])

  const diaActual = semana[selDia]
  const slots = generarSlots(perfil, diaActual.fecha.getDay())
  const turnosDelDia = turnosPorDia[diaActual.fechaISO] || {}

  function getTurnosCount(d) {
    const t = turnosPorDia[d.fechaISO] || {}
    return Object.values(t).filter(x => x?.nombre).length
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-3 pb-2 flex-none">
        <p className="font-bebas text-[28px] tracking-wide text-[#F3F0E9] leading-none m-0">Semana</p>
        <p className="text-[12px] text-[#9a9a97] mt-0.5 m-0">
          {semana[0].dia} {semana[0].num} – {semana[5].dia} {semana[5].num}
        </p>
      </div>

      {/* Selector días */}
      <div className="flex gap-2 px-5 pb-3 overflow-x-auto flex-none">
        {semana.map((d, i) => {
          const count = getTurnosCount(d)
          return (
            <div
              key={i}
              onClick={() => setSelDia(i)}
              className="flex-none flex flex-col items-center px-3 py-2 rounded-2xl cursor-pointer select-none"
              style={{
                background: selDia === i ? '#CE2434' : '#16181C',
                border: `1.5px solid ${selDia === i ? '#CE2434' : 'rgba(255,255,255,.08)'}`,
                minWidth: 52,
                transition: 'background .15s, border-color .15s',
              }}
            >
              <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: selDia === i ? 'rgba(255,255,255,.85)' : '#8c8c89' }}>
                {d.dia}
              </span>
              <span className="font-bebas text-[22px] leading-none" style={{ color: selDia === i ? '#fff' : '#cfcfca' }}>
                {d.num}
              </span>
              {d.hoy && (
                <span className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: selDia === i ? '#fff' : '#CE2434' }} />
              )}
              {!d.hoy && count > 0 && (
                <span className="text-[9px] font-bold mt-0.5" style={{ color: selDia === i ? 'rgba(255,255,255,.7)' : '#6b6e74' }}>
                  {count}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Título día */}
      <div className="px-5 pb-2 flex-none flex items-center justify-between">
        <span className="font-bebas text-[18px] text-[#F3F0E9] tracking-wide">
          {diaActual.dia} {diaActual.num}{diaActual.hoy ? ' · Hoy' : ''}
        </span>
        <span className="text-[12px] text-[#8c8c89]">
          {getTurnosCount(diaActual) > 0 ? `${getTurnosCount(diaActual)} turno${getTurnosCount(diaActual) !== 1 ? 's' : ''}` : 'Sin turnos'}
        </span>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {cargando ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-7 h-7 border-2 border-[#CE2434] border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : slots.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[13px] text-[#6b6e74]">
            Día cerrado
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            {slots.map((hora, i) => {
              const turno = turnosDelDia[hora]
              const ocupado = turno?.nombre
              const isLast = i === slots.length - 1

              return (
                <div key={hora} className="flex gap-3 items-stretch" style={{ minHeight: 56 }}>
                  <div className="w-11 flex-none text-right pt-1.5">
                    <span className="text-[11.5px] font-semibold" style={{ color: ocupado ? '#cfcfca' : '#3a3d44' }}>
                      {hora}
                    </span>
                  </div>
                  <div className="flex flex-col items-center flex-none w-4">
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1.5 flex-none z-10"
                      style={{
                        background: ocupado ? (turno.tipo === 'fijo' ? '#21458F' : '#CE2434') : '#1e2024',
                        border: ocupado ? 'none' : '1.5px solid #2a2d33',
                        boxShadow: ocupado ? `0 0 0 3px ${turno.tipo === 'fijo' ? 'rgba(33,69,143,.2)' : 'rgba(206,36,52,.15)'}` : 'none',
                      }}
                    />
                    {!isLast && (
                      <div className="flex-1 w-px mt-0.5" style={{ background: ocupado ? 'rgba(255,255,255,.1)' : '#1e2024' }}/>
                    )}
                  </div>
                  <div className="flex-1 pb-2 pt-0.5">
                    {ocupado ? (
                      <div
                        className="rounded-xl px-3 py-2.5"
                        style={{
                          background: turno.tipo === 'fijo' ? 'rgba(33,69,143,.12)' : '#16181C',
                          border: `1px solid ${turno.tipo === 'fijo' ? 'rgba(33,69,143,.35)' : 'rgba(255,255,255,.07)'}`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[13px] text-[#F3F0E9]">{turno.nombre}</span>
                              {turno.tipo === 'fijo' && (
                                <span className="text-[8px] font-bold text-[#9db4e8] bg-[rgba(33,69,143,.3)] px-1.5 py-0.5 rounded">FIJO</span>
                              )}
                              {turno.estado === 'hecho' && (
                                <span className="text-[8px] font-bold text-[#4caf72] bg-[rgba(76,175,114,.15)] px-1.5 py-0.5 rounded">HECHO</span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#8c8c89]">{turno.servicio}</span>
                          </div>
                          {turno.precio && (
                            <span className="font-bold text-[13px] text-[#F3F0E9]">
                              ${Number(turno.precio).toLocaleString('es-AR')}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-8 rounded-xl border border-dashed flex items-center px-3" style={{ borderColor: '#1e2024' }}>
                        <span className="text-[11px]" style={{ color: '#2a2d33' }}>Libre</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
