import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen, faCartShopping, faChartLine, faClipboardList, faDatabase, faFileImport, faTags } from '@fortawesome/free-solid-svg-icons';

import undraw_rocket from '../../../../assets/img/undraw_rocket.svg';

function SidebarBackoffice() {
    const [toggled, setToggled] = useState(false);

    const handleToggle = () => {
        setToggled(!toggled);
    };

    return (
        <ul className={toggled ? 'navbar-nav bg-gradient-primary sidebar sidebar-dark accordion toggled' : 'navbar-nav bg-gradient-primary sidebar sidebar-dark accordion'} id="accordionSidebar">

            {/* <!-- SidebarBackoffice - Brand --> */}
            <a className="sidebar-brand d-flex align-items-center justify-content-center">
                <div className="sidebar-brand-icon rotate-n-15">
                    <i className="fas fa-laugh-wink"></i>
                </div>
                <div className="sidebar-brand-text mx-3">Prestashop - Backoffice<sup>2</sup></div>
            </a>

            {/* <!-- Divider --> */}
            <hr className="sidebar-divider my-0" />

            {/* <!-- Nav Item - Dashboard --> */}
            <li className="nav-item">
                <Link className="nav-link" to="/backoffice/dashboard">
                    <i className="fas fa-fw fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                </Link>
            </li>

            {/* <!-- Divider --> */}
            <hr className="sidebar-divider" />

            {/* <!-- Heading --> */}
            <div className="sidebar-heading">
                Backoffice
            </div>

            {/* <!-- Nav Item - Commandes --> */}
            <li className="nav-item">
                <Link className="nav-link" to="/backoffice/commandes">
                    <FontAwesomeIcon icon={faClipboardList} fixedWidth />
                    <span style={{ marginLeft: '0.25rem' }}>Commandes</span>
                </Link>
            </li>

            {/* <!-- Nav Item - Produits --> */}
            <li className="nav-item">
                <Link className="nav-link" to="/backoffice/produits">
                    <FontAwesomeIcon icon={faBoxOpen} fixedWidth />
                    <span style={{ marginLeft: '0.25rem' }}>Produits</span>
                </Link>
            </li>

            {/* <!-- Nav Item - Stocks --> */}
            <li className="nav-item">
                <Link className="nav-link" to="/backoffice/stocks">
                    <FontAwesomeIcon icon={faChartLine} fixedWidth />
                    <span style={{ marginLeft: '0.25rem' }}>Stocks</span>
                </Link>
            </li>

            {/* <!-- Nav Item - Paniers --> */}
            <li className="nav-item">
                <Link className="nav-link" to="/backoffice/paniers">
                    <FontAwesomeIcon icon={faCartShopping} fixedWidth />
                    <span style={{ marginLeft: '0.25rem' }}>Paniers</span>
                </Link>
            </li>

            {/* <!-- Nav Item - Catégories --> */}
            <li className="nav-item">
                <Link className="nav-link" to="/backoffice/categories">
                    <FontAwesomeIcon icon={faTags} fixedWidth />
                    <span style={{ marginLeft: '0.25rem' }}>Catégories</span>
                </Link>
            </li>

            {/* <!-- Nav Item - Import --> */}
            <li className="nav-item">
                <Link className="nav-link" to="/backoffice/import">
                    <FontAwesomeIcon icon={faFileImport} fixedWidth />
                    <span style={{ marginLeft: '0.25rem' }}>Import</span>
                </Link>
            </li>

            {/* <!-- Nav Item - Réinitialisation --> */}
            <li className="nav-item">
                <Link className="nav-link" to="/backoffice/reinitialisation">
                    <FontAwesomeIcon icon={faDatabase} fixedWidth />
                    <span style={{ marginLeft: '0.25rem' }}>Reinitialisation</span>
                </Link>
            </li>

            {/* <!-- Divider --> */}
            <hr className="sidebar-divider d-none d-md-block" />

            {/* <!-- SidebarBackoffice Toggler (SidebarBackoffice) --> */}
            <div className="text-center d-none d-md-inline">
                <img onClick={() => { handleToggle() }} className="rounded-circle border-0" id="sidebarToggle" src={undraw_rocket} alt="Rocket"/>
            </div>

        </ul>
    );
}

export default SidebarBackoffice;