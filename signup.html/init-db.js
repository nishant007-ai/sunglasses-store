const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL server');

    // Create database
    db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err) => {
        if (err) {
            console.error('Error creating database:', err);
            return;
        }
        console.log(`Database "${process.env.DB_NAME}" created or already exists`);

        // Use the database
        db.query(`USE ${process.env.DB_NAME}`, (err) => {
            if (err) {
                console.error('Error using database:', err);
                return;
            }

            // Create users table
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) NOT NULL,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL
                )
            `;
            db.query(createTableQuery, (err) => {
                if (err) {
                    console.error('Error creating users table:', err);
                    return;
                }
                console.log('Users table created or already exists');
                db.end(); // Close the connection
            });
        });
    });
});