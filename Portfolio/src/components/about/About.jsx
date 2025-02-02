import React from 'react';
import './about.css';
import { FaGraduationCap, FaTrophy, FaLaptopCode } from 'react-icons/fa';

const aboutData = [
  {
    id: 1,
    icon: <FaGraduationCap className="about-icon" />,
    title: 'Double Degree',
    description: ['Big Data', 'Cybersecurity', 'WAM: 84/100'],
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
    description: ['Coding', 'Jogging', 'Chess'],
  },
];

const About = () => {
  return (
    <section id="about">
      <h1>About Me</h1>

      <div className="container about-container">
        <div className="about-cards">
          {aboutData.map(({ id, icon, title, description}) => (
            <article key={id} className="about-card">
              {icon}
              <h5>{title}</h5>
              <div className="about-description">
                {Array.isArray(description) ? (
                  <ul className="about-list">
                    {description.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{description}</p>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className="about-summary">
          Hey there 😊 I'm in my final year of Computer Science at SIM Singapore. Passionate about Big Data and Cybersecurity, I enjoy learning, coding, and solving complex problems! 💻🚀
        </p>
      </div>
    </section>
  );
};



export default About;
