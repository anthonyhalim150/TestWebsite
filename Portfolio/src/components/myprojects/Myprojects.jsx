import React from 'react';
import './myprojects.css';
import Project1 from '../../assets/project1.png';
import Project2 from '../../assets/project2.png';
import Project3 from '../../assets/project3.png';
import Project4 from '../../assets/project4.png';
const MyProjects = () => {
  const projects = [
    {
      id: 1,
      image: Project1,
      title: 'CyberMall',
      techStack: 'HTML | CSS | JS | Node.js | Crypto | Google Cloud | MySQL',
      description: 'An innovative C2C e-commerce platform with decentralized architecture, with auction capabilities and cryptocurrency payment.',
      github: 'https://github.com/anthonyhalim150',
      website: 'https://cybermall.netlify.app/',
    },
    {
      id: 2,
      image: Project2,
      title: 'CyberMine',
      techStack: 'REACT | MySQL | Node.js | Express | Flask | AI | Google Cloud',
      description: 'A cloud-based mining simulator leveraging REACT and A.I technologies.',
      github: 'https://github.com/anthonyhalim150',
      website: 'https://cybermine.netlify.app/',
    },
    {
      id: 3,
      image: Project3,
      title: 'Portfolio',
      techStack: 'REACT',
      description: 'A personal portfolio showcasing my projects, skills, and achievements.',
      github: 'https://github.com/anthonyhalim150',
    },
    {
      id: 4,
      image: Project4,
      title: 'PENDING',
      techStack: 'PENDING',
      description: 'This project is currently under development!',
      github: 'https://github.com/anthonyhalim150',
    },
  ];
  

  return (
    <section id="projects">
      <h1>Projects</h1>
  
      <div className="container projects-container">
        {projects.map(({ id, image, title, techStack, description, github, website }) => (
          <article key={id} className="project-item">
            <div className="project-item-image">
              <img src={image} alt={title} />
            </div>
            <h3>{title}</h3>
            <p className="project-description">{description}</p>
            <small className="project-tech-stack">{techStack}</small>
            <div className="project-cta">
              <a href={github} target="_blank" rel="noreferrer" className="btn">
                GitHub
              </a>
              {website && (
                <a href={website} target="_blank" rel="noreferrer" className="btn">
                  Website
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );  
};

export default MyProjects;
