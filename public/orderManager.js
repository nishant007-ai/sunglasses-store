
// orderManager.js
const fs = require('fs');

// Function to create a new order
function createOrder(orderID, customerDetails, productDetails) {
    const order = {
        orderID: orderID,
        customer: customerDetails,
        products: productDetails,
        date: new Date().toISOString(),
    };

    // Save order to a file (orders.json)
    let orders = [];
    if (fs.existsSync('orders.json')) {
        const data = fs.readFileSync('orders.json', 'utf8');
        orders = JSON.parse(data);
    }
    orders.push(order);
    fs.writeFileSync('orders.json', JSON.stringify(orders, null, 2));

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
