const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_mysql_password',
  database: 'sunglasses_store',
  // Fix for macOS (Remove socketPath if using Linux/Windows)
  // socketPath: '/var/run/mysqld/mysqld.sock' // Use this only if necessary
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected successfully!');
  }
});

// Serve HTML pages
const htmlPages = ['index', 'login', 'signup', 'admin', 'profile', 'forgot-password'];
htmlPages.forEach((page) => {
  app.get(`/${page}.html`, (req, res) =>
    res.sendFile(path.join(__dirname, 'public', `${page}.html`))
  );
});

// Fix for Cannot GET /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Signup Route
app.post('/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and Password are required!' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error hashing password!' });
    }

    db.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword],
      (err) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error saving user!' });
        }
        res.json({ success: true, message: 'Signup successful!' });
      }
    );
  });
});

// Login Route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err || result.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials!' });
    }

    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials!' });
      }
      req.session.user = result[0];
      res.json({ success: true, message: 'Login successful!', user: req.session.user });
    });
  });
});

// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out successfully!' });
});

// Forgot Password Route
app.post('/forgot-password', (req, res) => {
  const { email, newPassword } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found!' });
    }

    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error hashing new password!' });
      }

      db.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, email],
        (err) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Error updating password!' });
          }
          res.json({ success: true, message: 'Password reset successful!' });
        }
      );
    });
  });
});

// Checkout Route
app.post('/checkout', (req, res) => {
  const { name, address, phone, paymentMethod, productName, quantity, email } = req.body;

  if (!name || !address || !phone || !paymentMethod || !productName || !quantity) {
    return res.status(400).json({ success: false, message: 'All fields are required!' });
  }

  const orderID = `ORD${Date.now()}`;
  const query = `
    INSERT INTO orders (order_id, customer_name, phone_number, email, delivery_address, product_name, quantity, date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      orderID,
      name,
      phone,
      email,
      address,
      productName,
      quantity,
      new Date(),
      'Pending',
    ],
    (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error saving order to database.' });
      }
      res.json({ success: true, message: `Thank you, ${name}! Your order ID is: ${orderID}` });
    }
  );
});

// Fetch Order Details
app.get('/order/:orderID', (req, res) => {
  const { orderID } = req.params;
  db.query('SELECT * FROM orders WHERE order_id = ?', [orderID], (err, result) => {
    if (err || result.length === 0) {mysql.server start

      return res.status(404).json({ success: false, message: 'Order not found!' });
    }
    res.json({ success: true, order: result[0] });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
