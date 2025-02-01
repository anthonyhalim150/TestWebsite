import React from 'react';
import './about.css';
import { FaGraduationCap, FaTrophy, FaLaptopCode } from 'react-icons/fa';

const aboutData = [
  {
    id: 1,
    icon: <FaGraduationCap className="about-icon" />,
    title: 'Double Degree',
    description: 'Big Data and Cybersecurity',
    institution: 'SIM Global Education',
  },
  {
    id: 2,
    icon: <FaTrophy className="about-icon" />, // Changed icon for Awards
    title: 'Awards',
    description: ['IRAS Silver Award', 'MapleTree Bronze Award'], // Stored as an array for line separation
  },
  {
    id: 3,
    icon: <FaLaptopCode className="about-icon" />, // Changed icon for Hobby
    title: 'Hobby',
    description: 'Building scalable and efficient web applications',
  },
];

const About = () => {
  return (
    <section id="about">
      <h2>About Me</h2>

      <div className="container about-container">
        <div className="about-cards">
          {aboutData.map(({ id, icon, title, description, institution }) => (
            <article key={id} className="about-card">
              {icon}
              <h5>{title}</h5>
              <small>
                {Array.isArray(description) ? (
                  <ul>
                    {description.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  description
                )}
                {institution && <br />}
                <i>{institution}</i>
              </small>
            </article>
          ))}
        </div>

        <p className="about-description">
          I’m a <b>Computer Science Undergraduate</b> at SIM Singapore, I am passionate about
          developing scalable web applications and innovative solutions. I enjoy solving real-world problems through programming and 
          I can't wait to work with you!
        </p>
      </div>
    </section>
  );
};

export default About;
