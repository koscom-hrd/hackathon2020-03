import React from 'react';
import { Link } from 'react-router-dom';
import NameSearch from './NameSearch';
import './NavBar.css';
function NavBar() {
    return (
        <div className="total">
        <div className="navbar-bg">
            <Link className="navbar-logo-text" to="/home">
                Foogle
            </Link>
            <NameSearch />
        </div>
        </div>
    );
}

export default NavBar;