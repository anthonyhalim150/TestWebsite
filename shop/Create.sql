CREATE DATABASE ecommerce;
USE ecommerce;




CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    image VARCHAR(255)
);
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role ENUM('user', 'admin') DEFAULT 'user'
);

CREATE TABLE user_settings (
    user_id INT PRIMARY KEY,
    dark_mode BOOLEAN DEFAULT FALSE,
    color_scheme VARCHAR(20) DEFAULT '#f8a488',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

use ecommerce;

CREATE TABLE likes (
    user_id INT,
	item_id INT,
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- The constraint is a powerful feature in SQL that ensures referential integrity by automatically deleting rows in a child table when the corresponding rows in the parent table are deleted
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Carts Table
CREATE TABLE Cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- CartItems Table
CREATE TABLE CartItems (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES Cart(cart_id),
    FOREIGN KEY (item_id) REFERENCES Items(id)
);
CREATE TABLE  TRANSACTIONS(
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,   -- Total price of the transaction
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);



CREATE TABLE sale_items (
    sales_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,  -- The price at the time of sale
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);


CREATE TABLE comments(
	comments_id INT AUTO_INCREMENT PRIMARY KEY,
    comment TEXT,
    user_id INT NOT NULL,
    website_rating INT,
    importance_rating INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    comments_id INT NOT NULL,
    true_importance INT,
    true_quality INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comments_id) REFERENCES comments(comments_id)
);
drop table comments;
use ecommerce;
INSERT INTO items (name, description, category, price, stock, image) VALUES 
('Laptop', 'I am a laptop', 'Electronics', 1000.00, 10, 'https://via.placeholder.com/300'),
('Phone', 800.00, 15, 'https://via.placeholder.com/300');

INSERT INTO items (name, category, description, price, stock, image) VALUES 
('Laptop', 'I am a laptop', 'Electronics', 1000.00, 10, 'https://via.placeholder.com/300');

INSERT INTO users (username, email, password) VALUES ('testuser', 'test@example.com', 'hashedpassword');
UPDATE users
SET role = 'admin'
WHERE id = 1;

