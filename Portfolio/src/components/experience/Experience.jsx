import React from 'react';
import './experience.css';
import { FaLaptopCode, FaServer, FaShieldAlt, FaBrain, FaCheckCircle } from 'react-icons/fa';

const skills = [
  {
    category: 'Frontend Development',
    icon: <FaLaptopCode className="experience-icon" />,
    skills: [
      { name: 'HTML', level: 'Intermediate' },
      { name: 'CSS', level: 'Intermediate' },
      { name: 'JavaScript', level: 'Intermediate' },
      { name: 'ReactJS', level: 'Beginner' },
    ],
  },
  {
    category: 'Backend Development',
    icon: <FaServer className="experience-icon" />,
    skills: [
      { name: 'Node.js', level: 'Intermediate' },
      { name: 'Flask', level: 'Intermediate' },
      { name: 'MySQL', level: 'Intermediate' },
      { name: 'Python', level: 'Intermediate' },
      { name: 'Google Cloud', level: 'Beginner' },
      { name: 'Java/C++', level: 'Beginner' },
    ],
  },
  {
    category: 'Cybersecurity',
    icon: <FaShieldAlt className="experience-icon" />,
    skills: [
      { name: 'Nessus', level: 'Beginner' },
      { name: 'Wireshark', level: 'Beginner' },
      { name: 'Metasploit', level: 'Beginner' },
      { name: 'NMap', level: 'Beginner' },
    ],
  },
  {
    category: 'Blockchain & AI',
    icon: <FaBrain className="experience-icon" />,
    skills: [
      { name: 'Pandas', level: 'Beginner' },
      { name: 'Scikit-learn', level: 'Beginner' },
      { name: 'Blockchain', level: 'Beginner' },
      { name: 'Cryptocurrency', level: 'Beginner' },
    ],
  },
];

const Experience = () => {
  return (
    <section id="experience">
      <h2>My Skills</h2>

      <div className="container experience-container">
        {skills.map(({ category, icon, skills }, index) => (
          <div key={index} className="experience-category">
            <h3>{icon} {category}</h3> 
            <div className="experience-content">
              {skills.map(({ name, level }, idx) => (
                <article key={idx} className="experience-details">
                  <FaCheckCircle className="check-icon" /> {/* Green checkmark */}
                  <div>
                    <h4>{name}</h4>
                    <small className="text-muted">{level}</small>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Experience;
