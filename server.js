const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Your MySQL username
    password: 'yourpassword', // Your MySQL password
    database: 'shop'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// API to fetch items
app.get('/api/items', (req, res) => {
    const sql = 'SELECT * FROM items';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
