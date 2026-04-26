import { useState, useEffect } from 'react'

// First day of Ashara Mubaraka 1448H
const ASHARA_DATE = new Date('2026-06-16T00:00:00')

export function getDaysUntil(target: Date): number {
  const diff = target.getTime() - Date.now()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function pad(n: number) { return String(n).padStart(2, '0') }

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })

  useEffect(() => {
    function update() {
      const diff = ASHARA_DATE.getTime() - Date.now()
      if (diff <= 0) return
      setTimeLeft({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000)  / 60000),
        secs:  Math.floor((diff % 60000)    / 1000),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex gap-6 justify-center">
      {([['Days', timeLeft.days], ['Hours', timeLeft.hours], ['Mins', timeLeft.mins], ['Secs', timeLeft.secs]] as [string, number][]).map(([lbl, val]) => (
        <div key={lbl} className="text-center">
          <div className="text-4xl font-bold font-serif text-burgundy-700">{pad(val)}</div>
          <div className="text-xs text-burgundy-400 uppercase tracking-widest mt-1">{lbl}</div>
        </div>
      ))}
    </div>
  )
}
