import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookAtlas, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

import undraw_rocket from '../../../../assets/img/undraw_rocket.svg';

function SidebarFrontoffice() {
    const [toggled, setToggled] = useState(false);

    const handleToggle = () => {
        setToggled(!toggled);
    };

  return (
    <ul className={toggled ? 'navbar-nav bg-gradient-primary sidebar sidebar-dark accordion toggled' : 'navbar-nav bg-gradient-primary sidebar sidebar-dark accordion'} id="accordionSidebar">

        {/* <!-- SidebarFrontoffice - Brand --> */}
        <a className="sidebar-brand d-flex align-items-center justify-content-center">
          <div className="sidebar-brand-icon rotate-n-15">
            <i className="fas fa-laugh-wink"></i>
          </div>
          <div className="sidebar-brand-text mx-3">Prestashop <sup>2</sup></div>
        </a>

        {/* <!-- Divider --> */}
        <hr className="sidebar-divider my-0" />

        {/* <!-- Nav Item - Products --> */}
        <li className="nav-item">
          <Link className="nav-link" to="/frontoffice/produits">
            <FontAwesomeIcon icon={faBookAtlas} className="mr-2" />
            <span>Produits</span>
          </Link>
        </li>

        {/* <!-- Nav Item - Cart --> */}
        <li className="nav-item">
          <Link className="nav-link" to="/frontoffice/panier">
            <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
            <span>Panier</span>
          </Link>
        </li>

        {/* <!-- Divider --> */}
        <hr className="sidebar-divider d-none d-md-block" />

        {/* <!-- SidebarFrontoffice Toggler (SidebarFrontoffice) --> */}
        <div className="text-center d-none d-md-inline">
          <img onClick={() => { handleToggle() }} className="rounded-circle border-0" id="sidebarToggle" src={undraw_rocket} alt="Rocket"/>
        </div>

      </ul>
  );
}

export default SidebarFrontoffice;