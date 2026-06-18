export default function TabBar({ tab, setTab, onAdd }) {
  return (
    <div className="flex-none flex items-end bg-[#0B0C0E] border-t border-white/[0.07] relative" style={{paddingBottom: 'env(safe-area-inset-bottom, 16px)'}}>
      {/* 2 tabs izquierda */}
      <div className="flex flex-1 justify-around pb-2 pt-2.5">
        <TabBtn icon="agenda" label="Agenda" active={tab==='agenda'} onClick={()=>setTab('agenda')} />
        <TabBtn icon="semana" label="Semana" active={tab==='semana'} onClick={()=>setTab('semana')} />
      </div>

      {/* FAB central */}
      <div className="flex flex-col items-center pb-2 pt-1 px-4">
        <button
          onClick={onAdd}
          className="w-14 h-14 rounded-full bg-[#CE2434] flex items-center justify-center shadow-[0_10px_28px_-6px_rgba(206,36,52,0.7)] -mt-6"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <span className="text-[9px] text-[#CE2434] font-semibold mt-1 opacity-0">+</span>
      </div>

      {/* 2 tabs derecha */}
      <div className="flex flex-1 justify-around pb-2 pt-2.5">
        <TabBtn icon="fijos"  label="Fijos"  active={tab==='fijos'}  onClick={()=>setTab('fijos')} />
        <TabBtn icon="perfil" label="Perfil" active={tab==='perfil'} onClick={()=>setTab('perfil')} />
      </div>
    </div>
  )
}

function TabBtn({ icon, label, active, onClick }) {
  const c = active ? '#CE2434' : '#6b6e74'
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 bg-transparent border-0 cursor-pointer py-0.5 px-2">
      <Icon name={icon} color={c} />
      <span style={{color:c}} className="text-[9.5px] font-semibold">{label}</span>
    </button>
  )
}

function Icon({ name, color }) {
  const s = { width:22, height:22, viewBox:'0 0 24 24', fill:'none', stroke:color, strokeWidth:1.9 }
  switch(name) {
    case 'agenda': return <svg {...s}><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg>
    case 'semana': return <svg {...s}><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>
    case 'fijos':  return <svg {...s}><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>
    case 'perfil': return <svg {...s}><circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/></svg>
    default: return null
  }
}
