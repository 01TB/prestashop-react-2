import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  redirectPath?: string;
}

const ProtectedRoute = ({ 
  isAuthenticated, 
  redirectPath = '/backoffice/login' 
}: ProtectedRouteProps) => {
  const location = useLocation();

  if (!isAuthenticated) {
    // On sauvegarde l'endroit où l'utilisateur voulait aller
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;