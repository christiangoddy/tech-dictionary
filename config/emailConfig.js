const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const dotenv = require('dotenv');

dotenv.config();

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // Redirect URL
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const accessToken = oauth2Client.getAccessToken();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: oauth2Client.getAccessToken()
  },
});

const sendMail = async () => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'recipient@example.com',
      subject: 'Test Email',
      text: 'This is a test email using OAuth2',
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = {
    sendMail
  };

