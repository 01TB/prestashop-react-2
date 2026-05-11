import {Link} from 'react-router-dom';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookAtlas, faPersonWalkingLuggage, faDatabase } from '@fortawesome/free-solid-svg-icons'

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
                Interface
            </div>

            {/* <!-- Nav Item - Pages Collapse Menu --> */}
            <li className="nav-item">
                <Link className='nav-link collapsed' to="/backoffice/dashboard" data-toggle="collapse" data-target="#collapseTwo"  aria-controls="collapseTwo">
                    <FontAwesomeIcon icon={faBookAtlas} />
                    <span>Livres</span>
                </Link>
            </li>

            {/* <!-- Nav Item - Utilities Collapse Menu --> */}
            <li className="nav-item">
                <Link className="nav-link collapsed" to="/backoffice/dashboard" data-toggle="collapse" data-target="#collapseUtilities" aria-expanded="true" aria-controls="collapseUtilities">
                    <FontAwesomeIcon icon={faPersonWalkingLuggage} />
                    <span>Emprunts</span>
                </Link>
            </li>

            {/* <!-- Divider --> */}
            <hr className="sidebar-divider" />

            {/* <!-- Heading --> */}
            <div className="sidebar-heading">
                Administration
            </div>

            {/* <!-- Nav Item - Réinitialisation --> */}
            <li className="nav-item">
            <Link className="nav-link" to="/backoffice/reinitialisation">
                <FontAwesomeIcon icon={faDatabase} fixedWidth />
                <span style={{ marginLeft: '0.25rem' }}>Réinitialisation</span>
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