import React from 'react';
import './header.css';
import { BsLinkedin, BsGithub, BsWhatsapp, BsFileEarmarkArrowDown } from 'react-icons/bs';
import profilePic from '../../assets/profile-pic.png';
import Resume from '../../assets/Resume.pdf';

const Header = () => {
  return (
    <header id="home">
      <div className="container header-container">
        <h5>Hello! I'm</h5>
        <h1>Anthony Halim</h1>
        <h5 className="text-highlight">Big Data and Cybersecurity Student</h5>

        <div className="profile-container">
          <div className="profile-image">
            <img src={profilePic} alt="Profile" />
          </div>
          <div className="social-links-below">
            <a href="https://www.linkedin.com/in/anthony-halim-492289284/" target="_blank" rel="noreferrer">
              <BsLinkedin />
            </a>
            <a href="https://github.com/anthonyhalim150" target="_blank" rel="noreferrer">
              <BsGithub />
            </a>
            <a href="https://wa.me/+6581883757" target="_blank" rel="noreferrer">
              <BsWhatsapp />
            </a>
            <a href={Resume} download="Anthony_Halim_Résumé.pdf" target="_blank" rel="noreferrer">
              <BsFileEarmarkArrowDown />
            </a>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
