import { Routes, Route } from 'react-router-dom'
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

export default function App() {
  return (
    <Routes>
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
  )
}
