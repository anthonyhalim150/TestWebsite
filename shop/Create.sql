CREATE DATABASE ecommerce;
USE ecommerce;
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    image VARCHAR(255)
);
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
INSERT INTO items (name, price, stock, image) VALUES 
('Laptop', 1000.00, 10, 'https://via.placeholder.com/300'),
('Phone', 800.00, 15, 'https://via.placeholder.com/300');
