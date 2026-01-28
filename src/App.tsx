import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Loader2 } from 'lucide-react'

// Lazy load pages for code splitting (Performance Optimization)
const Home = lazy(() => import('@/pages/Home'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Nets = lazy(() => import('@/pages/Nets'))
const NewNet = lazy(() => import('@/pages/NewNet'))
const NetDetail = lazy(() => import('@/pages/NetDetail'))
const Profile = lazy(() => import('@/pages/Profile'))
const Settings = lazy(() => import('@/pages/Settings'))

// Loading fallback component
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
    </div>
)

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <Suspense fallback={<PageLoader />}>
                <Home />
            </Suspense>
        ),
    },
    {
        path: "/login",
        element: (
            <Suspense fallback={<PageLoader />}>
                <Login />
            </Suspense>
        ),
    },
    {
        path: "/register",
        element: (
            <Suspense fallback={<PageLoader />}>
                <Register />
            </Suspense>
        ),
    },
    {
        element: <Layout />,
        children: [
            {
                path: "/dashboard",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <Dashboard />
                    </Suspense>
                ),
            },
            {
                path: "/nets",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <Nets />
                    </Suspense>
                ),
            },
            {
                path: "/nets/new",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <NewNet />
                    </Suspense>
                ),
            },
            {
                path: "/nets/:id",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <NetDetail />
                    </Suspense>
                ),
            },
            {
                path: "/profile",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <Profile />
                    </Suspense>
                ),
            },
            {
                path: "/settings",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <Settings />
                    </Suspense>
                ),
            },
        ],
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
])

export default function App() {
    return <RouterProvider router={router} />
}
