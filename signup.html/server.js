require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3306; // Updated to 3000

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET;

// Validation functions
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const validatePassword = (password) => {
    return password.length >= 6;
};

const validateUsername = (username) => {
    return username.length >= 3;
};

// Authentication middleware
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Validate input
    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email' });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (!validateUsername(username)) {
        return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    // Check if user already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }

            res.status(201).json({ message: 'User registered successfully' });
        });
    });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email' });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = results[0];

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    });
});

// Protected route example
app.get('/api/protected', auth, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
};

app.use(errorHandler);

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});