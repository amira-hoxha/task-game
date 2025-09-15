'use client'

import { useState, useMemo } from 'react'
import { useGame } from '@/lib/store'
import { CheckCircle2, Trash2, Shuffle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { xpForTask } from '@/lib/game'
import clsx from 'clsx'

export function TaskList() {
  const { tasks, addTask, toggleTask, deleteTask, clearDone, focusMode, updateUrgency } = useGame()
  const [title, setTitle] = useState('')
  const [estimate, setEstimate] = useState(20)
  const [unit, setUnit] = useState<'min' | 'h'>('min')
  const [urgency, setUrgency] = useState(3)

  const pending = useMemo(() => tasks.filter(t => !t.done), [tasks])
  const done = useMemo(() => tasks.filter(t => t.done), [tasks])

  function quickWin() {
    const easy = pending.slice().sort((a, b) => (a.estimateMin + a.urgency) - (b.estimateMin + b.urgency))[0]
    if (easy) {
      const el = document.getElementById(`task-${easy.id}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }], { duration: 500 })
    }
  }

  return (
    <div className="card p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-4 md:mb-3">
        <div className="font-semibold">Your Checklist</div>
        <div className="md:hidden text-sm text-white/70">
          Complete tasks to earn XP and fill the path. Focus Mode sprints help when you need urgency.
        </div>
        <div className="flex gap-2">
          <button className="btn bg-white/10 hover:bg-white/20" onClick={quickWin}>
            <Shuffle className="w-4 h-4" />
            <span className="ml-2">Quick Win</span>
          </button>
          <button className="btn bg-white/10 hover:bg-white/20" onClick={clearDone}>
            Clear Done
          </button>
        </div>
      </div>

      {!focusMode && (
        <div className="grid grid-cols-12 gap-3 md:gap-4 mb-4 mt-2 md:mt-0">
          <input
            className="input col-span-12 md:col-span-6"
            placeholder="Add a quest..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
          />
          <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 justify-end md:justify-normal">
              <label className="text-sm text-white/60">Estimate</label>
              <input
                type="number"
                min={unit === 'min' ? 5 : 0.25}
                step={unit === 'min' ? 5 : 0.25}
                value={estimate}
                onChange={(e) => setEstimate(Number(e.target.value))}
                className="input w-24 hide-spinner"
              />
            </div>
            <div className="relative flex items-center rounded-full bg-white/5 border border-white/10 p-0.5 select-none min-w-[92px] w-full h-9">
              <motion.div
                className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-brand-600/30"
                initial={false}
                animate={{ x: unit === 'min' ? '0%' : '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              />
              <button
                type="button"
                aria-pressed={unit === 'min'}
                onClick={() => toggleUnit('min')}
                className={clsx('relative z-10 w-1/2 text-center px-2 py-1 text-sm font-medium rounded-full', unit === 'min' ? 'text-white' : 'text-white/70 hover:text-white')}
              >
                min
              </button>
              <button
                type="button"
                aria-pressed={unit === 'h'}
                onClick={() => toggleUnit('h')}
                className={clsx('relative z-10 w-1/2 text-center px-2 py-1 text-sm font-medium rounded-full', unit === 'h' ? 'text-white' : 'text-white/70 hover:text-white')}
              >
                h
              </button>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
            <div className="flex items-center justify-between md:justify-end gap-2">
              <label className="text-sm text-white/60 whitespace-nowrap">Urgency</label>
              <select value={urgency} onChange={(e) => setUrgency(parseInt(e.target.value))} className="input w-28 md:w-20 shrink-0">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button onClick={submit} className="btn w-full">Add</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {pending.map(t => {
            const xp = xpForTask(t.urgency, t.estimateMin)
            return (
              <motion.div
                key={t.id}
                id={`task-${t.id}`}
                layout
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleTask(t.id)} className="text-white/60 hover:text-white">
                    <CheckCircle2 />
                  </button>
                  <div className="font-medium">{t.title}</div>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <span className="px-2 py-1 rounded bg-white/10">~{t.estimateMin}m</span>
                  <label className="px-2 py-1 rounded bg-white/10 flex items-center gap-2">
                    <span className="text-white/70">Urg</span>
                    <select
                      value={t.urgency}
                      onChange={(e) => updateUrgency(t.id, parseInt(e.target.value))}
                      className="bg-transparent outline-none border border-white/10 rounded px-1 py-0.5"
                    >
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                  <span className="px-2 py-1 rounded bg-brand-600/30 text-brand-200">+{xp} XP</span>
                  <button onClick={() => deleteTask(t.id)} className="text-white/50 hover:text-red-400">
                    <Trash2 />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {done.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-white/60">Completed ({done.length})</summary>
          <div className="mt-2 space-y-2">
            {done.map(t => (
              <div key={t.id} className={clsx('p-3 rounded-lg border', 'bg-white/[.03] border-white/10 opacity-70 line-through')}>
                {t.title}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )

  function submit() {
    if (!title.trim()) return
    const estimateMin = unit === 'h' ? Math.round(estimate * 60) : estimate
    addTask({ title: title.trim(), estimateMin, urgency })
    setTitle('')
  }

  function toggleUnit(next: 'min' | 'h') {
    if (next === unit) return
    if (next === 'h') {
      setEstimate(parseFloat((estimate / 60).toFixed(2)))
    } else {
      setEstimate(Math.max(5, Math.round(estimate * 60)))
    }
    setUnit(next)
  }
}
