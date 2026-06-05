'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import AIChat from './AIChat'

// Floating AI knop - opent AIChat overlay
// Verborgen op de locatie en chat pagina zelf
export default function FloatingAI() {
  const pathname = usePathname()
  const [chatOpen, setChatOpen] = useState(false)

  // Verberg op locatie pagina en volledig scherm paginas
  const hideOn = ['/locatie', '/fotos']
  if (hideOn.includes(pathname)) return null

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setChatOpen(true)}
            className="ai-fab"
            whileTap={{ scale: 0.9 }}
            style={{
              bottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom, 0px) + 14px)',
            }}
          >
            ✨
          </motion.button>
        )}
      </AnimatePresence>

      {/* AIChat overlay */}
      <AnimatePresence>
        {chatOpen && (
          <AIChat onClose={() => setChatOpen(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
