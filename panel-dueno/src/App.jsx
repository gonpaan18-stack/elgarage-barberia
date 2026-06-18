import { useState } from 'react'
import StatusBar from './components/StatusBar'
import TabBar from './components/TabBar'
import Agenda from './pages/Agenda'
import Semana from './pages/Semana'
import Fijos from './pages/Fijos'
import Perfil from './pages/Perfil'

const PAGES = { agenda: Agenda, semana: Semana, fijos: Fijos, perfil: Perfil }

export default function App() {
  const [tab, setTab] = useState('agenda')
  const Page = PAGES[tab]

  return (
    <div className="h-dvh max-w-[430px] mx-auto flex flex-col bg-[#0E0F11] text-[#F3F0E9]" style={{fontFamily:'Barlow,sans-serif'}}>
      {/* Franja argentina */}
      <div className="h-1 flex-none" style={{background:'repeating-linear-gradient(135deg,#CE2434 0 8px,#F3F0E9 8px 16px,#21458F 16px 24px,#F3F0E9 24px 32px)'}} />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Page />
      </div>
      <TabBar tab={tab} setTab={setTab} onAdd={() => alert('Nuevo turno (próximamente)')} />
    </div>
  )
}
