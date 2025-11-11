import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './mode-page/mode-page.css'
import ModePage from './mode-page/ModePage.jsx'
import StartPage from './StartPage.jsx'
import SignInPage from "./sign-in-page/SignInPage.jsx";
import Menu from "./Menu.jsx";

if (import.meta.env.MODE === 'development') {
    const { worker } = await import('./mocks/browser');
    await worker.start({
        onUnhandledRequest: "warn",
    });
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/modePage" element={<ModePage />} />
          <Route path="/signInPage" element={<SignInPage />} />
          <Route path="/Menu" element={<Menu />} />
      </Routes>
  </BrowserRouter>
)
