import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { HashRouter, Route, Routes } from 'react-router'
import App from './App.tsx'

const root = document.getElementById('root')
if (root === null) {
  throw new Error('root element not found')
}
createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route index element={<App />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
