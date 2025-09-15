import { Trophy, Rocket, Mountain, Crown, Star } from 'lucide-react'
import type React from 'react'

export type Level = {
  id: number
  name: string
  goalXP: number
  color: string
  icon: React.ComponentType<{ className?: string }>
  flavor: string
}

export const LEVELS: Level[] = [
  { id: 1, name: 'Trailhead', goalXP: 100, color: '#5B73FF', icon: Rocket,  flavor: 'You set out on your journey.' },
  { id: 2, name: 'Forest Run', goalXP: 250, color: '#7F96FF', icon: Star,   flavor: 'The trees cheer you on.' },
  { id: 3, name: 'Cliffside',  goalXP: 500, color: '#A6BAFF', icon: Mountain, flavor: 'The air is brisk and bright.' },
  { id: 4, name: 'Summit',     goalXP: 900, color: '#C8D6FF', icon: Trophy, flavor: 'Clouds part. You glow.' },
  { id: 5, name: 'Crown Peak', goalXP: 1400, color: '#E6EDFF', icon: Crown, flavor: 'Legend status unlocked.' },
]

export const BASE_XP_PER_TASK = 20

export function xpForTask(urgency: number, estimateMin: number) {
  const urgencyBoost = 1 + (urgency - 3) * 0.15
  const estimateBoost = Math.min(1.8, 0.8 + Math.sqrt(Math.max(5, estimateMin)) / 5)
  return Math.round(BASE_XP_PER_TASK * urgencyBoost * estimateBoost)
}
