'use client'

import { useState, useMemo } from 'react'
import { useGame } from '@/lib/store'
import { CheckCircle2, Trash2, Shuffle, Play, Pause, Check } from 'lucide-react'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { xpForTask } from '@/lib/game'
import clsx from 'clsx'

export function TaskList() {
  const { tasks, addTask, toggleTask, deleteTask, clearDone, focusMode, updateUrgency, startTask, setTaskStatus, completeTask, toggleSublevel } = useGame()
  const [title, setTitle] = useState('')
  const [estimate, setEstimate] = useState(20)
  const [unit, setUnit] = useState<'min' | 'h'>('min')
  const [urgency, setUrgency] = useState(3)
  const [clearedPulse, setClearedPulse] = useState(false)

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
          <button
            className={clsx('btn relative overflow-hidden bg-white/10 hover:bg-white/20')}
            onClick={() => {
              clearDone()
              setClearedPulse(true)
              // subtle confetti burst
              confetti({ particleCount: 16, spread: 60, startVelocity: 20, gravity: 0.8, scalar: 0.8, ticks: 80, origin: { x: 0.85, y: 0.15 } })
              setTimeout(() => setClearedPulse(false), 2000)
            }}
            aria-label="Clear Done"
          >
            <span className={clsx('transition-opacity', clearedPulse ? 'opacity-0' : 'opacity-100')}>Clear Done</span>
            {clearedPulse && (
              <>
                <motion.span className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <Check className="w-4 h-4" />
                </motion.span>
                <motion.span
                  className="absolute inset-0 rounded-lg ring-2 ring-green-400/60"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </>
            )}
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
                className="p-3 rounded-lg bg-white/5 border border-white/10"
              >
                {/* Row 1: title + actions */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => toggleTask(t.id)} className="text-white/60 hover:text-white">
                      <CheckCircle2 />
                    </button>
                    <div className="font-medium truncate pr-2">{t.title}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {t.status === 'progress' ? (
                      <button title="Pause" onClick={() => setTaskStatus(t.id, 'todo')} className="rounded-md px-2 py-1 bg-brand-600/25 text-brand-200 hover:bg-brand-600/35"><Pause className="w-4 h-4" /></button>
                    ) : (
                      <button title="Start" onClick={() => startTask(t.id)} className="rounded-md px-2 py-1 text-white/70 hover:text-white hover:bg-white/10"><Play className="w-4 h-4" /></button>
                    )}
                    <button title="Done" onClick={() => completeTask(t.id)} className="rounded-md px-2 py-1 text-white/70 hover:text-white hover:bg-white/10"><Check className="w-4 h-4" /></button>
                    <button onClick={() => deleteTask(t.id)} className="rounded-md px-2 py-1 text-white/50 hover:text-red-400 hover:bg-white/10"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Row 2: compact chips */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/70">
                  <span className="px-2 py-1 rounded bg-white/10">~{t.estimateMin}m</span>
                  <label className="px-2 py-1 rounded bg-white/10 flex items-center gap-1">
                    <span>Urg</span>
                    <select value={t.urgency} onChange={(e) => updateUrgency(t.id, parseInt(e.target.value))} className="bg-transparent outline-none border border-white/10 rounded px-1 py-0.5">
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                  <span className="px-2 py-1 rounded bg-brand-600/30 text-brand-200">+{xp} XP</span>
                  <div className="ml-auto flex items-center gap-1">
                    {[0,1,2].map((i) => (
                      <button key={i} title="Sub-milestone" onClick={() => toggleSublevel(t.id, i)} className={clsx('w-7 h-7 rounded-full border flex items-center justify-center', (t.subLevels ?? [false,false,false])[i] ? 'bg-brand-600 text-white border-brand-500' : 'bg-white/5 border-white/15 text-white/50 hover:text-white')}>
                        {i === 0 ? '🪄' : i === 1 ? '⭐' : '🏁'}
                      </button>
                    ))}
                  </div>
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
