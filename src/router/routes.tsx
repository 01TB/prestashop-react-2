import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '../services/backoffice/authService.tsx';
import ProtectedRoute from './ProtectedRoute.tsx';

import Home from '../pages/Home.tsx';
import LoginAuth from '../components/UI/Login/LoginAuth.tsx';
import HomeBackOffice from '../pages/backoffice/HomeBackOffice.tsx';
import ResetPage from '../pages/backoffice/ResetPage.tsx';

// On crée un composant interne pour pouvoir utiliser useAuth()
function AppContent() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* FRONT OFFICE : Libre d'accès */}
            <Route path="/" element={<Home />} />

            {/* BACK OFFICE : Route de login */}
            <Route path="/backoffice/login" element={<LoginAuth />} />

            {/* BACK OFFICE : Routes protégées */}
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} redirectPath="/backoffice/login" />}>
                <Route path="/backoffice/dashboard" element={<HomeBackOffice/>} />
                <Route path="/backoffice/reinitialisation" element={<ResetPage/>} />
                {/* Ajoutez vos autres pages backoffice ici */}
            </Route>
        </Routes>
    );
}

function AppRoutes() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default AppRoutes;