'use client'

import { useEffect, useState } from 'react'

/**
 * A thin gradient progress bar fixed to the top of the viewport that
 * fills as the reader scrolls through the article.
 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const height = document.documentElement.scrollHeight - window.innerHeight
      if (height <= 0) return
      setProgress(Math.min(100, (scrollTop / height) * 100))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent">
      <div
        className="h-full transition-[width] duration-150 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg,#ff375f,#bf5af2,#2997ff)',
        }}
      />
    </div>
  )
}
