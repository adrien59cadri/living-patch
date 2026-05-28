import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Polyfill AFRAME for three-bmfont-text dependency
// This is needed because react-force-graph has transitive dependencies
// that expect AFRAME to be available globally
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).AFRAME = (window as any).AFRAME || {}
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
