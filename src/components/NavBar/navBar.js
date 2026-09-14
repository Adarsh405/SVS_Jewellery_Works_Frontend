import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  FaHome,
  FaRing,
  FaUsers,
  FaBars,
  FaTimes
} from "react-icons/fa";

import "./navBar.css";

const Navbar = () => {

  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const navItems = [
    {
      path: "/",
      icon: <FaHome />,
      label: "Dashboard"
    },
    {
      path: "/addJewellery",
      icon: <FaRing />,
      label: "Add Jewellery"
    },
    {
      path: "/rates",
      icon: <FaUsers />,
      label: "Update Rates"
    }
  ];

  return (

    <nav className="navbar">

      {/* =================================================
          BRAND
      ================================================= */}

      <Link
        to="/"
        className="brand"
        onClick={closeMenu}
      >

        <img
          src="https://res.cloudinary.com/dhuby3rax/image/upload/v1787501380/SVS_Logo_khmjst.jpg"
          alt="SVS Jewellery"
          className="svs-logo"
        />

        <span>SVS Jewellery</span>

      </Link>


      {/* =================================================
          DESKTOP NAV
      ================================================= */}

      <div
        className={`nav-links ${
          menuOpen ? "mobile-open" : ""
        }`}
      >

        {navItems.map((item) => (

          <Link
            key={item.path}
            to={item.path}
            onClick={closeMenu}
            className={
              location.pathname === item.path
                ? "active"
                : ""
            }
          >

            {item.icon}

            <span>
              {item.label}
            </span>

          </Link>

        ))}

      </div>


      {/* =================================================
          ADMIN
      ================================================= */}

      <Link
        to="/login"
        className="admin"
        onClick={closeMenu}
      >

        <div className="admin-image-wrapper">

          <img
            src="https://res.cloudinary.com/dhuby3rax/image/upload/v1788152993/Dad-Pass-Photo_yxiyaf.jpg"
            alt="Admin"
            className="admin-image"
          />

          <span className="admin-online"></span>

        </div>

        <div className="admin-info">

          <span className="admin-name">
            Admin
          </span>

          <span className="admin-role">
            Administrator
          </span>

        </div>

      </Link>


      {/* =================================================
          MOBILE MENU BUTTON
      ================================================= */}

      <button
        type="button"
        className="menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >

        {menuOpen
          ? <FaTimes />
          : <FaBars />
        }

      </button>

    </nav>
  );
};

export default Navbar;

// export default Navbar;
