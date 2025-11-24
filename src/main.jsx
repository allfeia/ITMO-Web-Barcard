import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import StartPage from './StartPage.jsx'
import SignInPage from "./sign-in-page/SignInPage.jsx";
import Menu from "./menu-template-page/Menu.jsx";
import Account from "./Account.jsx";
import LevelPage from "./LevelPage.jsx";

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
          <Route path="/signInPage" element={<SignInPage />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/account" element={<Account />} />
          <Route path="/levelPage" element={<LevelPage />} />

      </Routes>
  </BrowserRouter>
)
