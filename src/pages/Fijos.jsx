import { useState, useEffect } from 'react'
import { getData, setData, useSync } from '../api'
import { CLIENTES_FIJOS } from '../data/mock'

const COLORES = ['#CE2434','#21458F','#3a3d44','#2a6b4a','#7a3d8f']
const SERVICIOS = ['Corte','Corte + barba','Corte niño','Barba','Promo padre/hijo']
const DIAS = ['Todos los lunes','Todos los martes','Todos los miércoles','Todos los jueves','Todos los viernes','Todos los sábados','Sábado por medio']
const HORARIOS = []
for (let h = 9; h < 20; h++) for (let m = 0; m < 60; m += 20)
  HORARIOS.push(`${h}:${m.toString().padStart(2,'0')}`)

function getIniciales(nombre) {
  return nombre.trim().split(' ').map(p => p[0]).join('').toUpperCase().slice(0,2)
}

export default function Fijos() {
  const [clientes, setClientes] = useState([])
  const [modal, setModal] = useState(false)
  const [cargando, setCargando] = useState(true)

  async function cargar() {
    const data = await getData('fijos')
    setClientes(data || CLIENTES_FIJOS)
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])
  useSync((clave) => { if (clave === 'fijos') cargar() })

  async function save(next) {
    setClientes(next)
    await setData('fijos', next)
  }

  const activos = clientes.filter(c => c.activo).length

  if (cargando) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#CE2434] border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="px-5 pt-3 pb-3.5 flex-none">
        <p className="font-bebas text-[28px] tracking-wide text-[#F3F0E9] leading-none m-0">Clientes fijos</p>
        <p className="text-[12px] text-[#9a9a97] mt-1 m-0">
          Se agendan solos cada semana. <b className="text-[#cfcfca]">{activos} activos</b>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-2.5">
        {clientes.map((c, i) => (
          <div key={i} className="rounded-2xl px-3.5 py-3 transition-all"
            style={{ background: c.activo ? '#16181C' : '#131417', border: `1px solid ${c.activo ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.05)'}`, opacity: c.activo ? 1 : 0.55 }}>
            <div className="flex items-center gap-2.5">
              <div className="w-[42px] h-[42px] flex-none rounded-full flex items-center justify-center font-bebas text-[18px] text-white" style={{ background: c.color }}>
                {c.iniciales}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[14px] text-[#F3F0E9] m-0">{c.nombre}</p>
                <p className="text-[11px] text-[#8c8c89] m-0">{c.servicio} · {c.telefono}</p>
              </div>
              <div className="relative flex-none w-[42px] h-[25px] rounded-full cursor-pointer"
                style={{ background: c.activo ? '#CE2434' : '#3a3d44', transition: 'background .2s' }}
                onClick={() => save(clientes.map((x,j) => j===i ? {...x, activo:!x.activo} : x))}>
                <div className="absolute top-[2.5px] w-5 h-5 rounded-full bg-white"
                  style={{ left: c.activo ? '19.5px' : '2.5px', transition: 'left .2s' }}/>
              </div>
              <button onClick={() => save(clientes.filter((_,j) => j!==i))}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-none cursor-pointer border border-white/10 bg-[#1a1c20]">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b6e74" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-white/[0.06]">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#9db4e8] bg-[rgba(33,69,143,.2)] px-2.5 py-1 rounded-lg">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9db4e8" strokeWidth="2"><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                {c.recurrencia}
              </span>
              {c.proximo && <span className="text-[11px] text-[#8c8c89] ml-auto">Próximo: {c.proximo}</span>}
            </div>
          </div>
        ))}
        <button onClick={() => setModal(true)}
          className="w-full border border-dashed border-white/20 rounded-2xl py-3.5 text-[13px] text-[#CE2434] font-semibold bg-transparent cursor-pointer">
          + Agregar cliente fijo
        </button>
      </div>

      {modal && <ModalAgregar onConfirm={d => save([...clientes, d]).then(() => setModal(false))} onClose={() => setModal(false)}/>}
    </div>
  )
}

function ModalAgregar({ onConfirm, onClose }) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [servicio, setServicio] = useState(SERVICIOS[0])
  const [dia, setDia] = useState(DIAS[5])
  const [horario, setHorario] = useState(HORARIOS[4])
  const [color, setColor] = useState(COLORES[0])

  function confirmar() {
    if (!nombre.trim()) return
    onConfirm({ nombre: nombre.trim(), telefono: telefono.trim()||'—', servicio, iniciales: getIniciales(nombre), color, recurrencia: `${dia} · ${horario}`, proximo: 'próximamente', activo: true })
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50" onClick={onClose}>
      <div className="bg-[#16181C] rounded-t-3xl w-full max-w-[430px] p-5 pb-8 flex flex-col gap-4 max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-bebas text-[22px] text-[#F3F0E9] m-0">Nuevo cliente fijo</p>
          <button onClick={onClose} className="bg-transparent border-0 cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8c8c89" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <input autoFocus placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)}
          className="bg-[#0E0F11] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-[#F3F0E9] outline-none focus:border-[#CE2434]" style={{fontFamily:'Barlow,sans-serif'}}/>
        <input placeholder="Teléfono" type="tel" value={telefono} onChange={e => setTelefono(e.target.value)}
          className="bg-[#0E0F11] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-[#F3F0E9] outline-none focus:border-[#CE2434]" style={{fontFamily:'Barlow,sans-serif'}}/>
        <div>
          <p className="text-[11px] font-bold text-[#CE2434] tracking-widest mb-2 m-0">SERVICIO</p>
          <div className="flex flex-col gap-1.5">
            {SERVICIOS.map(s => (
              <div key={s} onClick={() => setServicio(s)} className="px-4 py-2.5 rounded-xl cursor-pointer border text-[13px] font-semibold transition-colors"
                style={{ background: servicio===s ? '#1c1a17' : '#0E0F11', borderColor: servicio===s ? '#CE2434' : 'rgba(255,255,255,.08)', color: servicio===s ? '#F3F0E9' : '#9a9a97' }}>{s}</div>
            ))}
          </div>
        </div>
        <select value={dia} onChange={e => setDia(e.target.value)} className="w-full bg-[#0E0F11] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-[#F3F0E9] outline-none" style={{fontFamily:'Barlow,sans-serif'}}>
          {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={horario} onChange={e => setHorario(e.target.value)} className="w-full bg-[#0E0F11] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-[#F3F0E9] outline-none" style={{fontFamily:'Barlow,sans-serif'}}>
          {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <div className="flex gap-3">
          {COLORES.map(c => (
            <div key={c} onClick={() => setColor(c)} className="w-9 h-9 rounded-full cursor-pointer flex items-center justify-center"
              style={{ background: c, outline: color===c ? '2.5px solid #fff' : 'none', outlineOffset: '2px' }}>
              {color===c && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>}
            </div>
          ))}
        </div>
        <button onClick={confirmar} className="w-full bg-[#CE2434] text-white font-bold text-[14px] py-4 rounded-2xl border-0 cursor-pointer">
          Agregar cliente fijo
        </button>
      </div>
    </div>
  )
}
