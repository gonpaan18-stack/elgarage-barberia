import { useState, useEffect, useCallback, useMemo } from 'react'
import { getData, setData, useSync, fechaLocal, turnosKey } from '../api'

const PERFIL_DEFAULT = { horarioSemana: '10:00 – 20:00', horarioSabado: '09:00 – 19:00', intervalo: '20 min' }

function parseRango(rango) {
  const parts = rango.split(/[–-]/).map(s => s.trim())
  const [dh, dm] = parts[0].split(':').map(Number)
  const [hh, hm] = parts[1].split(':').map(Number)
  return { dh, dm: dm||0, hh, hm: hm||0 }
}

function generarSlots(perfil, diaSemana) {
  if (diaSemana === 0) return []
  const rango = (diaSemana === 6 ? perfil.horarioSabado : perfil.horarioSemana) || PERFIL_DEFAULT[diaSemana === 6 ? 'horarioSabado' : 'horarioSemana']
  const intervalo = parseInt(perfil.intervalo) || 20
  const { dh, dm, hh, hm } = parseRango(rango)
  const slots = []
  let h = dh, m = dm
  while (h < hh || (h === hh && m < hm)) {
    slots.push(`${h}:${m.toString().padStart(2,'0')}`)
    m += intervalo
    while (m >= 60) { m -= 60; h++ }
  }
  return slots
}

const SERVICIOS = [
  { nombre: 'Corte', precio: 14000 },
  { nombre: 'Promo padre/hijo', precio: 26000 },
  { nombre: 'Corte niño', precio: 12000 },
  { nombre: 'Barba', precio: 6000 },
]

export default function Agenda({ fabModal, onCloseFab }) {
  const hoy = new Date()
  const diaSemana = hoy.getDay()
  const hoyKey = turnosKey(fechaLocal(hoy))

  const [perfil, setPerfil] = useState(PERFIL_DEFAULT)
  const [turnosDB, setTurnosDB] = useState({})
  const [modal, setModal] = useState(null)
  const [cargando, setCargando] = useState(true)

  const slots = useMemo(() => generarSlots(perfil, diaSemana), [perfil, diaSemana])

  async function cargarDatos() {
    const [p, t] = await Promise.all([getData('perfil'), getData(hoyKey)])
    if (p) setPerfil({ ...PERFIL_DEFAULT, ...p })
    setTurnosDB(t || {})
    setCargando(false)
  }

  useEffect(() => { cargarDatos() }, [])

  // SSE: actualizar cuando otro dispositivo cambia datos
  useSync((clave) => {
    if (clave === hoyKey || clave === 'perfil') cargarDatos()
  })

  const turnos = useMemo(() => {
    const obj = {}
    slots.forEach(s => { obj[s] = turnosDB[s] || null })
    return obj
  }, [slots, turnosDB])

  async function actualizarTurnos(next) {
    setTurnosDB(next)
    await setData(hoyKey, next)
  }

  async function marcarHecho(hora) {
    const next = { ...turnosDB, [hora]: { ...turnosDB[hora], estado: 'hecho' } }
    await actualizarTurnos(next)
  }

  async function eliminar(hora) {
    const next = { ...turnosDB, [hora]: null }
    await actualizarTurnos(next)
  }

  async function cargarTurno(hora, datos) {
    const next = { ...turnosDB, [hora]: { ...datos, estado: 'pendiente', tipo: 'nuevo' } }
    await actualizarTurnos(next)
    setModal(null)
  }

  const totalConTurno = Object.values(turnos).filter(t => t?.nombre).length
  const libres = slots.length - totalConTurno
  const estimado = Object.values(turnos).filter(t => t?.precio).reduce((a, b) => a + (b.precio || 0), 0)

  const diasNombre = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
  const mesesNombre = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

  if (diaSemana === 0) return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 px-8 text-center">
      <span className="text-5xl">🔒</span>
      <p className="font-bebas text-[28px] text-[#F3F0E9] m-0">Hoy es domingo</p>
      <p className="text-[13px] text-[#8c8c89] m-0">El local está cerrado.</p>
    </div>
  )

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-3 pb-2.5 flex-none">
        <div>
          <p className="text-xs text-[#8c8c89] m-0">Buen día,</p>
          <p className="font-bebas text-[26px] tracking-wide text-[#F3F0E9] leading-none m-0">Erik Fenanti</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={cargarDatos} className="w-8 h-8 rounded-full bg-[#16181C] border border-white/10 flex items-center justify-center cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8c8c89" strokeWidth="2.2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5"/>
            </svg>
          </button>
          <img src="/logo.png" alt="El Garage" className="w-10 h-10 rounded-full object-cover" />
        </div>
      </div>

      <div className="px-5 pb-3 flex-none">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-bebas text-[30px] text-[#F3F0E9] leading-none">Hoy</span>
          <span className="text-[13px] text-[#9a9a97]">
            {diasNombre[diaSemana]}, {hoy.getDate()} de {mesesNombre[hoy.getMonth()]}
          </span>
        </div>
        <div className="flex gap-2">
          <Stat value={totalConTurno} label="turnos" />
          <Stat value={libres} label="libres" />
          <Stat value={estimado > 0 ? `$${Math.round(estimado/1000)}k` : '$0'} label="estimado" red />
        </div>
      </div>

      {cargando ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#CE2434] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-2.5">
          {slots.map((hora) => (
            <TurnoRow
              key={hora}
              hora={hora}
              turno={turnos[hora]}
              onHecho={() => marcarHecho(hora)}
              onEliminar={() => eliminar(hora)}
              onCargar={() => setModal(hora)}
            />
          ))}
        </div>
      )}

      {modal && (
        <ModalCargar
          hora={modal}
          servicios={SERVICIOS}
          onConfirm={(d) => cargarTurno(modal, d)}
          onClose={() => setModal(null)}
        />
      )}

      {fabModal && (
        <ModalCargar
          hora={null}
          servicios={SERVICIOS}
          onConfirm={(d) => { cargarTurno(d.hora, d); onCloseFab() }}
          onClose={onCloseFab}
          libreHora
        />
      )}
    </div>
  )
}

