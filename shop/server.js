require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); // Using promise-based API
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Vvs319338',
    database: 'ecommerce',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Sign-up route
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.json({ success: false, error: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const connection = await pool.getConnection();
        try {
            const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
            await connection.query(query, [username, email, hashedPassword]);
            res.json({ success: true });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error signing up:', error);
        res.json({ success: false, error: 'Internal server error.' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const connection = await pool.getConnection();
        try {
            const query = `SELECT * FROM users WHERE username = ?`;
            const [results] = await connection.query(query, [username]);

            if (results.length === 0) {
                return res.json({ success: false, error: 'Invalid username or password.' });
            }

            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.json({ success: false, error: 'Invalid username or password.' });
            }

            res.json({
                success: true,
                userID: user.id,
                username: user.username,
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.json({ success: false, error: 'Internal server error.' });
    }
});

// Fetch items for the shop
app.get('/items', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const query = `SELECT * FROM items`;
            const [results] = await connection.query(query);
            res.json({ success: true, items: results });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error fetching items:', error);
        res.json({ success: false, error: 'Error fetching items.' });
    }
});

// Fetch cart items
app.get('/cart-items', async (req, res) => {
    const userID = req.query.userID;

    if (!userID) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const connection = await pool.getConnection();
        try {
            const [cart] = await connection.query(
                'SELECT cart_id FROM Cart WHERE user_id = ?',
                [userID]
            );

            if (cart.length === 0) {
                return res.json({ success: true, cartItems: [] });
            }

            const cartID = cart[0].cart_id;
            const [cartItems] = await connection.query(
                `SELECT ci.cart_item_id, ci.item_id, i.name, ci.quantity, ci.price
                 FROM CartItems ci
                 JOIN Items i ON ci.item_id = i.id
                 WHERE ci.cart_id = ?`,
                [cartID]
            );

            res.json({ success: true, cartItems });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch cart items' });
    }
});

// Add to cart
app.post('/cart', async (req, res) => {
    const { userID, itemID, quantity } = req.body;

    if (!userID || !itemID || !quantity || quantity <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid request data' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [existingCart] = await connection.query(
            'SELECT cart_id FROM Cart WHERE user_id = ?',
            [userID]
        );

        let cartID;
        if (existingCart.length > 0) {
            cartID = existingCart[0].cart_id;
        } else {
            const [cartResult] = await connection.query(
                'INSERT INTO Cart (user_id) VALUES (?)',
                [userID]
            );
            cartID = cartResult.insertId;
        }

        const [existingCartItem] = await connection.query(
            'SELECT cart_item_id, quantity FROM CartItems WHERE cart_id = ? AND item_id = ?',
            [cartID, itemID]
        );

        const [itemDetails] = await connection.query(
            'SELECT price FROM Items WHERE id = ?',
            [itemID]
        );
        if (itemDetails.length === 0) {
            throw new Error('Item not found in database.');
        }

        const price = itemDetails[0].price;

        if (existingCartItem.length > 0) {
            const newQuantity = existingCartItem[0].quantity + quantity;
            await connection.query(
                'UPDATE CartItems SET quantity = ?, price = ? WHERE cart_item_id = ?',
                [newQuantity, newQuantity * price, existingCartItem[0].cart_item_id]
            );
        } else {
            await connection.query(
                'INSERT INTO CartItems (cart_id, item_id, quantity, price) VALUES (?, ?, ?, ?)',
                [cartID, itemID, quantity, quantity * price]
            );
        }

        await connection.commit();
        res.json({ success: true, message: 'Item added to cart.' });
    } catch (error) {
        await connection.rollback();
        console.error('Error adding to cart:', error);
        res.status(500).json({ success: false, error: 'Failed to add item to cart.' });
    } finally {
        connection.release();
    }
});

// Checkout route
app.post('/checkout', async (req, res) => {
    const { userID } = req.body;

    if (!userID) {
        return res.status(400).json({ success: false, error: 'User ID is required for checkout.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Retrieve the user's cart
        const [cart] = await connection.query(
            'SELECT cart_id FROM Cart WHERE user_id = ?',
            [userID]
        );

        if (cart.length === 0) {
            return res.status(400).json({ success: false, error: 'No active cart found for the user.' });
        }

        const cartID = cart[0].cart_id;

        // 2. Get the items from the cart
        const [cartItems] = await connection.query(
            'SELECT item_id, quantity, price FROM CartItems WHERE cart_id = ?',
            [cartID]
        );

        if (cartItems.length === 0) {
            return res.status(400).json({ success: false, error: 'No items in the cart.' });
        }

        const totalAmount = cartItems.reduce((total, item) => total + (item.quantity * item.price), 0);

        const [transactionResult] = await connection.query(
            'INSERT INTO transactions (user_id, total_amount) VALUES (?, ?)',
            [userID, totalAmount]
        );

        const transactionID = transactionResult.insertId;

        for (const item of cartItems) {
            await connection.query(
                'INSERT INTO sale_items (transaction_id, item_id, quantity, price) VALUES (?, ?, ?, ?)',
                [transactionID, item.item_id, item.quantity, item.price]
            );
            await connection.query(
                'UPDATE items SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.item_id]
            );
        }

        await connection.query('DELETE FROM CartItems WHERE cart_id = ?', [cartID]);
        await connection.query('DELETE FROM Cart WHERE cart_id = ?', [cartID]);

        await connection.commit(); //Commit to the database, biar kalo ada error di tengah bisa di rollback, sblm dicommit
        res.json({ success: true, message: 'Checkout completed successfully.' });
    } catch (error) {
        await connection.rollback();
        console.error('Error during checkout:', error);
        res.status(500).json({ success: false, error: 'Checkout failed.' });
    } finally {
        connection.release();//Buat pool
    }
});


// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
