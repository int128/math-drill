import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { HashRouter, Route, Routes } from 'react-router'
import { ClearPage } from './pages/ClearPage.tsx'
import { PlayPage } from './pages/PlayPage.tsx'
import { SelectPage } from './pages/SelectPage.tsx'

const root = document.getElementById('root')
if (root === null) {
  throw new Error('root element not found')
}
createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route index element={<SelectPage />} />
        <Route path="play" element={<PlayPage />} />
        <Route path="clear" element={<ClearPage />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
