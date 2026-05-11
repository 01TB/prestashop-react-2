import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../services/backoffice/authService.tsx';
import { FrontofficeAuthProvider, useFrontofficeAuth } from '../services/frontoffice/authService.tsx';
import ProtectedRoute from './ProtectedRoute.tsx';

import Home from '../pages/Home.tsx';
import LoginAuthBackoffice from '../components/UI/Login/LoginAuthBackoffice.tsx';
import LoginAuthFrontoffice from '../components/UI/Login/LoginAuthFrontoffice.tsx';
import HomeBackOffice from '../pages/backoffice/HomeBackOffice.tsx';
import ResetPage from '../pages/backoffice/ResetPage.tsx';
import ListOrders from '../pages/backoffice/orders/ListOrders.tsx';
import DetailsOrder from '../pages/backoffice/orders/DetailsOrder.tsx';
import ListProductsFrontoffice from '../pages/frontoffice/products/ListProducts.tsx';

// On crée un composant interne pour pouvoir utiliser useAuth()
function AppContent() {
    const { isAuthenticated } = useAuth();
    const { isAuthenticated: isFrontofficeAuthenticated } = useFrontofficeAuth();

    return (
        <Routes>
            {/* FRONT OFFICE : Redirection par défaut */}
            <Route path="/" element={<Navigate to="/frontoffice/login" replace />} />

            {/* FRONT OFFICE : Route de login */}
            <Route path="/frontoffice/login" element={<LoginAuthFrontoffice />} />

            {/* FRONT OFFICE : Routes protégées */}
            <Route element={<ProtectedRoute isAuthenticated={isFrontofficeAuthenticated} redirectPath="/frontoffice/login" />}>
                <Route path="/frontoffice/produits" element={<ListProductsFrontoffice />} />
            </Route>

            {/* BACK OFFICE : Route de login */}
            <Route path="/backoffice/login" element={<LoginAuthBackoffice />} />

            {/* BACK OFFICE : Routes protégées */}
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} redirectPath="/backoffice/login" />}>
                <Route path="/backoffice/dashboard" element={<HomeBackOffice/>} />
                <Route path="/backoffice/commandes" element={<ListOrders/>} />
                <Route path="/backoffice/commandes/:orderId" element={<DetailsOrder/>} />
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
                <FrontofficeAuthProvider>
                    <AppContent />
                </FrontofficeAuthProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default AppRoutes;