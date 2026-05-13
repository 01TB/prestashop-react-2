import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../services/backoffice/authService.tsx';
import { FrontofficeAuthProvider, useFrontofficeAuth } from '../services/frontoffice/authService.tsx';
import ProtectedRoute from './ProtectedRoute.tsx';

import LoginAuthBackoffice from '../components/UI/Login/LoginAuthBackoffice.tsx';
import LoginAuthFrontoffice from '../components/UI/Login/LoginAuthFrontoffice.tsx';
import HomeBackOffice from '../pages/backoffice/HomeBackOffice.tsx';
import ResetPage from '../pages/backoffice/ResetPage.tsx';
import ListOrders from '../pages/backoffice/orders/ListOrders.tsx';
import DetailsOrder from '../pages/backoffice/orders/DetailsOrder.tsx';
import ListProductsFrontoffice from '../pages/frontoffice/products/ListProducts.tsx';
import ProductDetailsFrontoffice from '../pages/frontoffice/products/ProductDetails.tsx';
import CartPage from '../pages/frontoffice/carts/CartPage.tsx';
import CheckoutPage from '../pages/frontoffice/carts/CheckoutPage.tsx';
import OrderConfirmation from '../pages/frontoffice/carts/OrderConfirmation.tsx';
import CreateAddress from '../pages/frontoffice/addresses/CreateAddress.tsx';
import ManageAddresses from '../pages/frontoffice/addresses/ManageAddresses.tsx';
import MyOrdersFrontoffice from '../pages/frontoffice/orders/MyOrders.tsx';
import DashboardPage from '../pages/backoffice/dashboard/Dashboard.tsx';

// On crée un composant interne pour pouvoir utiliser useAuth()
function AppContent() {
    const { isAuthenticated } = useAuth();
    const { isAuthenticated: isFrontofficeAuthenticated } = useFrontofficeAuth();

    return (
        <Routes>
            {/* FRONT OFFICE : Redirection par défaut */}
            <Route path="/" element={<Navigate to="/frontoffice/login" replace />} />
            <Route path="/frontoffice" element={<Navigate to="/frontoffice/login" replace />} />

            {/* FRONT OFFICE : Route de login */}
            <Route path="/frontoffice/login" element={<LoginAuthFrontoffice />} />

            {/* FRONT OFFICE : Routes protégées */}
            <Route element={<ProtectedRoute isAuthenticated={isFrontofficeAuthenticated} redirectPath="/frontoffice/login" />}>
                <Route path="/frontoffice" element={<Navigate to="/frontoffice/produits" replace />} />
                <Route path="/frontoffice/produits" element={<ListProductsFrontoffice />} />
                <Route path="/frontoffice/produits/:productId" element={<ProductDetailsFrontoffice />} />
                <Route path="/frontoffice/panier" element={<CartPage />} />
                <Route path="/frontoffice/checkout" element={<CheckoutPage />} />
                <Route path="/frontoffice/commande/:orderId" element={<OrderConfirmation />} />
                <Route path="/frontoffice/commandes" element={<MyOrdersFrontoffice />} />
                <Route path="/frontoffice/adresses" element={<ManageAddresses />} />
                <Route path="/frontoffice/adresses/nouveau" element={<CreateAddress />} />
            </Route>

            {/* BACK OFFICE : Route de login */}
            <Route path="/backoffice/login" element={<LoginAuthBackoffice />} />

            <Route path="/backoffice" element={<Navigate to="/backoffice/login" replace />} />

            {/* BACK OFFICE : Routes protégées */}
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} redirectPath="/backoffice/login" />}>
                <Route path="/backoffice/dashboard" element={<DashboardPage/>} />
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