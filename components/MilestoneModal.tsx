'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '@/lib/store'
import { Gift, Flag } from 'lucide-react'

export function MilestoneModal() {
  const { tasks, celebratedMilestones, markMilestoneCelebrated } = useGame()
  const [open, setOpen] = useState(false)
  const [taskId, setTaskId] = useState<string | null>(null)

  const winner = useMemo(() => {
    return tasks.find(t => (t.subLevels ?? []).length === 3 && (t.subLevels ?? []).every(Boolean) && !celebratedMilestones?.[t.id])
  }, [tasks, celebratedMilestones])

  useEffect(() => {
    if (winner) {
      setTaskId(winner.id)
      setOpen(true)
    }
  }, [winner])

  function close() {
    if (taskId) markMilestoneCelebrated(taskId)
    setOpen(false)
  }

  if (!winner) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="card p-6 max-w-md w-full text-center"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: -10 }}
          >
            <div className="mx-auto w-14 h-14 rounded-full bg-brand-600/30 flex items-center justify-center mb-3">
              <Flag className="text-brand-300" />
            </div>
            <div className="text-2xl font-bold mb-1">Milestone Complete!</div>
            <div className="text-white/80 mb-4">You finished all sub-steps for “{winner.title}”. Nicely done.</div>
            <button className="btn w-full" onClick={close}>
              <Gift className="w-4 h-4" />
              <span className="ml-2">Claim high-five</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


