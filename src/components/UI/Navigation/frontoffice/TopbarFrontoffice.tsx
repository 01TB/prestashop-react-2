import { useNavigate } from 'react-router-dom';
import { useFrontofficeAuth } from '../../../../services/frontoffice/authService';

function TopbarFrontoffice() {
  const { customer, logout } = useFrontofficeAuth();
  const navigate = useNavigate();
  const displayName = customer ? `${customer.firstname} ${customer.lastname}`.trim() : 'Client';
  const displayEmail = customer?.email ?? '';

  const handleLogout = () => {
    logout();
    navigate('/frontoffice/login', { replace: true });
  };

  return (
    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
      <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
        <i className="fa fa-bars"></i>
      </button>

      <div className="ml-auto d-flex align-items-center">
        <div className="text-right mr-3">
          <div className="text-gray-600 small">{displayName}</div>
          <div className="text-gray-500 small">{displayEmail}</div>
        </div>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleLogout}>
          Deconnexion
        </button>
      </div>
    </nav>
  );
}

export default TopbarFrontoffice;