'use client'

import { useMemo } from 'react'
import { useGame } from '@/lib/store'
import { LEVELS } from '@/lib/game'
import { Flame, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export function StatsBar() {
  const { xp, levelId, streak } = useGame()
  const level = LEVELS.find(l => l.id === levelId)!
  const next = LEVELS.find(l => l.id === levelId + 1)
  const base = levelId === 1 ? 0 : LEVELS.find(l => l.id === levelId - 1)?.goalXP ?? 0
  const displayStreak = Math.max(1, streak)
  const progress = useMemo(() => {
    const target = next?.goalXP ?? level.goalXP
    const span = (target - base) || 1
    return Math.min(1, Math.max(0, (xp - base) / span))
  }, [xp, base, next, level])

  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="flex items-center gap-3">
        <Sparkles className="text-brand-400" />
        <div>
          <div className="text-xs text-white/60">Level</div>
          <div className="text-lg font-semibold">{level.name}</div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="w-full max-w-xl">
        <div className="text-xs text-white/60 mb-1">XP to next</div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={clsx('h-3', 'bg-brand-500')}
            initial={{ width: '0%' }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>
        <div className="text-xs text-white/50 mt-1">
          {xp} XP {next ? ` / ${next.goalXP}` : ' — Max level!'}
        </div>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <Flame className="text-orange-400" />
        <div>
          <div className="text-xs text-white/60">Streak</div>
          <div className="text-lg font-semibold">{displayStreak} day{displayStreak === 1 ? '' : 's'}</div>
        </div>
      </div>
    </div>
  )
}
