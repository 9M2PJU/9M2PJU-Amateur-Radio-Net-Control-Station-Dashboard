import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NetList from './pages/NetList'
import NetDetail from './pages/NetDetail'
import NetNew from './pages/NetNew'
import Profile from './pages/Profile'
import Layout from './components/Layout'

import { AuthProvider, useAuth } from './contexts/AuthContext'

// Protected Route Wrapper
function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <Layout />
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/nets" element={<NetList />} />
            <Route path="/nets/new" element={<NetNew />} />
            <Route path="/nets/:id" element={<NetDetail />} />
          </Route>

          {/* Catch-all - Redirect to home or dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
