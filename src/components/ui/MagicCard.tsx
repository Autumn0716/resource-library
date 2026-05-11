import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react"

const TILT_SPRING = { stiffness: 250, damping: 20, mass: 0.5 }

function computeTiltMax(width: number): number {
  return Math.max(3, Math.min(12, width / 45))
}

interface MagicCardBaseProps {
  children?: React.ReactNode
  className?: string
  gradientSize?: number
  gradientFrom?: string
  gradientTo?: string
  gradientColor?: string
  gradientOpacity?: number
  tiltMax?: number
}

interface MagicCardGradientProps extends MagicCardBaseProps {
  mode?: "gradient"
}

interface MagicCardOrbProps extends MagicCardBaseProps {
  mode: "orb"
  glowFrom?: string
  glowTo?: string
  glowAngle?: number
  glowSize?: number
  glowBlur?: number
  glowOpacity?: number
  tiltMax?: number
}

type MagicCardProps = MagicCardGradientProps | MagicCardOrbProps
type ResetReason = "enter" | "leave" | "global" | "init"

function isOrbMode(props: MagicCardProps): props is MagicCardOrbProps {
  return props.mode === "orb"
}

export function MagicCard(props: MagicCardProps) {
  const {
    children,
    className,
    gradientSize = 200,
    gradientColor = "#c8a96e",
    gradientOpacity = 0.12,
    gradientFrom = "#c8a96e",
    gradientTo = "#e0cfa0",
    mode = "gradient",
    tiltMax: tiltMaxProp,
  } = props

  const glowFrom = isOrbMode(props) ? (props.glowFrom ?? "#c8a96e") : "#c8a96e"
  const glowTo = isOrbMode(props) ? (props.glowTo ?? "#e0cfa0") : "#e0cfa0"
  const glowAngle = isOrbMode(props) ? (props.glowAngle ?? 90) : 90
  const glowSize = isOrbMode(props) ? (props.glowSize ?? 300) : 300
  const glowBlur = isOrbMode(props) ? (props.glowBlur ?? 40) : 40
  const glowOpacity = isOrbMode(props) ? (props.glowOpacity ?? 0.3) : 0.3

  const [mounted, setMounted] = useState(false)
  const [hovering, setHovering] = useState(false)

  const cardRef = useRef<HTMLDivElement | null>(null)
  const tiltMaxRef = useRef(tiltMaxProp ?? 4)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (tiltMaxProp !== undefined) {
      tiltMaxRef.current = tiltMaxProp
      return
    }
    const el = cardRef.current
    if (!el) return
    const update = () => {
      tiltMaxRef.current = computeTiltMax(el.offsetWidth)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [tiltMaxProp])

  const mouseX = useMotionValue(-gradientSize)
  const mouseY = useMotionValue(-gradientSize)

  const rawTiltX = useMotionValue(0)
  const rawTiltY = useMotionValue(0)
  const tiltX = useSpring(rawTiltX, TILT_SPRING)
  const tiltY = useSpring(rawTiltY, TILT_SPRING)

  const orbX = useSpring(mouseX, { stiffness: 250, damping: 30, mass: 0.6 })
  const orbY = useSpring(mouseY, { stiffness: 250, damping: 30, mass: 0.6 })
  const orbVisible = useSpring(0, { stiffness: 300, damping: 35 })

  const modeRef = useRef(mode)
  const glowOpacityRef = useRef(glowOpacity)
  const gradientSizeRef = useRef(gradientSize)

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { glowOpacityRef.current = glowOpacity }, [glowOpacity])
  useEffect(() => { gradientSizeRef.current = gradientSize }, [gradientSize])

  const reset = useCallback(
    (reason: ResetReason = "leave") => {
      const currentMode = modeRef.current

      if (currentMode === "orb") {
        if (reason === "enter") orbVisible.set(glowOpacityRef.current)
        else orbVisible.set(0)
        return
      }

      const off = -gradientSizeRef.current
      mouseX.set(off)
      mouseY.set(off)
    },
    [mouseX, mouseY, orbVisible]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      mouseX.set(x)
      mouseY.set(y)

      const nx = (x / rect.width - 0.5) * 2
      const ny = (y / rect.height - 0.5) * 2
      const max = tiltMaxRef.current
      rawTiltY.set(nx * max)
      rawTiltX.set(-ny * max)
    },
    [mouseX, mouseY, rawTiltX, rawTiltY]
  )

  const handlePointerLeave = useCallback(() => {
    reset("leave")
    rawTiltX.set(0)
    rawTiltY.set(0)
    setHovering(false)
  }, [reset, rawTiltX, rawTiltY])

  const handlePointerEnter = useCallback(() => {
    reset("enter")
    setHovering(true)
  }, [reset])

  useEffect(() => { reset("init") }, [reset])

  useEffect(() => {
    const handleGlobalPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        reset("global")
        rawTiltX.set(0)
        rawTiltY.set(0)
        setHovering(false)
      }
    }
    const handleBlur = () => {
      reset("global")
      rawTiltX.set(0)
      rawTiltY.set(0)
      setHovering(false)
    }
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") {
        reset("global")
        rawTiltX.set(0)
        rawTiltY.set(0)
        setHovering(false)
      }
    }

    window.addEventListener("pointerout", handleGlobalPointerOut)
    window.addEventListener("blur", handleBlur)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.removeEventListener("pointerout", handleGlobalPointerOut)
      window.removeEventListener("blur", handleBlur)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [reset, rawTiltX, rawTiltY])

  return (
    <motion.div
      ref={cardRef}
      className={`group relative isolate overflow-hidden rounded-2xl border border-transparent h-full ${className ?? ""}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
      whileHover={{ y: -2, transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 } }}
      whileTap={{ scale: 0.985, transition: { type: "spring", stiffness: 400, damping: 20, mass: 0.4 } }}
      style={{
        willChange: "transform",
        perspective: 600,
        rotateX: tiltX,
        rotateY: tiltY,
        transformStyle: "preserve-3d",
        background: useMotionTemplate`
          linear-gradient(#ffffff 0 0) padding-box,
          radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
            ${gradientFrom},
            ${gradientTo},
            rgba(0, 0, 0, 0.08) 100%
          ) border-box
        `,
      }}
    >
      <div className="absolute inset-px z-20 rounded-[inherit] bg-white" />

      {mode === "gradient" && (
        <motion.div
          suppressHydrationWarning
          className="pointer-events-none absolute inset-px z-30 rounded-[inherit]"
          animate={{ opacity: hovering ? gradientOpacity : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            background: useMotionTemplate`
              radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
                ${gradientColor},
                transparent 100%
              )
            `,
          }}
        />
      )}

      {mode === "orb" && (
        <motion.div
          suppressHydrationWarning
          aria-hidden="true"
          className="pointer-events-none absolute z-30"
          style={{
            width: glowSize,
            height: glowSize,
            x: orbX,
            y: orbY,
            translateX: "-50%",
            translateY: "-50%",
            borderRadius: 9999,
            filter: `blur(${glowBlur}px)`,
            opacity: orbVisible,
            background: `linear-gradient(${glowAngle}deg, ${glowFrom}, ${glowTo})`,
            mixBlendMode: "multiply",
            willChange: "transform, opacity",
          }}
        />
      )}
      <div className="relative z-40 h-full" style={{ transform: "translateZ(0)" }}>{children}</div>
    </motion.div>
  )
}
