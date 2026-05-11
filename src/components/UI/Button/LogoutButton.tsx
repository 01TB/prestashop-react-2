import { useAuth } from '../../../services/backoffice/authService';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Appel du service
    navigate('/backoffice/login', { replace: true }); // Redirection immédiate
  };

  return (
    <button 
      onClick={handleLogout}
      className="btn btn-danger btn-sm shadow-sm"
    >
      <i className="fas fa-sign-out-alt fa-sm text-white-50 mr-2"></i>
      Déconnexion
    </button>
  );
};

export default LogoutButton;