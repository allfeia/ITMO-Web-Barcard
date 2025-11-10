import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './mode-page/mode-page.css'
import ModePage from './mode-page/ModePage.jsx'
import StartPage from './StartPage.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/modePage" element={<ModePage />} />
      </Routes>
  </BrowserRouter>
)
