require('dotenv').config();

module.exports = {
    port: process.env.PORT,
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS
};
