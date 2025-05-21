import React, { useEffect, useRef, useState } from 'react'
import { Box, styled } from '@mui/material'

const BannerContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2, 0),
  marginBottom: theme.spacing(4),
  background:
    'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(245,245,245,0.5) 100%)',
}))

// Full width container
const ScrollContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  overflow: 'hidden',
}))

const ScrollRow = styled(Box)({
  display: 'flex',
  width: '100%',
  overflow: 'hidden',
  position: 'relative',
  marginBottom: 16,
})

const InfiniteTrack = styled(Box)<{ direction: 'left' | 'right' }>(
  ({ direction }) => ({
    display: 'flex',
    position: 'relative',
    width: 'max-content',
    animation: `${
      direction === 'left' ? 'moveLeft' : 'moveRight'
    } 30s linear infinite`,
  })
)

const IconWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 60,
  height: 60,
  marginRight: 30,
  flexShrink: 0,
})

const MenuScrollBanner = () => {
  const [initialized, setInitialized] = useState(false)
  const firstRowRef = useRef<HTMLDivElement>(null)
  const secondRowRef = useRef<HTMLDivElement>(null)

  const allSvgs = [
    '寿司.svg',
    '寿司 (1).svg',
    '寿司-20.svg',
    '寿司-35.svg',
    '寿司 (2).svg',
  ]

  // Shuffle SVGs to mix them up
  const shuffleSvgs = (arr: string[]) => {
    const newArr = [...arr]
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
    }
    return newArr
  }

  const firstRowSvgs = shuffleSvgs([...allSvgs, ...allSvgs, ...allSvgs])
  const secondRowSvgs = shuffleSvgs([...allSvgs, ...allSvgs, ...allSvgs])

  // Set up infinite scrolling with dynamic CSS
  useEffect(() => {
    // Create and inject CSS animation keyframes
    const setupInfiniteScroll = () => {
      // Only run once
      if (initialized) return

      if (!firstRowRef.current || !secondRowRef.current) return

      // Get the actual width of the content
      const firstRowWidth = firstRowRef.current.scrollWidth
      const secondRowWidth = secondRowRef.current.scrollWidth

      // Create keyframes animations with the actual widths
      const styleSheet = document.createElement('style')
      styleSheet.innerHTML = `
        @keyframes moveLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${firstRowWidth / 2}px); }
        }
        
        @keyframes moveRight {
          0% { transform: translateX(-${secondRowWidth / 2}px); }
          100% { transform: translateX(0); }
        }
      `
      document.head.appendChild(styleSheet)

      setInitialized(true)
    }

    setupInfiniteScroll()

    // Add a small delay to ensure the DOM is ready
    const timer = setTimeout(setupInfiniteScroll, 300)

    return () => {
      clearTimeout(timer)
    }
  }, [initialized])

  return (
    <BannerContainer>
      <ScrollContainer>
        {/* First row - scrolling left */}
        <ScrollRow>
          <InfiniteTrack direction="left" ref={firstRowRef}>
            {/* First copy */}
            {firstRowSvgs.map((svg, index) => (
              <IconWrapper key={`first-${index}`}>
                <img
                  src={`/svgsforScrollVelocity/${svg}`}
                  alt={`Sushi icon ${index}`}
                  style={{ width: '100%', height: '100%' }}
                />
              </IconWrapper>
            ))}
            {/* Second copy (exact duplicate) for seamless loop */}
            {firstRowSvgs.map((svg, index) => (
              <IconWrapper key={`first-dup-${index}`}>
                <img
                  src={`/svgsforScrollVelocity/${svg}`}
                  alt={`Sushi icon ${index}`}
                  style={{ width: '100%', height: '100%' }}
                />
              </IconWrapper>
            ))}
          </InfiniteTrack>
        </ScrollRow>

        {/* Second row - scrolling right */}
        <ScrollRow>
          <InfiniteTrack direction="right" ref={secondRowRef}>
            {/* First copy */}
            {secondRowSvgs.map((svg, index) => (
              <IconWrapper key={`second-${index}`}>
                <img
                  src={`/svgsforScrollVelocity/${svg}`}
                  alt={`Sushi icon ${index}`}
                  style={{ width: '100%', height: '100%' }}
                />
              </IconWrapper>
            ))}
            {/* Second copy (exact duplicate) for seamless loop */}
            {secondRowSvgs.map((svg, index) => (
              <IconWrapper key={`second-dup-${index}`}>
                <img
                  src={`/svgsforScrollVelocity/${svg}`}
                  alt={`Sushi icon ${index}`}
                  style={{ width: '100%', height: '100%' }}
                />
              </IconWrapper>
            ))}
          </InfiniteTrack>
        </ScrollRow>
      </ScrollContainer>
    </BannerContainer>
  )
}

export default MenuScrollBanner
