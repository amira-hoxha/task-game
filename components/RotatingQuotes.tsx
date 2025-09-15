'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const QUOTES = [
  { text: 'Start tiny. Momentum beats motivation.', emoji: '🌱' },
  { text: 'Two minutes now > zero later.', emoji: '⏱️' },
  { text: 'Progress, not perfection.', emoji: '✨' },
  { text: 'Make it easy. Remove friction.', emoji: '🧩' },
  { text: 'Action creates clarity.', emoji: '🔭' },
  { text: 'You only need the first step.', emoji: '🚶' },
]

export function RotatingQuotes({ intervalMs = 15000 }: { intervalMs?: number }) {
  const [idx, setIdx] = useState(0)
  const quote = useMemo(() => QUOTES[idx % QUOTES.length], [idx])

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % QUOTES.length), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return (
    <div className="card p-5 md:p-6 border-brand-500/20 bg-gradient-to-r from-brand-600/20 via-white/5 to-brand-600/20">
      <div className="text-xs uppercase tracking-wide text-white/60 mb-2">Focus fuel</div>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="text-lg md:text-xl font-semibold flex items-center gap-3"
        >
          <span className="text-2xl md:text-3xl select-none">{quote.emoji}</span>
          <span className="leading-relaxed">{quote.text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}


