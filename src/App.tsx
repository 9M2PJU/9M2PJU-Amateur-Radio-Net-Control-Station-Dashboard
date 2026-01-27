import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
// Import other pages as they are created
import Dashboard from '@/pages/Dashboard'
import Nets from '@/pages/Nets'
import NewNet from '@/pages/NewNet'
import NetDetail from '@/pages/NetDetail'
import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes (wrapped in Layout) */}
                <Route element={<Layout />}>
                    {/* Placeholders for now */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/nets" element={<Nets />} />
                    <Route path="/nets/new" element={<NewNet />} />
                    <Route path="/nets/:id" element={<NetDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
