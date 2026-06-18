import { useState } from 'react'
import TabBar from './components/TabBar'
import Agenda from './pages/Agenda'
import Semana from './pages/Semana'
import Fijos from './pages/Fijos'
import Perfil from './pages/Perfil'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

const PAGES = { agenda: Agenda, semana: Semana, fijos: Fijos, perfil: Perfil, dashboard: Dashboard }

export default function App() {
  const [auth, setAuth] = useState(!!sessionStorage.getItem('elgarage_auth'))
  const [tab, setTab] = useState('agenda')
  const [fabModal, setFabModal] = useState(false)
  const Page = PAGES[tab]

  if (!auth) return <Login onLogin={() => setAuth(true)} />

  return (
    <div className="h-dvh max-w-[430px] mx-auto flex flex-col bg-[#0E0F11] text-[#F3F0E9]" style={{fontFamily:'Barlow,sans-serif'}}>
      <div className="h-1 flex-none" style={{background:'repeating-linear-gradient(135deg,#CE2434 0 8px,#F3F0E9 8px 16px,#21458F 16px 24px,#F3F0E9 24px 32px)'}} />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Page onLogout={() => { sessionStorage.removeItem('elgarage_auth'); setAuth(false) }} fabModal={fabModal} onCloseFab={() => setFabModal(false)} />
      </div>
      <TabBar tab={tab} setTab={setTab} onAdd={() => setFabModal(true)} />
    </div>
  )
}
