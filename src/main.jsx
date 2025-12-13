import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from "../src/ProtectedRoute.jsx"
import { createRoot } from 'react-dom/client'
import StartPage from './start-page/StartPage.jsx'
import SignInPage from './sign-in-page/SignInPage.jsx'
import MenuPage from "./menu-page/MenuPage.jsx"
import AdminPage from "../src/admin/AdminPage.jsx"
import AdminRegisterBarmanForm from "../src/admin/bar-admin/AdminRegisterBarmanForm.jsx"
import AdminRegisterBarForm from '../src/admin/super-admin/AdminRegisterBarForm.jsx'
import SuperGrantBarAdminPage from "../src/admin/super-admin/SuperGrantBarAdminPage.jsx"
import SuperAssignUserPage from "../src/admin/super-admin/SuperAssignUserPage.jsx"
import SuperLoginPage from "../src/admin/super-admin/SuperLoginPage.jsx"
import "./commonStyles.css";

import { AuthProvider } from './authContext/AuthContext.jsx'
import PersonalAccountPage from "./personal-acount-page/PersonalAccountPage.jsx";
import LevelPage from "./LevelPage.jsx";
import FavouritesPage from "./favourites-page/FavouritesPage.jsx";


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
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/account" element={<PersonalAccountPage />} />
        <Route path="/levelPage" element={<LevelPage />} />
        <Route path="/favourities" element={<FavouritesPage />} />
        
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