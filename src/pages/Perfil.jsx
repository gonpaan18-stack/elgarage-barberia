import { useState, useEffect } from 'react'
import { getData, setData } from '../api'

const INITIAL = {
  nombre: 'El Garage',
  direccion: 'R. de Escalada, Lanús',
  telefono: '+54 9 11 0000-0000',
  horarioSemana: '10:00 – 20:00',
  horarioSabado: '09:00 – 19:00',
  intervalo: '20 min',
  link: 'elgarage.com/turnos',
  precios: { corte: '14.000', promo: '26.000', nino: '12.000', barba: '6.000' }
}

export default function Perfil({ onLogout }) {
  const [data, setLocalData] = useState(INITIAL)
  const [guardado, setGuardado] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getData('perfil').then(p => {
      if (p) setLocalData(prev => ({ ...prev, ...p }))
      setCargando(false)
    })
  }, [])

  function set(key, val) { setLocalData(prev => ({ ...prev, [key]: val })) }
  function setPrecio(key, val) { setLocalData(prev => ({ ...prev, precios: { ...prev.precios, [key]: val } })) }

  async function guardar() {
    await setData('perfil', data)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  if (cargando) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#CE2434] border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto px-5 pt-3 pb-6 gap-4">
      <div className="flex items-center gap-4 pt-2">
        <img src="/logo.png" alt="El Garage" className="w-16 h-16 rounded-full object-cover flex-none"/>
        <div>
          <p className="font-bebas text-[26px] text-[#F3F0E9] leading-none m-0">Erik Fenanti</p>
          <p className="text-[12px] text-[#8c8c89] m-0">El Garage · Barbero</p>
        </div>
      </div>

      {guardado && (
        <div className="bg-[#4caf72]/20 border border-[#4caf72]/40 text-[#4caf72] text-[12px] font-semibold text-center py-2 rounded-xl">
          ✓ Cambios guardados y sincronizados
        </div>
      )}

      <Section title="Negocio">
        <EditRow label="Nombre"    value={data.nombre}    onSave={v => set('nombre', v)}/>
        <EditRow label="Dirección" value={data.direccion} onSave={v => set('direccion', v)}/>
        <EditRow label="Teléfono"  value={data.telefono}  onSave={v => set('telefono', v)} type="tel"/>
      </Section>

      <Section title="Horarios">
        <EditRow label="Lunes a viernes" value={data.horarioSemana} onSave={v => set('horarioSemana', v)} placeholder="ej: 10:00 – 20:00"/>
        <EditRow label="Sábados"         value={data.horarioSabado} onSave={v => set('horarioSabado', v)} placeholder="ej: 09:00 – 19:00"/>
        <StaticRow label="Domingos" value="Cerrado" dim/>
      </Section>

      <Section title="Servicios y precios">
        <EditRow label="Corte"            value={`$${data.precios.corte}`}  onSave={v => setPrecio('corte',  v.replace(/\$/g,'').trim())}/>
        <EditRow label="Promo padre/hijo" value={`$${data.precios.promo}`} onSave={v => setPrecio('promo',  v.replace(/\$/g,'').trim())}/>
        <EditRow label="Corte niño"       value={`$${data.precios.nino}`}   onSave={v => setPrecio('nino',   v.replace(/\$/g,'').trim())}/>
        <EditRow label="Barba"            value={`$${data.precios.barba}`}  onSave={v => setPrecio('barba',  v.replace(/\$/g,'').trim())}/>
      </Section>

      <Section title="App">
        <EditRow label="Intervalo de turnos" value={data.intervalo} onSave={v => set('intervalo', v)} placeholder="ej: 20 min"/>
        <EditRow label="Link de reservas"    value={data.link}      onSave={v => set('link', v)} link/>
      </Section>

      <button onClick={guardar} className="w-full bg-[#CE2434] text-white text-[14px] font-bold py-4 rounded-2xl cursor-pointer border-0">
        Guardar cambios
      </button>
      <button onClick={onLogout} className="w-full bg-[#16181C] border border-white/10 text-[#8c8c89] text-[13px] font-semibold py-3.5 rounded-2xl cursor-pointer">
        Cerrar sesión
      </button>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[11px] font-bold tracking-widest text-[#CE2434] mb-2 uppercase m-0">{title}</p>
      <div className="bg-[#16181C] border border-white/[0.08] rounded-2xl overflow-hidden">{children}</div>
    </div>
  )
}

function EditRow({ label, value, onSave, type = 'text', placeholder, link }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (!editing && draft !== value) setDraft(value)

  return (
    <div className="flex items-center px-4 py-3 border-b border-white/[0.06] last:border-0 gap-2">
      <span className="text-[13px] text-[#9a9a97] flex-none w-32">{label}</span>
      {editing ? (
        <div className="flex-1 flex items-center gap-2">
          <input autoFocus type={type} value={draft} placeholder={placeholder}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter'){onSave(draft);setEditing(false)} if(e.key==='Escape'){setDraft(value);setEditing(false)} }}
            className="flex-1 bg-[#0E0F11] border border-[#CE2434] rounded-lg px-2 py-1 text-[13px] text-[#F3F0E9] outline-none font-semibold min-w-0"
            style={{fontFamily:'Barlow,sans-serif'}}/>
          <button onClick={() => { onSave(draft); setEditing(false) }} className="text-[#CE2434] text-[12px] font-bold bg-transparent border-0 cursor-pointer flex-none">OK</button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-between cursor-pointer group" onClick={() => { setDraft(value); setEditing(true) }}>
          <span className={`text-[13px] font-semibold ${link ? 'text-[#CE2434]' : 'text-[#dcdcd8]'}`}>{value}</span>
          <svg className="opacity-0 group-hover:opacity-60 transition-opacity" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#cfcfca" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </div>
      )}
    </div>
  )
}

function StaticRow({ label, value, dim }) {
  return (
    <div className="flex justify-between items-center px-4 py-3 border-b border-white/[0.06] last:border-0">
      <span className="text-[13px] text-[#9a9a97]">{label}</span>
      <span className={`text-[13px] font-semibold ${dim ? 'text-[#6b6e74]' : 'text-[#dcdcd8]'}`}>{value}</span>
    </div>
  )
}
