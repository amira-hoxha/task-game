'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LEVELS, xpForTask } from './game'

export type Task = {
  id: string
  title: string
  done: boolean
  status?: 'todo' | 'progress' | 'done'
  estimateMin: number
  urgency: number
  createdAt: number
  startedAt?: number | null
  finishedAt?: number | null
  actualMin?: number | null
  subLevels?: boolean[]
  subtasks?: { id: string; title: string; done: boolean }[]
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
  celebratedMilestones: Record<string, boolean>
  pendingStreakReward: number | null
  streakRewardsClaimed: number[]

  addTask: (t: Omit<Task, 'id' | 'done' | 'createdAt'>) => void
  toggleTask: (id: string) => void
  setTaskStatus: (id: string, status: 'todo' | 'progress' | 'done') => void
  deleteTask: (id: string) => void
  clearDone: () => void
  updateUrgency: (id: string, urgency: number) => void
  startTask: (id: string) => void
  completeTask: (id: string, actualMin?: number | null) => void
  setActualMin: (id: string, minutes: number | null) => void
  toggleSublevel: (id: string, index: number) => void
  markMilestoneCelebrated: (id: string) => void
  claimStreakReward: () => void
  addSubtask: (taskId: string, title: string) => void
  toggleSubtask: (taskId: string, subId: string) => void
  deleteSubtask: (taskId: string, subId: string) => void

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
  streak: 1,
  lastCompleteDay: null,
  sprintActive: false,
  sprintEndsAt: null,
  focusMode: false,
  quoteSeenDay: null,
  celebratedMilestones: {},
  pendingStreakReward: null,
  streakRewardsClaimed: [],

  addTask: ({ title, estimateMin, urgency }) => set(s => ({
    tasks: [
      ...s.tasks,
      {
        id: crypto.randomUUID(),
        title,
        estimateMin: Math.max(5, estimateMin),
        urgency: Math.min(5, Math.max(1, urgency)),
        done: false,
        status: 'todo',
        createdAt: Date.now(),
        subLevels: [false, false, false],
        subtasks: [],
      },
    ],
  })),

  toggleTask: (id: string) => {
    const s = get()
    const current = s.tasks.find(t => t.id === id)
    const wasDone = current?.status ? current.status === 'done' : current?.done
    s.setTaskStatus(id, wasDone ? 'todo' : 'done')
  },

  setTaskStatus: (id: string, status: 'todo' | 'progress' | 'done') => {
    const s = get()
    const task = s.tasks.find(t => t.id === id)
    if (!task) return

    const wasDone = task.status ? task.status === 'done' : task.done
    const willBeDone = status === 'done'
    let addXP = 0
    let streak = s.streak
    let last = s.lastCompleteDay

    if (!wasDone && willBeDone) {
      addXP = xpForTask(task.urgency, task.estimateMin)
      const k = todayKey()
      if (s.lastCompleteDay === k) {
        streak = Math.max(1, s.streak)
      } else {
        if (s.lastCompleteDay) {
          const prev = new Date(s.lastCompleteDay)
          const cur = new Date()
          const diff = Math.floor((cur.getTime() - prev.getTime()) / 86400000)
          streak = diff === 1 ? Math.max(1, s.streak) + 1 : 1
        } else {
          streak = 1
        }
        last = k
      }
      // Set streak reward for special days if not already claimed
      const milestones = [3, 7, 14, 21, 30]
      const already = new Set(s.streakRewardsClaimed)
      const reward = milestones.find(d => d === streak && !already.has(d))
      if (reward) {
        set({ pendingStreakReward: reward })
      }
    } else if (wasDone && !willBeDone) {
      addXP = -xpForTask(task.urgency, task.estimateMin)
    }

    const newXP = Math.max(0, s.xp + addXP)
    const newLevel = computeLevel(newXP)

    set({
      tasks: s.tasks.map(t => t.id === id ? { ...t, status, done: status === 'done' } : t),
      xp: newXP,
      levelId: newLevel,
      streak,
      lastCompleteDay: last,
    })
  },

  deleteTask: (id: string) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),
  clearDone: () => set(s => ({ tasks: s.tasks.filter(t => (t.status ? t.status !== 'done' : !t.done)) })),
  updateUrgency: (id: string, urgency: number) => set(s => ({
    tasks: s.tasks.map(t => t.id === id ? { ...t, urgency: Math.min(5, Math.max(1, urgency)) } : t)
  })),

  startTask: (id: string) => {
    const s = get()
    set({
      tasks: s.tasks.map(t => t.id === id ? { ...t, status: 'progress', done: false, startedAt: Date.now() } : t)
    })
  },

  completeTask: (id: string, actualMin?: number | null) => {
    const s = get()
    const task = s.tasks.find(t => t.id === id)
    if (!task) return
    const minutes = actualMin ?? (task.startedAt ? Math.round((Date.now() - task.startedAt) / 60000) : undefined)
    s.setTaskStatus(id, 'done')
    set({
      tasks: get().tasks.map(t => t.id === id ? { ...t, finishedAt: Date.now(), actualMin: minutes ?? t.actualMin ?? null } : t)
    })
  },

  setActualMin: (id: string, minutes: number | null) => set(s => ({
    tasks: s.tasks.map(t => t.id === id ? { ...t, actualMin: minutes } : t)
  })),

  toggleSublevel: (id: string, index: number) => set(s => ({
    tasks: s.tasks.map(t => {
      if (t.id !== id) return t
      const arr = t.subLevels ? [...t.subLevels] : [false, false, false]
      arr[index] = !arr[index]
      return { ...t, subLevels: arr }
    })
  })),

  markMilestoneCelebrated: (id: string) => set(s => ({
    celebratedMilestones: { ...s.celebratedMilestones, [id]: true }
  })),

  claimStreakReward: () => set(s => ({
    pendingStreakReward: null,
    streakRewardsClaimed: s.pendingStreakReward ? [...s.streakRewardsClaimed, s.pendingStreakReward] : s.streakRewardsClaimed,
  })),

  addSubtask: (taskId: string, title: string) => set(s => ({
    tasks: s.tasks.map(t => t.id === taskId ? {
      ...t,
      subtasks: [...(t.subtasks ?? []), { id: crypto.randomUUID(), title, done: false }]
    } : t)
  })),
  toggleSubtask: (taskId: string, subId: string) => set(s => ({
    tasks: s.tasks.map(t => t.id === taskId ? {
      ...t,
      subtasks: (t.subtasks ?? []).map(st => st.id === subId ? { ...st, done: !st.done } : st)
    } : t)
  })),
  deleteSubtask: (taskId: string, subId: string) => set(s => ({
    tasks: s.tasks.map(t => t.id === taskId ? {
      ...t,
      subtasks: (t.subtasks ?? []).filter(st => st.id !== subId)
    } : t)
  })),
  startSprint: (minutes: number) => set({
    sprintActive: true,
    sprintEndsAt: Date.now() + minutes * 60_000,
    focusMode: true,
  }),
  stopSprint: () => set({ sprintActive: false, sprintEndsAt: null }),
  toggleFocusMode: () => set(s => ({ focusMode: !s.focusMode })),
  markQuoteSeenToday: () => set({ quoteSeenDay: todayKey() }),
}), {
  name: 'questlist-v1',
  version: 2,
  migrate: (state: unknown, version: number) => {
    const s = state as Partial<State> & { streak?: number }
    if (version < 2 && s) {
      // Ensure streak never shows 0 after migration
      return { ...s, streak: Math.max(1, s.streak ?? 1) }
    }
    return state as State
  },
}))
