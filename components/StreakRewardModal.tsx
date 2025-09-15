'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '@/lib/store'
import { CalendarHeart, Gift } from 'lucide-react'

const REWARDS: Record<number, { title: string; emoji: string; note: string }> = {
  3: { title: 'Warm-up Streak', emoji: '🔥', note: '+25 bonus XP' },
  7: { title: 'One‑Week Hero', emoji: '🏅', note: 'New theme color' },
  14: { title: 'Fortnight Focus', emoji: '🌙', note: 'Profile badge' },
  21: { title: 'Momentum Master', emoji: '🚀', note: 'Extra confetti' },
  30: { title: 'Month of Mastery', emoji: '👑', note: 'Big XP boost' },
}

export function StreakRewardModal() {
  const { pendingStreakReward, claimStreakReward } = useGame()
  const data = pendingStreakReward ? REWARDS[pendingStreakReward] : null
  const open = Boolean(data)

  if (!data) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={claimStreakReward}>
          <motion.div onClick={(e) => e.stopPropagation()} className="card p-6 max-w-md w-full text-center" initial={{ scale: 0.94, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: -10 }}>
            <div className="mx-auto w-14 h-14 rounded-full bg-brand-600/30 flex items-center justify-center mb-3">
              <CalendarHeart className="text-brand-300" />
            </div>
            <div className="text-2xl font-bold mb-1">{data.emoji} Streak Reward!</div>
            <div className="text-white/80 mb-2">{data.title}</div>
            <div className="text-white/60 mb-4">{data.note}</div>
            <button className="btn w-full" onClick={claimStreakReward}>
              <Gift className="w-4 h-4" />
              <span className="ml-2">Claim</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


