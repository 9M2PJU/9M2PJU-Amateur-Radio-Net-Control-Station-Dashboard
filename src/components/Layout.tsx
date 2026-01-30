import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import DonationPopup from './DonationPopup'
import { Toaster } from 'sonner'

export default function Layout() {
    return (
        <>
            <Navbar />
            <Outlet />
            <DonationPopup />
            <Toaster position="top-right" richColors theme="dark" />
        </>
    )
}
