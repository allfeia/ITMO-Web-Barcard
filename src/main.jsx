import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from "../src/ProtectedRoute.jsx"
import { createRoot } from 'react-dom/client'
import StartPage from './StartPage.jsx'
import SignInPage from './sign-in-page/SignInPage.jsx'
import Menu from "./Menu.jsx"
import AdminPage from "../src/admin/AdminPage.jsx"
import AdminRegisterBarmanForm from "../src/admin/bar-admin/AdminRegisterBarmanForm.jsx"
import AdminRegisterBarForm from '../src/admin/super-admin/AdminRegisterBarForm.jsx'
import SuperGrantBarAdminPage from "../src/admin/super-admin/SuperGrantBarAdminPage.jsx"
import SuperAssignUserPage from "../src/admin/super-admin/SuperAssignUserPage.jsx"
import SuperLoginPage from "../src/admin/super-admin/SuperLoginPage.jsx"

import { AuthProvider } from '../src/authContext/AuthContext.jsx'


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
        <Route path="/menu" element={<Menu />} />
        
        {/* Супер-админ*/}
          <Route path="/super/login" element={<SuperLoginPage />} />
          <Route
            path="/super/bars/new"
            element={
              <ProtectedRoute allow={['super_admin']}>
                <AdminRegisterBarForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super/assign"
            element={
              <ProtectedRoute allow={['super_admin']}>
                <SuperAssignUserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super/grant"
            element={
              <ProtectedRoute allow={['super_admin']}>
                <SuperGrantBarAdminPage />
              </ProtectedRoute>
            }
          />

          {/* Бар-админ */}
          <Route
            path="/admin/staff/register"
            element={
              <ProtectedRoute allow={['bar_admin']}>
                <AdminRegisterBarmanForm />
              </ProtectedRoute>
            }
          />

          {/* Общая админская страница */}
          <Route
            path="/administration"
            element={
              <ProtectedRoute allow={['super_admin','bar_admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)