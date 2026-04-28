require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

 async function sendRegistrationEmail(userEmail, userName) {
    const subject = "Welcome to Backend-ledger";
    const text = `Hello ${userName},\n\nThank you for registering on Backend-ledger! We're excited to have you on board.\n\nBest Regards,\nThe Backend-ledger Team`;
    await sendEmail(userEmail, subject, text);
 }


 async function sendMoneyTransferEmail(userEmail, userName, amount, toAccount){
    const subject = "Money transfer successful";
    const text = `Hello ${userName},\n\nYour money transfer of ${amount} has been successful.\n\nBest Regards,\nThe Backend-ledger Team`;
    await sendEmail(userEmail, subject, text, null);
 }
 async function sendTransactionFailedEmail(userEmail, userName, amount, toAccount){
    const subject = "Transaction failed";
    const text = `Hello ${userName},\n\nYour money transfer of ${amount} has failed.\n\nBest Regards,\nThe Backend-ledger Team`;
    await sendEmail(userEmail, subject, text, null);
 }

module.exports = {
    sendEmail,
    sendRegistrationEmail,
    sendMoneyTransferEmail,
    sendTransactionFailedEmail
}