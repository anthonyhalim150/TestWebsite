import React, { useRef, useState } from 'react';
import './contacts.css';
import { MdOutlineEmail } from 'react-icons/md';
import validator from 'validator';
import emailjs from '@emailjs/browser';

const Contacts = () => {
  const formRef = useRef();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, message } = formData;

    // Validate and sanitize input
    if (!validator.isLength(name, { min: 1, max: 100 })) {
      setError('Name must be between 1 and 100 characters.');
      return;
    }
    if (!validator.isEmail(email)) {
      setError('Invalid email address.');
      return;
    }
    if (!validator.isLength(message, { min: 1, max: 10000 })) {
      setError('Message must be between 1 and 10000 characters.');
      return;
    }

    // Clear error and process sanitized input
    setError('');
    setSuccess('');

    const sanitizedData = {
      name: validator.escape(name),
      email: validator.normalizeEmail(email),
      message: validator.escape(message),
    };

    // EmailJS Configuration
    const serviceID = 'service_qulz0rs';
    const templateID = 'template_1n5645b';
    const publicKey = 'GeQ3txe5ZoByJ3wUk';

    // Send Email using EmailJS
    emailjs
      .send(serviceID, templateID, sanitizedData, publicKey)
      .then(
        (result) => {
          setSuccess('Message sent successfully!');
          formRef.current.reset(); // Reset the form
        },
        (error) => {
          setError('Failed to send message. Please try again.');
        }
      );
  };

  return (
    <section id="contact">
      <h1>Contact Me</h1>
      <div className="container contact-container">
        <div className="contact-options">
          <article className="contact-option">
            <MdOutlineEmail className="contact-icon" />
            <h4>Email</h4>
            <h5>anthonyhalim153@gmail.com</h5>
            <a href="mailto:anthonyhalim153@gmail.com">Send a message</a>
          </article>
        </div>
        <h5>You can also send a message to me here!</h5>
        <form ref={formRef} onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            required
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <textarea
            name="message"
            rows="5"
            placeholder="Your Message"
            required
            value={formData.message}
            onChange={handleChange}
          ></textarea>
          
          {error && <h3 className="error">{error}</h3>} 
          {success && <h3 className="success">{success}</h3>}

          <button type="submit" className="btn btn-highlight">Send</button>
        </form>
      </div>
    </section>
  );
};

export default Contacts;
