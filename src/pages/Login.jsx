import { useState } from 'react'

const PASSWORD = 'elgarage2025'

export default function Login({ onLogin }) {
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  function intentar(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (pass === PASSWORD) {
        sessionStorage.setItem('elgarage_auth', '1')
        onLogin()
      } else {
        setError(true)
        setLoading(false)
        setPass('')
      }
    }, 400)
  }

  return (
    <div className="h-dvh max-w-[430px] mx-auto flex flex-col bg-[#0E0F11] text-[#F3F0E9]" style={{fontFamily:'Barlow,sans-serif'}}>
      <div className="h-1 flex-none" style={{background:'repeating-linear-gradient(135deg,#CE2434 0 8px,#F3F0E9 8px 16px,#21458F 16px 24px,#F3F0E9 24px 32px)'}} />

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.png" alt="El Garage" className="w-24 h-24 rounded-full object-cover" style={{boxShadow:'0 0 0 3px rgba(206,36,52,.3)'}}/>
          <div className="text-center">
            <p className="font-bebas text-[36px] tracking-widest text-[#F3F0E9] leading-none m-0">El Garage</p>
            <p className="text-[13px] text-[#8c8c89] m-0 mt-1">Panel del dueño</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={intentar} className="w-full flex flex-col gap-3">
          <div className="relative">
            <input
              type="password"
              placeholder="Contraseña"
              value={pass}
              onChange={e => { setPass(e.target.value); setError(false) }}
              autoFocus
              className="w-full bg-[#16181C] border rounded-2xl px-4 py-4 text-[15px] text-[#F3F0E9] outline-none text-center tracking-widest"
              style={{
                fontFamily: 'Barlow,sans-serif',
                borderColor: error ? '#CE2434' : 'rgba(255,255,255,.1)',
                transition: 'border-color .2s',
              }}
            />
          </div>

          {error && (
            <p className="text-center text-[13px] text-[#CE2434] m-0">
              Contraseña incorrecta
            </p>
          )}

          <button
            type="submit"
            disabled={!pass || loading}
            className="w-full py-4 rounded-2xl font-bold text-[15px] border-0 cursor-pointer transition-opacity"
            style={{
              background: '#CE2434',
              color: '#fff',
              opacity: !pass || loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-[11px] text-[#3a3d44] text-center m-0">
          Solo para uso del barbero
        </p>
      </div>
    </div>
  )
}
