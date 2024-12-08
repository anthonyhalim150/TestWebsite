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

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'Vvs319338', // Replace with your MySQL password
    database: 'ecommerce',
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
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.json({ success: false, error: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error(err);
                return res.json({ success: false, error: 'Error saving user.' });
            }
            res.json({ success: true });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.json({ success: false, error: 'Internal server error.' });
    }
});

// Fetch items for the shop
app.get('/items', (req, res) => {
    const query = `SELECT * FROM items`;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, error: 'Error fetching items.' });
        }
        res.json({ success: true, items: results });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
