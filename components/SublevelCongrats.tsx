'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function SublevelCongrats({ triggerKey, label }: { triggerKey: string; label: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!triggerKey) return
    setOpen(true)
    const id = setTimeout(() => setOpen(false), 1400)
    return () => clearTimeout(id)
  }, [triggerKey])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
        >
          <div className="px-4 py-2 rounded-full bg-black/70 border border-white/10 backdrop-blur text-sm">
            🎉 {label}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


