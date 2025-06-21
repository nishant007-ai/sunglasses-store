// Import Express.js
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to serve static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to Sunglasses Store Backend!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

