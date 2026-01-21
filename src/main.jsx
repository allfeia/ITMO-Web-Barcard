import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {Provider} from "react-redux";
import ProtectedRoute from "./ProtectedRoute.jsx"
import { createRoot } from 'react-dom/client'
import StartPage from './start-page/StartPage.jsx'
import SignInPage from './sign-in-page/SignInPage.jsx'
import MenuPage from "./menu-page/MenuPage.jsx"
import AdminPage from "./admin/AdminPage.jsx"
import AdminRegisterBarmanForm from "./admin/bar-admin/AdminRegisterBarmanForm.jsx"
import AdminRegisterBarForm from './admin/super-admin/AdminRegisterBarForm.jsx'
import SuperGrantBarAdminPage from "./admin/super-admin/SuperGrantBarAdminPage.jsx"
import SuperAssignUserPage from "./admin/super-admin/SuperAssignUserPage.jsx"
import SuperLoginPage from "./admin/super-admin/SuperLoginPage.jsx"
import "./commonStyles.css";
import { AuthProvider } from './authContext/AuthContext.jsx'
import PersonalAccountPage from "./personal-acount-page/PersonalAccountPage.jsx";
import LevelPage from "./level-page/LevelPage.jsx";
import FavouritesPage from "./favourites-page/FavouritesPage.jsx";
import PasswordPage from "./password-page/PasswordPage.jsx";
import IngredientsPage from "./ingredients-page/IngredientsPage.jsx";
import {persistor, store} from "./game/store";
import {PersistGate} from "redux-persist/integration/react";
import ProportionsPage from "./proportions-page/ProportionsPage.jsx";

import * as Sentry from "@sentry/react";

Sentry.init({
    dsn: "https://ff863d9ec402606b1c0666c164a5ba2f@o4510535321255936.ingest.us.sentry.io/4510535479132160",
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE || "development",
});

if (import.meta.env.MODE === 'development') {
    const { worker } = await import('./mocks/browser.js');
    await worker.start({
        onUnhandledRequest: "bypass",
    });
}

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<StartPage />} />
                        <Route path="/signInPage" element={<SignInPage />} />
                        <Route path="/menu" element={<MenuPage />} />
                        <Route path="/account" element={<PersonalAccountPage />} />
                        <Route path="/levelPage" element={<LevelPage />} />
                        <Route path="/favourities" element={<FavouritesPage />} />
                        <Route path="/password" element={<PasswordPage />} />
                        <Route path="/ingredients" element={<IngredientsPage />} />
                        <Route path="/proportions" element={<ProportionsPage />} />

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
        </PersistGate>
    </Provider>
)