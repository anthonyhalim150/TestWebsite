import React from 'react';
import './experience.css';
import { FaLaptopCode, FaServer, FaShieldAlt, FaBrain, FaCheckCircle } from 'react-icons/fa';

const skills = [
  {
    category: 'Frontend Development',
    icon: <FaLaptopCode className="experience-icon" />,
    skills: [
      { name: 'HTML', level: 'Advanced' },
      { name: 'CSS', level: 'Advanced' },
      { name: 'JavaScript', level: 'Advanced' },
      { name: 'ReactJS', level: 'Advanced' },
      { name: 'React Native/Expo', level: 'Advanced' },
      { name: 'TypeScript', level: 'Intermediate' },
    ],
  },
  {
    category: 'Backend Development',
    icon: <FaServer className="experience-icon" />,
    skills: [
      { name: 'Node.js', level: 'Advanced' },
      { name: 'FastAPI/Flask', level: 'Advanced' },
      { name: 'MySQL', level: 'Advanced' },
      { name: 'Python', level: 'Intermediate' },
      { name: 'Google Cloud', level: 'Intermediate' },
      { name: 'Java/C++', level: 'Beginner' },
    ],
  },
  {
    category: 'Cybersecurity',
    icon: <FaShieldAlt className="experience-icon" />,
    skills: [
      { name: 'Wireshark', level: 'Intermediate' },
      { name: 'Metasploit', level: 'Intermediate' },
      { name: 'NMap', level: 'Intermediate' },
      { name: 'Nessus', level: 'Beginner' },
    ],
  },
  {
    category: 'Blockchain & AI',
    icon: <FaBrain className="experience-icon" />,
    skills: [
      { name: 'Pandas/Scikit-learn', level: 'Intermediate' },
      { name: 'Pytorch', level: 'Intermediate' },
      { name: 'Blockchain', level: 'Intermediate' },
      { name: 'Crypto', level: 'Intermediate' },
    ],
  },
];

const Experience = () => {
  return (
    <section id="experience">
      <h1>My Skills</h1>

      <div className="container experience-container">
        {skills.map(({ category, icon, skills }, index) => (
          <div key={index} className="experience-category">
            <h3>{icon} {category}</h3> 
            <div className="experience-content">
              {skills.map(({ name, level }, idx) => (
                <article key={idx} className="experience-details">
                  <FaCheckCircle className="check-icon" /> 
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
