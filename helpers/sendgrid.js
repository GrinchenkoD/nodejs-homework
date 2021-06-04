const sgMail = require("@sendgrid/mail");
require("dotenv").config;
sgMail.setApiKey(process.env.APIKEY);

module.exports = sgMail;
