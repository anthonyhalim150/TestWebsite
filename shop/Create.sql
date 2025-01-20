CREATE DATABASE ecommerce;
USE ecommerce;

-- Since id cannot be reused, 
-- e.g. If itemID 5 is deleted, database will never go to itemID 5
-- Hence, I removed itemID as a referential integrity constraint


ALTER TABLE sale_items DROP FOREIGN KEY fk_sale_items_item_id;


ALTER TABLE AUCTION_ITEMS
ADD COLUMN created_by INT NOT NULL DEFAULT 1,
ADD CONSTRAINT fk_userID FOREIGN KEY (created_by) REFERENCES USERS(id) ON DELETE CASCADE;

ALTER TABLE USERS
MODIFY COLUMN address VARCHAR(255) UNIQUE DEFAULT 'AHBYUBQCHEMEFS3FGV57MGLHNXTLN2SAFFYGEDB2ZVEAOT3MA5KFSA7WEU';

ALTER TABLE USERS
ADD COLUMN wallet DECIMAL(15, 2) DEFAULT 0;



CREATE TABLE ITEMS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    image VARCHAR(255),
    created_by INT NOT NULL DEFAULT 1,
    FOREIGN KEY (created_by) REFERENCES USERS(id) ON DELETE CASCADE;
);
CREATE TABLE USERS(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role ENUM('user', 'admin') DEFAULT 'user',
    address VARCHAR(255) UNIQUE DEFAULT 'AHBYUBQCHEMEFS3FGV57MGLHNXTLN2SAFFYGEDB2ZVEAOT3MA5KFSA7WEU',
    wallet  DECIMAL(15, 2) DEFAULT 0
);

CREATE TABLE USER_SETTINGS (
    user_id INT PRIMARY KEY,
    dark_mode BOOLEAN DEFAULT FALSE,
    color_scheme VARCHAR(20) DEFAULT '#f8a488',
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
);



CREATE TABLE LIKES (
    user_id INT,
	item_id INT,
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE, -- The constraint is a powerful feature in SQL that ensures referential integrity by automatically deleting rows in a child table when the corresponding rows in the parent table are deleted
    FOREIGN KEY (item_id) REFERENCES ITEMS(id) ON DELETE CASCADE
);

-- Carts Table
CREATE TABLE CART(
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(id)  ON DELETE CASCADE
);


-- CartItems Table
CREATE TABLE CARTITEMS (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES CART(cart_id),
    FOREIGN KEY (item_id) REFERENCES ITEMS(id)  ON DELETE CASCADE
);


CREATE TABLE  TRANSACTIONS(
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,   -- Total price of the transaction
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(id)
);



CREATE TABLE SALE_ITEMS (
    sales_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15, 2) NOT NULL,  -- The price at the time of sale
    FOREIGN KEY (transaction_id) REFERENCES TRANSACTIONS(transaction_id)
);


CREATE TABLE COMMENTS(
	comments_id INT AUTO_INCREMENT PRIMARY KEY,
    comment TEXT,
    user_id INT NOT NULL,
    website_rating INT,
    importance_rating INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES USERS(id)
);

CREATE TABLE FEEDBACK (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    comments_id INT NOT NULL,
    true_importance INT,
    true_quality INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comments_id) REFERENCES COMMENTS(comments_id)
);

use ecommerce;
drop table AUCTION_ITEMS;
CREATE TABLE AUCTION_ITEMS(
	id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    stock INT NOT NULL,
    description TEXT,
	category TEXT NOT NULL,
    image VARCHAR(255),
    starting_price DECIMAL(15, 2) NOT NULL,
    starting_time DATETIME,
	is_expired BOOLEAN DEFAULT FALSE,
    duration INT NOT NULL, 
    created_by INT NOT NULL DEFAULT 1,
    FOREIGN KEY (created_by) REFERENCES USERS(id) ON DELETE CASCADE;
);



CREATE TABLE BIDS(
    id INT AUTO_INCREMENT PRIMARY KEY,
    auction_item_id INT NOT NULL,
    user_id INT NOT NULL,
    bid_amount DECIMAL(15, 2) NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_item_id) REFERENCES AUCTION_ITEMS(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
);
drop table BIDS;
USE ECOMMERCE;

INSERT INTO AUCTION_ITEMS (item_name, stock, description, category, image, starting_price, starting_time, duration)
VALUES
('Vintage Clock', 5, 'A beautifully preserved vintage clock.', 'Antiques', 'Products/coal.png', 120.50, '2025-01-10 15:00:00', 3600),
('Vintage Clock', 5, 'A beautifully preserved vintage clock.', 'Antiques', 'clock.jpg', 120.50, '2025-01-10 15:00:00', 3600),
('Gaming Laptop', 3, 'High-performance gaming laptop with RTX 3060.', 'Electronics', 'laptop.jpg', 1500.00, '2025-01-10 16:00:00', 5400),
('Diamond Necklace', 1, 'Exquisite diamond necklace with 24k gold chain.', 'Jewelry', 'necklace.jpg', 7500.00, '2025-01-10 17:00:00', 7200),
('Oil Painting', 2, 'Original hand-painted oil painting.', 'Art', 'painting.jpg', 450.00, '2025-01-10 18:00:00', 3600);


-- Example data
INSERT INTO auction_items (item_name, starting_price, time)
VALUES 
('Vintage Watch', 100.00, 1),
('Antique Vase', 200.00, 1),
('Signed Baseball', 150.00, 1);

drop table comments;
use ecommerce;
INSERT INTO items (name, description, category, price, stock, image) VALUES 
('Laptop', 'I am a laptop', 'Electronics', 1000.00, 10, 'https://via.placeholder.com/300'),
('Phone', 800.00, 15, 'https://via.placeholder.com/300');

INSERT INTO items (name, category, description, price, stock, image) VALUES 
('Laptop', 'I am a laptop', 'Electronics', 1000.00, 10, 'https://via.placeholder.com/300');

INSERT INTO USERS (username, email, password) VALUES ('testuser', 'test@example.com', 'hashedpassword');
UPDATE USERS
SET role = 'admin'
WHERE id = 1;

