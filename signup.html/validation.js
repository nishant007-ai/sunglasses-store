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

module.exports = { validateEmail, validatePassword, validateUsername };