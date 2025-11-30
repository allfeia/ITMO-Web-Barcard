import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import StartPage from './StartPage.jsx'
import SignInPage from './sign-in-page/SignInPage.jsx'
import Menu from "./Menu.jsx"

import { AuthProvider } from '../src/authContext/AuthContext.jsx'
import PersonalAccount from '../src/personal-acount-page/PersonalAccountPage.jsx'

if (import.meta.env.MODE === 'development') {
    const { worker } = await import('./mocks/browser');
    await worker.start({
        onUnhandledRequest: "warn",
    });
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/signInPage" element={<SignInPage />} />
        <Route path="/account" element={<PersonalAccount/>}/>
        <Route path="/menu" element={<Menu />} />
        
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)