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
      techStack: 'HTML | CSS | JS | node.js | Express | Flask | AI | MySQL',
      github: 'https://github.com/anthonyhalim150',
      liveDemo: 'https://cybermall.netlify.app/',
    },
    {
      id: 2,
      image: Project2,
      title: 'CyberMine',
      techStack: 'REACT | MySQL',
      github: 'https://github.com/anthonyhalim150',
      liveDemo: 'https://cybermine.netlify.app/',
    },
    {
      id: 3,
      image: Project3,
      title: 'Portfolio',
      techStack: 'REACT',
      github: 'https://github.com/anthonyhalim150',
    },
    {
      id: 4,
      image: Project4,
      title: 'PENDING',
      techStack: 'PENDING',
      github: 'https://github.com/anthonyhalim150',
    },
  ];

  return (
    <section id="projects">
      <h2>Projects</h2>

      <div className="container projects-container">
        {projects.map(({ id, image, title, techStack, github, liveDemo }) => (
          <article key={id} className="project-item">
            <div className="project-item-image">
              <img src={image} alt={title} />
            </div>
            <h3>{title}</h3>
            <small className="project-tech-stack">{techStack}</small>
            <div className="project-cta">
              <a href={github} target="_blank" rel="noreferrer" className="btn">
                GitHub
              </a>
              {liveDemo && (
                <a href={liveDemo} target="_blank" rel="noreferrer" className="btn">
                  Live Demo
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
