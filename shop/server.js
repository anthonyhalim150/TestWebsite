require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); // Using promise-based API
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret key for JWT (use a secure key in a production environment)
const JWT_SECRET = 'your_jwt_secret_key';


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
    if (password.length < 8 || !/\d/.test(password)) {
        return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long and include a number.' });
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

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const connection = await pool.getConnection();
        try {
            // Fetch the user by username
            const query = `SELECT * FROM users WHERE username = ?`;
            const [results] = await connection.query(query, [username]);

            // Check if the user exists
            if (results.length === 0) {
                return res.status(401).json({ success: false, error: 'Invalid username or password.' });
            }

            const user = results[0];

            // Verify the password
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ success: false, error: 'Invalid username or password.' });
            }

            // Generate a JWT with the user's ID, username, and role
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: '2h' } // Token expires in 2 hours
            );

            // Send the token and role to the client
            res.json({
                success: true,
                token,
                userID : user.id,
                role: user.role,
                username: user.username,
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, error: 'Internal server error.' });
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

app.get('/users', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const query = `SELECT * FROM users`;
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

app.get('/shop-metrics', async (req, res) => {
    const { startDate, endDate } = req.query;
    const connection = await pool.getConnection();

    try {
        const conditions = [];
        const values = [];

        // Add conditions based on query parameters
        if (startDate) {
            conditions.push('transactions.created_at >= ?');
            values.push(startDate);
        }
        if (endDate) {
            conditions.push('transactions.created_at <= ?');
            values.push(endDate);
        }

        // Build WHERE clause dynamically
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Query for sales over time
        const [salesOverTime] = await connection.query(`
            SELECT DATE(transactions.created_at) AS timeLabel, 
                   COUNT(transactions.transaction_id) AS totalTransactions,
                   SUM(transactions.total_amount) AS totalAmounts
            FROM transactions
            ${whereClause}
            GROUP BY DATE(transactions.created_at)
            ORDER BY DATE(transactions.created_at)
        `, values);

        // Query for product metrics over time
        const [productMetricsOverTime] = await connection.query(`
            SELECT DATE(transactions.created_at) AS timeLabel,
                   SUM(sale_items.quantity) AS itemsSold,
                   IFNULL(SUM(items.stock), 0) AS stockRemaining
            FROM sale_items
            JOIN items ON sale_items.item_id = items.id
            JOIN transactions ON sale_items.transaction_id = transactions.transaction_id
            ${whereClause}
            GROUP BY DATE(transactions.created_at)
            ORDER BY DATE(transactions.created_at)
        `, values);

        // Query for product comparison
        const [productComparison] = await connection.query(`
            SELECT items.name AS productName,
                   SUM(sale_items.quantity) AS itemsSold
            FROM sale_items
            JOIN items ON sale_items.item_id = items.id
            ${whereClause}
            GROUP BY items.name
            ORDER BY items.name
        `, values);

        // Construct and send the response
        const [userRegistrations] = await connection.query(`
            SELECT DATE(created_at) AS timeLabel, COUNT(id) AS newUsers
            FROM users
            ${startDate || endDate ? `WHERE ${startDate ? 'created_at >= ?' : ''} ${endDate ? (startDate ? 'AND created_at <= ?' : 'created_at <= ?') : ''}` : ''}
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at)
        `, startDate && endDate ? [startDate, endDate] : startDate ? [startDate] : endDate ? [endDate] : []);
        
        res.json({
            success: true,
            salesOverTime: {
                timeLabels: salesOverTime.map(row => row.timeLabel),
                totalAmounts: salesOverTime.map(row => row.totalAmounts),
            },
            productMetricsOverTime: {
                timeLabels: productMetricsOverTime.map(row => row.timeLabel),
                itemsSold: productMetricsOverTime.map(row => row.itemsSold),
                stockRemaining: productMetricsOverTime.map(row => row.stockRemaining),
            },
            productComparison: {
                productNames: productComparison.map(row => row.productName),
                itemsSold: productComparison.map(row => row.itemsSold),
            },
            userRegistrations: {
                timeLabels: userRegistrations.map(row => row.timeLabel),
                newUsers: userRegistrations.map(row => row.newUsers),
            },
        });        
    } catch (error) {
        console.error('Error fetching shop metrics:', error);
        res.status(500).json({ success: false, error: 'No data found.' });
    } finally {
        connection.release();
    }
});







app.post('/add-new-product', async (req, res) => {
    const { name, category, price, stock, image, description } = req.body;

    // Validate required fields
    if (!name || !category || !price || !stock || !image || !description) {
        return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    // Ensure `price` and `stock` are valid numbers
    if (isNaN(price) || isNaN(stock)) {
        return res.status(400).json({ success: false, error: 'Price and stock must be valid numbers.' });
    }

    try {
        const connection = await pool.getConnection(); // Get a connection from the pool
        try {
            // SQL query to insert the product into the database
            const query = `
                INSERT INTO items (name, category, price, stock, image, description) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const values = [name, category, price, stock, image, description];

            // Execute the query
            await connection.query(query, values);
            res.status(201).json({ success: true, message: 'Product added successfully!' });
        } finally {
            connection.release(); // Always release the connection back to the pool
        }
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ success: false, error: 'Internal server error.' });
    }
});

app.post('/add-new-user', async (req, res) => {
    const { username, password, role, email} = req.body;

    // Validate required fields
    if (!username || !password || !role || !email) {
        return res.status(400).json({ success: false, error: 'All fields are required.' });
    }
    try {
        
        const connection = await pool.getConnection(); // Get a connection from the pool
        try {
            // SQL query to insert the product into the database
            const query = `
                INSERT INTO users (username, email, password, role) 
                VALUES (?, ?, ?, ?)
            `;
            const values = [username, email, password, role];

            // Execute the query
            await connection.query(query, values);
            res.status(201).json({ success: true, message: 'User added successfully!' });
        } finally {
            connection.release(); // Always release the connection back to the pool
        }
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ success: false, error: 'Internal server error.' });
    }
});

app.put('/items/:id', async (req, res) => {
    const productId = req.params.id;
    const { name, price, stock, description, category } = req.body;

    if (!name || price === undefined || stock === undefined || !description || !category) {
        return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    try {
        const connection = await pool.getConnection();
        try {
            const query = `
                UPDATE items
                SET name = ?, price = ?, stock = ?, description = ?, category = ?
                WHERE id = ?
            `;
            const [result] = await connection.query(query, [name, price, stock, description, category, productId]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, error: 'Product not found.' });
            }

            res.json({ success: true, message: 'Product updated successfully.' });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, error: 'Failed to update product.' });
    }
});

app.get('/transactions', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const query = `
                SELECT 
                    t.transaction_id, 
                    u.username, 
                    t.total_amount, 
                    t.created_at,
                    GROUP_CONCAT(CONCAT('Item: ', i.name, ', Quantity: ', s.quantity, ', Price: $', s.price) SEPARATOR '\n') AS description
                FROM transactions t
                JOIN users u ON t.user_id = u.id
                JOIN sale_items s ON t.transaction_id = s.transaction_id
                JOIN items i ON s.item_id = i.id
                GROUP BY t.transaction_id
                ORDER BY t.created_at DESC;
            `;
            const [results] = await connection.query(query);
            res.json(results);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch transactions.' });
    }
});

app.get('/comments', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const query = `
                SELECT 
                    u.username, 
                    c.comment, 
                    c.created_at
                FROM comments c
                JOIN users u ON c.user_id = u.id
                ORDER BY c.created_at DESC;
            `;
            const [results] = await connection.query(query);
            res.json({success: true, items:results}); //Biar organized, sends the results in key-value pair jdi ada clear structure for response, not just send the value, also tells the system whether it is successful or not.
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch comments.' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
