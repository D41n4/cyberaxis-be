const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/;
const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const userNameRegex = /^[a-zA-Z]{2,30}$/;

module.exports = { passwordRegex, emailRegex, userNameRegex };
