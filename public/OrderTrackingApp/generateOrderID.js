const fs = require('fs');
const path = require('path');

// Function to create a new order
function createOrder(orderID, customerDetails, productDetails) {
    const order = {
        orderID: orderID,
        customer: customerDetails,
        products: productDetails,
        date: new Date().toISOString(),
    };

    // Define the file path in the 'public' directory
    const filePath = path.join(__dirname, '../orders.json');

    let orders = [];
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        orders = JSON.parse(data);
    }
    orders.push(order);
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));

    console.log('Order created successfully:', order);
}

// Example usage
const orderID = 'ORD20250124-001'; // Use your generated Order ID
const customerDetails = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
};
const productDetails = [
    { name: 'Classic Aviators', price: 1500, quantity: 1 },
    { name: 'Sporty Shades', price: 2000, quantity: 2 },
];

// Call the createOrder function
createOrder(orderID, customerDetails, productDetails);
