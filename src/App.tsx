import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'

import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ImpersonationProvider } from './contexts/ImpersonationContext'

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const NetList = lazy(() => import('./pages/NetList'))
const NetDetail = lazy(() => import('./pages/NetDetail'))
const NetNew = lazy(() => import('./pages/NetNew'))
const Profile = lazy(() => import('./pages/Profile'))
const SuperAdmin = lazy(() => import('./pages/SuperAdmin'))

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
    <span className="font-mono text-sm text-slate-400">Loading component...</span>
  </div>
)

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
      <ImpersonationProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
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
                <Route path="/admin" element={<SuperAdmin />} />
              </Route>

              {/* Catch-all - Redirect to home or dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ImpersonationProvider>
    </AuthProvider>
  )
}

export default App
