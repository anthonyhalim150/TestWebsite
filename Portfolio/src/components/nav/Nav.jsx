import React, { useState, useEffect } from 'react';
import './nav.css';
import { FaHome, FaUserAlt, FaCode, FaProjectDiagram, FaEnvelope } from 'react-icons/fa';

const Nav = () => {
  const [activeNav, setActiveNav] = useState('#');
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting); // Check if the footer is visible
      },
      { threshold: 0.1 } // Trigger when 10% of the footer is visible
    );

    if (footer) {
      observer.observe(footer);
    }

    return () => {
      if (footer) observer.unobserve(footer);
    };
  }, []);

  const navLinks = [
    { id: 1, href: '#home', icon: <FaHome />, name: 'Home' },
    { id: 2, href: '#about', icon: <FaUserAlt />, name: 'About' },
    { id: 3, href: '#experience', icon: <FaCode />, name: 'Experience' },
    { id: 4, href: '#projects', icon: <FaProjectDiagram />, name: 'Projects' },
    { id: 5, href: '#contact', icon: <FaEnvelope />, name: 'Contact' },
  ];

  return (
    <nav className={isFooterVisible ? 'hidden-nav' : ''}>
      {navLinks.map(({ id, href, icon, name }) => (
        <a
          key={id}
          href={href}
          onClick={() => setActiveNav(href)}
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
