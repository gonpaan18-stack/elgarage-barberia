import { useState, useEffect } from 'react'

export default function StatusBar() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(`${now.getHours()}:${now.getMinutes().toString().padStart(2,'0')}`)
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="flex items-center justify-between px-6 pt-4 pb-1.5 flex-none">
      <span className="text-[15px] font-bold text-[#F3F0E9]">{time}</span>
      <div className="flex items-center gap-1.5">
        <svg width="17" height="12" viewBox="0 0 17 12" fill="#F3F0E9"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="4.7" y="6" width="3" height="6" rx="1"/><rect x="9.4" y="3" width="3" height="9" rx="1"/><rect x="14" y="0" width="3" height="12" rx="1"/></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="#F3F0E9"><path d="M8 11.4l2.1-2.6a3 3 0 0 0-4.2 0L8 11.4zM8 5.6a6.3 6.3 0 0 1 4.4 1.8l1.4-1.7A8.6 8.6 0 0 0 8 3.4a8.6 8.6 0 0 0-5.8 2.3l1.4 1.7A6.3 6.3 0 0 1 8 5.6z"/></svg>
        <svg width="26" height="13" viewBox="0 0 26 13"><rect x="1" y="1" width="21" height="11" rx="3.2" fill="none" stroke="#F3F0E9" strokeOpacity=".45"/><rect x="3" y="3" width="16" height="7" rx="1.6" fill="#F3F0E9"/><rect x="23.2" y="4.5" width="2" height="4" rx="1" fill="#F3F0E9" fillOpacity=".45"/></svg>
      </div>
    </div>
  )
}
