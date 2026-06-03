import { Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Agenda from './pages/Agenda'
import Explore from './pages/Explore'
import Budget from './pages/Budget'
import Bucketlist from './pages/Bucketlist'
import TravelPlan from './pages/TravelPlan'
import Packing from './pages/Packing'
import Chat from './pages/Chat'
import Settings from './pages/Settings'
import Profile from './pages/Profile'

const variants = {
  initial: { opacity: 0, x: 28 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -24 },
}

export default function App() {
  const location = useLocation()

  // Scroll naar boven bij paginawissel
  useEffect(() => { document.getElementById('scroll')?.scrollTo({ top: 0 }) }, [location.pathname])

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} variants={variants} initial="initial" animate="in" exit="out"
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/bucketlist" element={<Bucketlist />} />
            <Route path="/travel" element={<TravelPlan />} />
            <Route path="/packing" element={<Packing />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}
