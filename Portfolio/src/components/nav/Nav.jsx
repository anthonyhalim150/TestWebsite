import React, { useState, useEffect } from 'react';
import './nav.css';
import { FaHome, FaUserAlt, FaLaptopCode, FaFolderOpen, FaEnvelope } from 'react-icons/fa';

const Nav = () => {
  const [activeNav, setActiveNav] = useState('#');
  const [isNavHidden, setIsNavHidden] = useState(false);

  const handleNavClick = (href) => {
    setActiveNav(href); // Update active link
    setIsNavHidden(true); // Temporarily hide navbar

    // Reappear after 1.5 seconds
    setTimeout(() => {
      setIsNavHidden(false);
    }, 1000);
  };

  const navLinks = [
    { id: 1, href: '#home', icon: <FaHome />, name: 'Home' },
    { id: 2, href: '#about', icon: <FaUserAlt />, name: 'About' },
    { id: 3, href: '#experience', icon: <FaLaptopCode />, name: 'Experience' },
    { id: 4, href: '#projects', icon: <FaFolderOpen />, name: 'Projects' },
    { id: 5, href: '#contact', icon: <FaEnvelope />, name: 'Contact' },
  ];

  return (
    <nav className={isNavHidden ? 'hidden-nav' : ''}>
      {navLinks.map(({ id, href, icon, name }) => (
        <a
          key={id}
          href={href}
          onClick={() => handleNavClick(href)}
          className={activeNav === href ? 'active' : ''}
          title={name}
        >
          {icon}
        </a>
      ))}
    </nav>
  );
};

export default Nav;
