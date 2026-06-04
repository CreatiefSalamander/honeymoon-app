import { Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import Layout from './components/Layout'
import { useTrip } from './lib/store'
import Login from './pages/Login'
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
import Dagboek from './pages/Dagboek'
import Meldingen from './pages/Meldingen'
import Favorieten from './pages/Favorieten'
import Weer from './pages/Weer'
import Vluchten from './pages/Vluchten'

// Nihi-achtige soepele glij: spring-easing, korte duur
const variants = {
  initial: { opacity: 0, x: 36 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -28 },
}
const trans = { duration: 0.42, ease: [0.22, 1, 0.36, 1] as any }

export default function App() {
  const location = useLocation()
  const { loggedIn } = useTrip()

  useEffect(() => { document.getElementById('scroll')?.scrollTo({ top: 0 }) }, [location.pathname])

  if (!loggedIn) return <Login />

  return (
    <Layout>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={location.pathname} variants={variants} initial="initial" animate="in" exit="out" transition={trans}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/bucketlist" element={<Bucketlist />} />
            <Route path="/travel" element={<TravelPlan />} />
            <Route path="/packing" element={<Packing />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/dagboek" element={<Dagboek />} />
            <Route path="/meldingen" element={<Meldingen />} />
            <Route path="/favorieten" element={<Favorieten />} />
            <Route path="/weer" element={<Weer />} />
            <Route path="/vluchten" element={<Vluchten />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}
