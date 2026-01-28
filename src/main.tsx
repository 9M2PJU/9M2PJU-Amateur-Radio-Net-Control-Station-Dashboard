import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('App: Initializing...')

try {
  const container = document.getElementById('root')
  if (!container) {
    throw new Error('Root element not found')
  }

  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log('App: Rendered successfully')
} catch (error) {
  console.error('App: Initialization failed:', error)
  // Show a basic error UI if React fails to mount
  document.body.innerHTML = `
    <div style="background: #020617; color: #ef4444; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; flex-direction: column; padding: 20px; text-align: center;">
      <h1 style="color: #fff;">9M2PJU NCS Dashboard</h1>
      <p style="color: #64748b;">A critical initialization error occurred.</p>
      <pre style="background: #1e293b; padding: 15px; border-radius: 8px; font-size: 14px; max-width: 100%; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
      <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #10b981; color: #020617; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Reload Application</button>
    </div>
  `
}
