'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/lib/store'
import { Sparkles } from 'lucide-react'

const QUOTES = [
  { text: 'Done is better than perfect.', emoji: '✨' },
  { text: 'Tiny steps beat zero steps.', emoji: '🐾' },
  { text: 'Two minutes now, momentum later.', emoji: '⏱️' },
  { text: 'You don\u2019t need more time, just a tiny start.', emoji: '🚀' },
  { text: 'Make it easy. Reduce friction. Begin.', emoji: '🧩' },
  { text: 'Progress > procrastination.', emoji: '🌱' },
]

export function DailyMotivation() {
  const { quoteSeenDay, markQuoteSeenToday } = useGame()
  const [open, setOpen] = useState(false)
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [])

  useEffect(() => {
    const today = new Date()
    const key = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`
    if (quoteSeenDay !== key) setOpen(true)
  }, [quoteSeenDay])

  function close() {
    markQuoteSeenToday()
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="card p-6 max-w-md w-full text-center border-white/15"
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -8, opacity: 0, scale: 0.98 }}
          >
            <div className="mx-auto w-14 h-14 rounded-full bg-brand-600/30 flex items-center justify-center mb-3">
              <Sparkles className="text-brand-300" />
            </div>
            <div className="text-xl font-semibold mb-1">Daily Boost</div>
            <div className="text-white/80 text-lg mb-4"><span className="mr-2">{quote.emoji}</span>{quote.text}</div>
            <button className="btn w-full" onClick={close}>Let2s go</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


