'use client'

import { useEffect, useMemo, useState } from 'react'
import { useGame } from '@/lib/store'
import { LEVELS } from '@/lib/game'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Gift, Crown } from 'lucide-react'

const GIFTS = [
  { title: 'Shiny Sticker Pack', emoji: '🪩' },
  { title: 'Cosmic Cursor', emoji: '🪐' },
  { title: 'Golden Checkmark', emoji: '✅' },
  { title: 'Dragon Badge', emoji: '🐉' },
  { title: 'Aurora Theme', emoji: '🌌' },
]

export function LevelUpModal() {
  const { xp, levelId } = useGame()
  const [seenAtXP, setSeenAtXP] = useState(0)
  const [open, setOpen] = useState(false)
  const level = LEVELS.find(l => l.id === levelId)!
  const gift = useMemo(() => GIFTS[Math.floor(Math.random() * GIFTS.length)], [levelId])

  useEffect(() => {
    if (xp > seenAtXP) {
      const previousLevel = LEVELS.find(l => l.id === levelId - 1)
      if (!previousLevel || xp >= previousLevel.goalXP) {
        setOpen(true)
        setSeenAtXP(xp)
        burst()
      }
    }
  }, [levelId]) // eslint-disable-line

  function burst() {
    const end = Date.now() + 600
    const frame = () => {
      confetti({
        particleCount: 4,
        startVelocity: 20,
        spread: 360,
        ticks: 60,
        gravity: 0.6,
        scalar: 0.9,
        origin: { x: Math.random(), y: Math.random() * 0.2 + 0.1 },
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="card p-6 max-w-md w-full text-center"
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
          >
            <div className="mx-auto w-14 h-14 rounded-full bg-brand-600/30 flex items-center justify-center mb-3">
              <Crown className="text-brand-300" />
            </div>
            <div className="text-2xl font-bold mb-1">Level Up!</div>
            <div className="text-white/70 mb-4">Welcome to {level.name}. {level.flavor}</div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-4">
              <div className="text-sm text-white/60 mb-1">Gift Unlocked</div>
              <div className="text-xl">{gift.emoji} {gift.title}</div>
            </div>
            <button className="btn w-full" onClick={() => setOpen(false)}>
              <Gift className="w-4 h-4" />
              <span className="ml-2">Claim and continue</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
