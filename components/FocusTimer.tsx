'use client'

import { useEffect, useState } from 'react'
import { useGame } from '@/lib/store'
import { AlarmClock, Power, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function FocusTimer() {
  const { sprintActive, sprintEndsAt, startSprint, stopSprint, toggleFocusMode, focusMode } = useGame()
  const [mins, setMins] = useState(15)
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      if (sprintActive && sprintEndsAt) {
        const left = Math.max(0, sprintEndsAt - Date.now())
        setRemaining(left)
        if (left === 0) stopSprint()
      } else {
        setRemaining(0)
      }
    }, 200)
    return () => clearInterval(id)
  }, [sprintActive, sprintEndsAt, stopSprint])

  const mm = String(Math.floor(remaining / 60000)).padStart(2, '0')
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlarmClock className="text-brand-400" />
        <div className="font-semibold">Sprint</div>
        <div className="text-white/50 text-sm">Race the map</div>
      </div>

      <AnimatePresence mode="wait">
        {sprintActive ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="flex items-center justify-between"
          >
            <div className="text-4xl tabular-nums font-bold">{mm}:{ss}</div>
            <div className="flex gap-2">
              <button className="btn bg-red-600 hover:bg-red-500" onClick={stopSprint}>
                <XCircle className="w-4 h-4" />
                <span className="ml-2">Stop</span>
              </button>
              <button className="btn" onClick={toggleFocusMode}>
                <Power className="w-4 h-4" />
                <span className="ml-2">{focusMode ? 'Exit Focus' : 'Focus Mode'}</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-3"
          >
            <input
              type="range" min={5} max={50} step={5} value={mins}
              onChange={(e) => setMins(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="w-16 text-right tabular-nums">{mins}m</div>
            <button className="btn" onClick={() => startSprint(mins)}>Start</button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="text-xs text-white/50 mt-2">
        Tip: Only show essentials in Focus Mode to help active procrastinators channel urgency.
      </div>
    </div>
  )
}