function Stat({ value, label, red }) {
  return (
    <div className="flex-1 bg-[#16181C] border border-white/[0.08] rounded-2xl px-3 py-2.5">
      <div className={`font-bebas text-[24px] leading-none ${red ? 'text-[#CE2434]' : 'text-[#F3F0E9]'}`}>{value}</div>
      <div className="text-[10.5px] text-[#8c8c89] mt-0.5">{label}</div>
    </div>
  )
}

function TurnoRow({ hora, turno, onHecho, onEliminar, onCargar }) {
  const [open, setOpen] = useState(false)
  const ocupado = turno?.nombre
  const isHecho = turno?.estado === 'hecho'

  return (
    <div className={`flex gap-2.5 items-stretch ${isHecho ? 'opacity-50' : ''}`}>
      <div className="w-10 flex-none text-right pt-0.5">
        <span className={`font-bold text-[13px] ${ocupado ? 'text-[#F3F0E9]' : 'text-[#6b6e74]'}`}>{hora}</span>
      </div>
      <div className="w-2 flex-none flex flex-col items-center">
        <div className="w-2 h-2 rounded-full mt-1.5 flex-none" style={{
          background: ocupado ? (isHecho ? '#4caf72' : '#CE2434') : 'transparent',
          border: ocupado ? 'none' : '1.5px solid rgba(255,255,255,.18)',
        }}/>
        <div className="flex-1 w-px bg-white/10"/>
      </div>
      <div className="flex-1 min-w-0">
        {!ocupado ? (
          <div className="border border-dashed border-white/[0.13] rounded-[13px] px-3 py-2.5 flex justify-between items-center">
            <span className="text-[12.5px] text-[#6b6e74]">Horario libre</span>
            <span className="text-[11px] text-[#CE2434] font-semibold cursor-pointer" onClick={onCargar}>+ Cargar</span>
          </div>
        ) : (
          <div className="rounded-[13px] px-3 py-2.5 cursor-pointer" style={{
            background: '#16181C', border: '1px solid rgba(255,255,255,.07)'
          }} onClick={() => !isHecho && setOpen(o => !o)}>
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[13.5px] text-[#F3F0E9]">{turno.nombre}</span>
                  {turno.tipo === 'fijo' && (
                    <span className="text-[9px] font-bold text-[#9db4e8] bg-[rgba(33,69,143,.22)] px-1.5 py-0.5 rounded-[5px]">FIJO</span>
                  )}
                </div>
                <div className="text-[11px] text-[#a8a8a4]">{turno.servicio}{turno.precio ? ` · $${Number(turno.precio).toLocaleString('es-AR')}` : ''}</div>
              </div>
              <div className="flex items-center gap-2 flex-none">
                {isHecho
                  ? <span className="text-[10.5px] text-[#4caf72] font-semibold">Hecho ✓</span>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8c8c89" strokeWidth="2"><path d={open ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}/></svg>
                }
                <button onClick={e => { e.stopPropagation(); onEliminar() }} className="w-6 h-6 rounded-full bg-[#1a1c20] border border-white/10 flex items-center justify-center cursor-pointer">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b6e74" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
            {open && !isHecho && (
              <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-white/[0.07]">
                <button onClick={e => { e.stopPropagation(); onHecho() }} className="flex-1 bg-[#CE2434] text-white text-[12px] font-semibold py-2 rounded-xl border-0 cursor-pointer">
                  ✓ Marcar hecho
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ModalCargar({ hora, servicios, onConfirm, onClose, libreHora }) {
  const [nombre, setNombre] = useState('')
  const [seleccionados, setSeleccionados] = useState([servicios[0]])
  const [esFijo, setEsFijo] = useState(false)
  const [horaLibre, setHoraLibre] = useState('')

  function toggleServicio(s) {
    setSeleccionados(prev =>
      prev.find(x => x.nombre === s.nombre)
        ? prev.length > 1 ? prev.filter(x => x.nombre !== s.nombre) : prev
        : [...prev, s]
    )
  }

  const precioTotal = seleccionados.reduce((a, s) => a + s.precio, 0)
  const servicioNombres = seleccionados.map(s => s.nombre).join(' + ')

  function confirmar() {
    if (!nombre.trim()) return
    const horaFinal = libreHora ? horaLibre : hora
    if (!horaFinal) return
    onConfirm({ nombre: nombre.trim(), servicio: servicioNombres, precio: precioTotal, tipo: esFijo ? 'fijo' : 'nuevo', hora: horaFinal })
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50" onClick={onClose}>
      <div className="bg-[#16181C] rounded-t-3xl w-full max-w-[430px] p-5 pb-8 flex flex-col gap-4 max-h-[92dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-bebas text-[22px] text-[#F3F0E9] m-0">{libreHora ? 'Nuevo turno' : `Cargar turno · ${hora}`}</p>
          <button onClick={onClose} className="bg-transparent border-0 cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8c8c89" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Hora libre si viene del FAB */}
        {libreHora && (
          <input placeholder="Horario (ej: 14:30)" value={horaLibre} onChange={e => setHoraLibre(e.target.value)}
            className="bg-[#0E0F11] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-[#F3F0E9] outline-none focus:border-[#CE2434]"
            style={{fontFamily:'Barlow,sans-serif'}}/>
        )}

        <input autoFocus={!libreHora} placeholder="Nombre del cliente" value={nombre} onChange={e => setNombre(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && confirmar()}
          className="bg-[#0E0F11] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-[#F3F0E9] outline-none focus:border-[#CE2434]"
          style={{fontFamily:'Barlow,sans-serif'}}/>

        {/* Multi-servicio */}
        <div className="flex flex-col gap-1.5">
          {servicios.map(s => {
            const sel = !!seleccionados.find(x => x.nombre === s.nombre)
            return (
              <div key={s.nombre} onClick={() => toggleServicio(s)}
                className="flex justify-between items-center px-4 py-3 rounded-xl cursor-pointer border transition-colors"
                style={{ background: sel ? '#1c1a17' : '#0E0F11', borderColor: sel ? '#CE2434' : 'rgba(255,255,255,.08)', color: sel ? '#F3F0E9' : '#9a9a97' }}>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded flex items-center justify-center flex-none" style={{background: sel ? '#CE2434' : 'transparent', border: sel ? 'none' : '1.5px solid rgba(255,255,255,.2)'}}>
                    {sel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><path d="M5 13l4 4L19 7"/></svg>}
                  </div>
                  <span className="text-[13px] font-semibold">{s.nombre}</span>
                </div>
                <span className="text-[13px] font-bold">${s.precio.toLocaleString('es-AR')}</span>
              </div>
            )
          })}
        </div>

        {seleccionados.length > 1 && (
          <div className="flex justify-between items-center px-4 py-2.5 bg-[#0E0F11] rounded-xl border border-[#CE2434]/30">
            <span className="text-[12px] text-[#9a9a97]">Total</span>
            <span className="text-[15px] font-bold text-[#CE2434]">${precioTotal.toLocaleString('es-AR')}</span>
          </div>
        )}

        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setEsFijo(f => !f)}>
          <div className="w-10 h-6 rounded-full relative" style={{ background: esFijo ? '#CE2434' : '#3a3d44', transition: 'background .2s' }}>
            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white" style={{ left: esFijo ? '18px' : '2px', transition: 'left .2s' }}/>
          </div>
          <span className="text-[13px] text-[#dcdcd8] font-medium">Cliente fijo</span>
        </div>
        <button onClick={confirmar} className="w-full bg-[#CE2434] text-white font-bold text-[14px] py-4 rounded-2xl border-0 cursor-pointer">
          Confirmar turno · ${precioTotal.toLocaleString('es-AR')}
        </button>
      </div>
    </div>
  )
}
