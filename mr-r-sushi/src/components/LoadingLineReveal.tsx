import { useState, useEffect } from 'react'
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  useMotionTemplate, 
  useMotionValueEvent,
  animate,
  AnimatePresence
} from 'framer-motion'

interface LoadingLineRevealProps {
  isLoading: boolean
  progress?: number
  children: React.ReactNode
}

const LoadingLineReveal = ({ isLoading, progress = 0, children }: LoadingLineRevealProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [internalProgress, setInternalProgress] = useState(0)

  // Use either provided progress or simulate loading
  const currentProgress = progress || internalProgress

  const leftEdge = useMotionValue("calc(50% - 1px)")
  const rightEdge = useMotionValue("calc(50% + 1px)")
  const topEdge = useTransform(() => currentProgress, [0, 1], ["50%", "0%"])
  const bottomEdge = useTransform(() => currentProgress, [0, 1], ["50%", "100%"])

  const clipPath = useMotionTemplate`polygon(
    0% 0%, ${leftEdge} 0%, ${leftEdge} ${topEdge}, 
    ${leftEdge} ${bottomEdge}, ${rightEdge} ${bottomEdge}, 
    ${rightEdge} ${topEdge}, ${leftEdge} ${topEdge}, 
    ${leftEdge} 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%
  )`

  // Simulate loading progress if not provided
  useEffect(() => {
    if (progress !== undefined) return

    if (isLoading && !isLoaded) {
      const interval = setInterval(() => {
        setInternalProgress(prev => {
          const next = prev + 0.02 + Math.random() * 0.03
          return next >= 1 ? 1 : next
        })
      }, 50)

      return () => clearInterval(interval)
    }
  }, [isLoading, isLoaded, progress])

  // Handle completion
  useEffect(() => {
    if (!isLoading && currentProgress >= 0.9) {
      setInternalProgress(1)
    }
  }, [isLoading, currentProgress])

  // Trigger reveal animation when loaded
  useEffect(() => {
    if (currentProgress >= 1 && !isLoaded) {
      setIsLoaded(true)
    }
  }, [currentProgress, isLoaded])

  useEffect(() => {
    if (!isLoaded) return

    const transition = {
      type: "spring",
      duration: 0.6,
      bounce: 0,
    }

    animate(leftEdge, "calc(0% - 0px)", transition)
    animate(rightEdge, "calc(100% + 0px)", transition)
  }, [isLoaded, leftEdge, rightEdge])

  // Reset when loading starts again
  useEffect(() => {
    if (isLoading && isLoaded) {
      setIsLoaded(false)
      setInternalProgress(0)
      leftEdge.set("calc(50% - 1px)")
      rightEdge.set("calc(50% + 1px)")
    }
  }, [isLoading, isLoaded, leftEdge, rightEdge])

  return (
    <div className="relative w-full h-full">
      {children}
      
      <AnimatePresence>
        {!isLoaded && (
          <>
            {/* Dark overlay */}
            <motion.div
              className="absolute inset-0 bg-modern-dark z-50"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            />
            
            {/* Accent overlay with line reveal */}
            <motion.div 
              className="absolute inset-0 bg-accent-gold z-40"
              style={{ clipPath }}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            />

            {/* Loading text */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-60 text-modern-light"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                <motion.div
                  className="w-8 h-8 border-2 border-modern-light border-t-transparent rounded-full animate-spin mx-auto mb-4"
                  style={{ borderTopColor: 'transparent' }}
                />
                <motion.p 
                  className="text-sm font-medium tracking-wide"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  加载中...
                </motion.p>
                <motion.div
                  className="mt-2 text-xs text-modern-light/70"
                >
                  {Math.round(currentProgress * 100)}%
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LoadingLineReveal