'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LEVELS, xpForTask } from './game'

export type Task = {
  id: string
  title: string
  done: boolean
  estimateMin: number
  urgency: number
  createdAt: number
}

type State = {
  tasks: Task[]
  xp: number
  levelId: number
  streak: number
  lastCompleteDay: string | null
  sprintActive: boolean
  sprintEndsAt: number | null
  focusMode: boolean
  quoteSeenDay: string | null

  addTask: (t: Omit<Task, 'id' | 'done' | 'createdAt'>) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  clearDone: () => void
  updateUrgency: (id: string, urgency: number) => void

  startSprint: (minutes: number) => void
  stopSprint: () => void
  toggleFocusMode: () => void
  markQuoteSeenToday: () => void
}

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
}

function computeLevel(xp: number) {
  let current = LEVELS[0].id
  for (const lvl of LEVELS) {
    if (xp >= lvl.goalXP) current = lvl.id
  }
  return current
}

export const useGame = create<State>()(persist((set, get) => ({
  tasks: [],
  xp: 0,
  levelId: 1,
  streak: 0,
  lastCompleteDay: null,
  sprintActive: false,
  sprintEndsAt: null,
  focusMode: false,
  quoteSeenDay: null,

  addTask: ({ title, estimateMin, urgency }) => set(s => ({
    tasks: [
      ...s.tasks,
      {
        id: crypto.randomUUID(),
        title,
        estimateMin: Math.max(5, estimateMin),
        urgency: Math.min(5, Math.max(1, urgency)),
        done: false,
        createdAt: Date.now(),
      },
    ],
  })),

  toggleTask: (id: string) => {
    const s = get()
    const tasks = s.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
    const flipped = s.tasks.find(t => t.id === id)
    let addXP = 0
    let streak = s.streak
    let last = s.lastCompleteDay

    if (flipped && !flipped.done) {
      addXP = xpForTask(flipped.urgency, flipped.estimateMin)
      const k = todayKey()
      if (s.lastCompleteDay === k) {
        streak = s.streak
      } else {
        if (s.lastCompleteDay) {
          const prev = new Date(s.lastCompleteDay)
          const cur = new Date()
          const diff = Math.floor((cur.getTime() - prev.getTime()) / 86400000)
          streak = diff === 1 ? s.streak + 1 : 1
        } else {
          streak = 1
        }
        last = k
      }
    } else if (flipped && flipped.done) {
      addXP = -xpForTask(flipped.urgency, flipped.estimateMin)
    }

    const newXP = Math.max(0, s.xp + addXP)
    const newLevel = computeLevel(newXP)

    set({
      tasks,
      xp: newXP,
      levelId: newLevel,
      streak,
      lastCompleteDay: last,
    })
  },

  deleteTask: (id: string) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),
  clearDone: () => set(s => ({ tasks: s.tasks.filter(t => !t.done) })),
  updateUrgency: (id: string, urgency: number) => set(s => ({
    tasks: s.tasks.map(t => t.id === id ? { ...t, urgency: Math.min(5, Math.max(1, urgency)) } : t)
  })),

  startSprint: (minutes: number) => set({
    sprintActive: true,
    sprintEndsAt: Date.now() + minutes * 60_000,
    focusMode: true,
  }),
  stopSprint: () => set({ sprintActive: false, sprintEndsAt: null }),
  toggleFocusMode: () => set(s => ({ focusMode: !s.focusMode })),
  markQuoteSeenToday: () => set({ quoteSeenDay: todayKey() }),
}), { name: 'questlist-v1' }))
