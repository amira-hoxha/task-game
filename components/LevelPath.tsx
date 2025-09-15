'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LEVELS } from '@/lib/game'
import { useGame } from '@/lib/store'
import clsx from 'clsx'

export function LevelPath() {
  const { xp, levelId } = useGame()

  const { d, progress, nodes } = useMemo(() => {
    const d = `M 20 260
               C 160 200, 120 140, 260 120
               S 420 80, 520 120
               S 700 200, 880 160`
    const maxGoal = LEVELS[LEVELS.length - 1].goalXP
    const progress = Math.min(1, xp / maxGoal)
    const nodes = LEVELS.map((lvl, i) => ({
      x: (i / (LEVELS.length - 1)) * 900 * 0.9 + 40,
      y: [260, 190, 140, 120, 160][i] ?? 160,
      active: levelId >= lvl.id,
      lvl,
    }))
    return { d, progress, nodes }
  }, [xp, levelId])

  // Compute coordinates for a pulsing marker at the head of the progress path
  const pathRef = useRef<SVGPathElement>(null)
  const [marker, setMarker] = useState<{ x: number; y: number; angle: number }>({ x: 20, y: 260, angle: 0 })

  useEffect(() => {
    const el = pathRef.current
    if (!el) return
    try {
      const total = el.getTotalLength()
      const len = Math.max(0, Math.min(total, total * progress))
      const p = el.getPointAtLength(len)
      const prev = el.getPointAtLength(Math.max(0, len - 1))
      const angle = Math.atan2(p.y - prev.y, p.x - prev.x) * 180 / Math.PI
      setMarker({ x: p.x, y: p.y, angle })
    } catch {}
  }, [progress, d])

  return (
    <div className="card p-4 h-[340px] relative overflow-hidden">
      {/* Colorful animated background */}
      <div className="aurora">
        <div className="aurora-blob" style={{ left: -40, top: 40, background: 'radial-gradient(closest-side, rgba(91,115,255,.6), transparent)' }} />
        <div className="aurora-blob" style={{ right: -60, top: -20, background: 'radial-gradient(closest-side, rgba(166,186,255,.5), transparent)', animationDelay: '1.2s' }} />
        <div className="aurora-blob" style={{ left: '40%', bottom: -80, background: 'radial-gradient(closest-side, rgba(127,150,255,.45), transparent)', animationDelay: '2.4s' }} />
        {/* Shooting stars */}
        <div className="shooting-star" style={{ left: 80, top: 20, animationDelay: '0.4s' }} />
        <div className="shooting-star" style={{ left: 260, top: 40, animationDelay: '1.2s' }} />
        <div className="shooting-star" style={{ left: 520, top: 10, animationDelay: '2.1s' }} />
        <div className="shooting-star" style={{ left: 720, top: 30, animationDelay: '2.8s' }} />
      </div>
      <div className="font-semibold mb-2">Quest Map</div>
      <svg viewBox="0 0 920 280" className="w-full h-[240px]">
        {/* Base path with subtle glow */}
        <path d={d} stroke="rgba(255,255,255,.10)" strokeWidth={12} fill="none" strokeLinecap="round" />
        {/* Transparent path used to measure marker position */}
        <path ref={pathRef} d={d} stroke="transparent" fill="none" />
        <motion.path
          d={d}
          stroke="url(#grad)"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress }}
          transition={{ type: 'spring', stiffness: 60, damping: 20 }}
        />
        <defs>
          <linearGradient id="grad" x1="0" x2="1">
            <stop offset="0%" stopColor="#5B73FF" />
            <stop offset="35%" stopColor="#7F96FF" />
            <stop offset="65%" stopColor="#A6BAFF" />
            <stop offset="100%" stopColor="#C8D6FF" />
          </linearGradient>
        </defs>

        {nodes.map((n) => {
          const Icon = n.lvl.icon
          return (
            <g key={n.lvl.id} transform={`translate(${n.x}, ${n.y})`}>
              {n.active && n.lvl.id === levelId && (
                <circle r={26} fill="none" stroke={n.lvl.color} strokeOpacity={0.25} className="animate-pulse" />
              )}
              <circle r={16} fill={n.active ? n.lvl.color : 'rgba(255,255,255,.08)'} stroke="white" strokeOpacity={0.12} />
              <foreignObject x={-12} y={-12} width="24" height="24">
                <div className="w-6 h-6 flex items-center justify-center">
                  <Icon className={clsx('w-4 h-4', n.active ? 'text-black/80' : 'text-white/50')} />
                </div>
              </foreignObject>
              <text x={0} y={36} textAnchor="middle" className="fill-white/70 text-[10px]">{n.lvl.name}</text>
            </g>
          )
        })}

        {/* Pulsing dot marker slightly offset forward */}
        <g transform={`translate(${marker.x}, ${marker.y}) rotate(${marker.angle}) translate(10,0)`}>
          <motion.circle
            r={14}
            fill="none"
            stroke="rgba(166,186,255,.7)"
            strokeWidth={2}
            initial={{ scale: 1, opacity: 0.65 }}
            animate={{ scale: [1, 1.75], opacity: [0.65, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
          <circle r={9} fill="#C8D6FF" />
        </g>
      </svg>
      <div className="absolute inset-0 pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent_96%)]" />
      <div className="text-xs text-white/60">Fill the path by completing tasks to reach the next level.</div>
    </div>
  )
}
