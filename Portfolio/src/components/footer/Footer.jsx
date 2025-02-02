import React from 'react';
import './footer.css';
import { BsLinkedin, BsGithub, BsTelegram } from 'react-icons/bs';

const Footer = () => {
  const socialLinks = [
    { id: 1, href: 'https://www.linkedin.com/in/anthony-halim-492289284/', icon: <BsLinkedin /> },
    { id: 2, href: 'https://github.com/anthonyhalim150', icon: <BsGithub /> },
    { id: 3, href: 'https://t.me/AnthonyHalim150', icon: <BsTelegram /> },
  ];

  return (
    <footer>
      <div className="footer-container">
        {/* Permalinks */}
        <ul className="permalinks">
          {['Home', 'About', 'Experience', 'Projects', 'Contact'].map((section, index) => (
            <li key={index}>
              <a href={`#${section.toLowerCase()}`}>{section}</a>
            </li>
          ))}
        </ul>

        {/* Social Links */}
        <div className="footer-socials">
          {socialLinks.map(({ id, href, icon }) => (
            <a key={id} href={href} target="_blank" rel="noreferrer">
              {icon}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="footer-copyright">
          <small>&copy; {new Date().getFullYear()} Anthony Halim. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
