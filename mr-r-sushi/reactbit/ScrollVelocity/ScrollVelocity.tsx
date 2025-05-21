import React, { useRef, useLayoutEffect, useState } from 'react'
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from 'framer-motion'

interface VelocityMapping {
  input: [number, number]
  output: [number, number]
}

interface VelocitySvgProps {
  svgFileName: string
  baseVelocity: number
  scrollContainerRef?: React.RefObject<HTMLElement>
  className?: string
  damping?: number
  stiffness?: number
  numCopies?: number
  velocityMapping?: VelocityMapping
  parallaxClassName?: string
  scrollerClassName?: string
  parallaxStyle?: React.CSSProperties
  scrollerStyle?: React.CSSProperties
  svgWidth?: number
  svgHeight?: number
  svgGap?: number
}

interface ScrollVelocityProps {
  scrollContainerRef?: React.RefObject<HTMLElement>
  svgFiles: string[]
  velocity?: number
  className?: string
  damping?: number
  stiffness?: number
  numCopies?: number
  velocityMapping?: VelocityMapping
  parallaxClassName?: string
  scrollerClassName?: string
  parallaxStyle?: React.CSSProperties
  scrollerStyle?: React.CSSProperties
  svgWidth?: number
  svgHeight?: number
  svgGap?: number
}

// Generic type parameter T extends HTMLElement for flexibility
function useElementWidth<T extends HTMLElement>(
  ref: React.RefObject<T | null>
): number {
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    function updateWidth() {
      if (ref.current) {
        setWidth(ref.current.offsetWidth)
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [ref])

  return width
}

export const ScrollVelocity: React.FC<ScrollVelocityProps> = ({
  scrollContainerRef,
  svgFiles = [],
  velocity = 100,
  className = '',
  damping = 50,
  stiffness = 400,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle,
  svgWidth = 80,
  svgHeight = 80,
  svgGap = 40,
}) => {
  function VelocitySvg({
    svgFileName,
    baseVelocity = velocity,
    scrollContainerRef,
    className = '',
    damping,
    stiffness,
    numCopies,
    velocityMapping,
    parallaxClassName,
    scrollerClassName,
    parallaxStyle,
    scrollerStyle,
    svgWidth,
    svgHeight,
    svgGap,
  }: VelocitySvgProps) {
    const baseX = useMotionValue(0)
    const scrollOptions = scrollContainerRef
      ? { container: scrollContainerRef }
      : {}
    const { scrollY } = useScroll(scrollOptions)
    const scrollVelocity = useVelocity(scrollY)
    const smoothVelocity = useSpring(scrollVelocity, {
      damping: damping ?? 50,
      stiffness: stiffness ?? 400,
    })
    const velocityFactor = useTransform(
      smoothVelocity,
      velocityMapping?.input || [0, 1000],
      velocityMapping?.output || [0, 5],
      { clamp: false }
    )

    const copyRef = useRef<HTMLDivElement>(null)
    const copyWidth = useElementWidth<HTMLDivElement>(copyRef)

    function wrap(min: number, max: number, v: number): number {
      const range = max - min
      const mod = (((v - min) % range) + range) % range
      return mod + min
    }

    const x = useTransform(baseX, (v) => {
      if (copyWidth === 0) return '0px'
      return `${wrap(-copyWidth, 0, v)}px`
    })

    const directionFactor = useRef<number>(1)
    useAnimationFrame((t, delta) => {
      let moveBy = directionFactor.current * baseVelocity * (delta / 1000)

      if (velocityFactor.get() < 0) {
        directionFactor.current = -1
      } else if (velocityFactor.get() > 0) {
        directionFactor.current = 1
      }

      moveBy += directionFactor.current * moveBy * velocityFactor.get()
      baseX.set(baseX.get() + moveBy)
    })

    const svgElements = Array.from({ length: numCopies || 0 }, (_, i) => (
      <div
        className={`flex-shrink-0 ${className}`}
        key={i}
        ref={i === 0 ? copyRef : undefined}
        style={{
          width: svgWidth,
          height: svgHeight,
          marginRight: svgGap,
          display: 'inline-block',
        }}>
        <img
          src={`/svgsforScrollVelocity/${svgFileName}`}
          alt={`Scrolling SVG ${i}`}
          className="w-full h-full"
        />
      </div>
    ))

    return (
      <div
        className={`${parallaxClassName} relative overflow-hidden`}
        style={parallaxStyle}>
        <motion.div
          className={`${scrollerClassName} flex whitespace-nowrap`}
          style={{ x, ...scrollerStyle }}>
          {svgElements}
        </motion.div>
      </div>
    )
  }

  return (
    <section>
      {svgFiles.map((svgFile: string, index: number) => (
        <VelocitySvg
          key={index}
          className={className}
          svgFileName={svgFile}
          baseVelocity={index % 2 !== 0 ? -velocity : velocity}
          scrollContainerRef={scrollContainerRef}
          damping={damping}
          stiffness={stiffness}
          numCopies={numCopies}
          velocityMapping={velocityMapping}
          parallaxClassName={parallaxClassName}
          scrollerClassName={scrollerClassName}
          parallaxStyle={parallaxStyle}
          scrollerStyle={scrollerStyle}
          svgWidth={svgWidth}
          svgHeight={svgHeight}
          svgGap={svgGap}
        />
      ))}
    </section>
  )
}

export default ScrollVelocity
