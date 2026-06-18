import { useState, useEffect } from 'react'

const PASSWORD = 'elgarage2025'
const RP_ID = window.location.hostname
const RP_NAME = 'El Garage Panel'
const USER_ID = new Uint8Array([1])
const CRED_KEY = 'elgarage_cred_id'

function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function fromB64url(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return Uint8Array.from(atob(str), c => c.charCodeAt(0))
}

export default function Login({ onLogin }) {
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [biometria, setBiometria] = useState(false)
  const [registrado, setRegistrado] = useState(false)

  useEffect(() => {
    const soporta = !!window.PublicKeyCredential
    setBiometria(soporta)
    if (soporta && localStorage.getItem(CRED_KEY)) {
      setRegistrado(true)
      // Intentar biometría automáticamente
      loginBiometrico(true)
    }
  }, [])

  async function loginBiometrico(silencioso = false) {
    try {
      setLoading(true)
      const credId = localStorage.getItem(CRED_KEY)
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rpId: RP_ID,
          allowCredentials: credId
            ? [{ type: 'public-key', id: fromB64url(credId) }]
            : [],
          userVerification: 'required',
          timeout: 60000,
        },
      })
      if (assertion) {
        sessionStorage.setItem('elgarage_auth', '1')
        onLogin()
      }
    } catch (e) {
      if (!silencioso) setError('No se pudo verificar. Usá la contraseña.')
      setLoading(false)
    }
  }

  async function registrarBiometrico() {
    try {
      setLoading(true)
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { id: RP_ID, name: RP_NAME },
          user: { id: USER_ID, name: 'dueno', displayName: 'Dueño' },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
          authenticatorSelection: { userVerification: 'required', residentKey: 'preferred' },
          timeout: 60000,
        },
      })
      localStorage.setItem(CRED_KEY, b64url(cred.rawId))
      setRegistrado(true)
      sessionStorage.setItem('elgarage_auth', '1')
      onLogin()
    } catch (e) {
      setError('No se pudo registrar la biometría.')
      setLoading(false)
    }
  }

  function intentar(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(async () => {
      if (pass === PASSWORD) {
        sessionStorage.setItem('elgarage_auth', '1')
        // Si hay biometría disponible y no está registrada, registrar ahora
        if (biometria && !registrado) {
          try { await registrarBiometrico(); return } catch {}
        }
        onLogin()
      } else {
        setError('Contraseña incorrecta')
        setLoading(false)
        setPass('')
      }
    }, 300)
  }

  return (
    <div className="h-dvh max-w-[430px] mx-auto flex flex-col bg-[#0E0F11] text-[#F3F0E9]" style={{fontFamily:'Barlow,sans-serif'}}>
      <div className="h-1 flex-none" style={{background:'repeating-linear-gradient(135deg,#CE2434 0 8px,#F3F0E9 8px 16px,#21458F 16px 24px,#F3F0E9 24px 32px)'}} />

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.png" alt="El Garage" className="w-24 h-24 rounded-full object-cover" style={{boxShadow:'0 0 0 3px rgba(206,36,52,.3)'}}/>
          <div className="text-center">
            <p className="font-bebas text-[36px] tracking-widest text-[#F3F0E9] leading-none m-0">El Garage</p>
            <p className="text-[13px] text-[#8c8c89] m-0 mt-1">Panel del dueño</p>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          {/* Botón biometría si ya está registrado */}
          {biometria && registrado && (
            <button
              onClick={() => loginBiometrico(false)}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-[15px] border-0 cursor-pointer flex items-center justify-center gap-3"
              style={{ background: '#16181C', border: '1px solid rgba(255,255,255,.1)', color: '#F3F0E9', opacity: loading ? 0.6 : 1 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#CE2434" strokeWidth="1.8">
                <path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z"/>
                <path d="M8.5 14.5c-.83 1.17-1.5 2.67-1.5 4.5h10c0-1.83-.67-3.33-1.5-4.5"/>
                <path d="M12 12v2"/>
              </svg>
              {loading ? 'Verificando...' : 'Entrar con Face ID / Huella'}
            </button>
          )}

          {/* Separador */}
          {biometria && registrado && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10"/>
              <span className="text-[11px] text-[#4a4d54]">o con contraseña</span>
              <div className="flex-1 h-px bg-white/10"/>
            </div>
          )}

          {/* Form contraseña */}
          <form onSubmit={intentar} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Contraseña"
              value={pass}
              onChange={e => { setPass(e.target.value); setError('') }}
              autoFocus={!registrado}
              className="w-full bg-[#16181C] border rounded-2xl px-4 py-4 text-[15px] text-[#F3F0E9] outline-none text-center tracking-widest"
              style={{ fontFamily:'Barlow,sans-serif', borderColor: error ? '#CE2434' : 'rgba(255,255,255,.1)', transition: 'border-color .2s' }}
            />

            {error && <p className="text-center text-[13px] text-[#CE2434] m-0">{error}</p>}

            <button
              type="submit"
              disabled={!pass || loading}
              className="w-full py-4 rounded-2xl font-bold text-[15px] border-0 cursor-pointer"
              style={{ background: '#CE2434', color: '#fff', opacity: !pass || loading ? 0.5 : 1 }}
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-[11px] text-[#3a3d44] text-center m-0">Solo para uso del barbero</p>
      </div>
    </div>
  )
}
