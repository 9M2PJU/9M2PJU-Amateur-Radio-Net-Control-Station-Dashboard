import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('App: Initializing...')

try {
  const container = document.getElementById('root')
  if (!container) throw new Error('Root element not found')

  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (error) {
  console.error('App: Initialization failed:', error)
}
