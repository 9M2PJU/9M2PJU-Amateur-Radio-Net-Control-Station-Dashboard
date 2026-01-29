import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { Toaster } from 'sonner'

export default function Layout() {
    return (
        <>
            <Navbar />
            <Outlet />
            <Toaster position="top-right" richColors theme="dark" />
        </>
    )
}
