require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Vvs319338',
    database: 'ecommerce',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Sign-up route
app.post('/signup', async (req, res) => {
    console.log('Received signup data:', req.body);

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        console.error('Missing fields in signup request');
        return res.json({ success: false, error: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.json({ success: false, error: 'Error saving user. Make sure email is unique.' });
            }
            console.log('User inserted successfully:', result);
            res.json({ success: true });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.json({ success: false, error: 'Internal server error.' });
    }
});

// To check login bener
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ success: false, error: 'Both username and password are required.' });
    }

    const query = `SELECT * FROM users WHERE username = ?`;

    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.json({ success: false, error: 'Database error.' });
        }

        if (results.length === 0) {
            return res.json({ success: false, error: 'Invalid username or password.' });
        }

        const user = results[0];

        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.json({ success: false, error: 'Invalid username or password.' });
        }

        res.json({ success: true });
    });
});


// Fetch items for the shop
app.get('/items', (req, res) => {
    const query = `SELECT * FROM items`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching items:', err);
            return res.json({ success: false, error: 'Error fetching items.' });
        }
        console.log('Fetched items:', results);
        res.json({ success: true, items: results });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
