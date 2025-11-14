"use client"
import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"

interface BlurTextProps {
  text: string
  className?: string
  animateBy?: "words" | "letters"
  direction?: "top" | "bottom"
  delay?: number
  stepDuration?: number
  threshold?: number
  rootMargin?: string
  onAnimationComplete?: () => void
}

export function BlurText({
  text,
  className = "",
  animateBy = "words",
  direction = "top",
  delay = 200,
  stepDuration = 0.35,
  threshold = 0.1,
  rootMargin = "0px",
  onAnimationComplete,
}: BlurTextProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: rootMargin, amount: threshold })
  const [animationCompleted, setAnimationCompleted] = useState(false)

  const units = animateBy === "words" ? text.split(" ") : text.split("")

  useEffect(() => {
    if (isInView && !animationCompleted) {
      const timer = setTimeout(() => {
        setAnimationCompleted(true)
        onAnimationComplete?.()
      }, units.length * delay + stepDuration * 1000)

      return () => clearTimeout(timer)
    }
  }, [isInView, animationCompleted, units.length, delay, stepDuration, onAnimationComplete])

  return (
    <motion.div
      ref={ref}
      className={className}
    >
      {units.map((unit, index) => (
        <motion.span
          key={index}
          className={animateBy === "words" ? "inline-block mr-2" : "inline-block"}
          initial={{
            filter: "blur(10px)",
            opacity: 0,
            y: direction === "top" ? -20 : 20,
          }}
          animate={
            isInView
              ? {
                  filter: "blur(0px)",
                  opacity: 1,
                  y: 0,
                }
              : {
                  filter: "blur(10px)",
                  opacity: 0,
                  y: direction === "top" ? -20 : 20,
                }
          }
          transition={{
            duration: stepDuration,
            delay: index * (delay / 1000),
            ease: "easeOut",
          }}
        >
          {unit}
        </motion.span>
      ))}
    </motion.div>
  )
}