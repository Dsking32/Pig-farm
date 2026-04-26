const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const toEmail = process.env.TO_EMAIL;

app.use(express.static(path.join(__dirname)));

if (!smtpUser || !smtpPass || !toEmail) {
  console.warn('Warning: SMTP_USER, SMTP_PASS, or TO_EMAIL is not set. Please add them to your .env file.');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/contact', async (req, res) => {
  const { name, phone, email, product, message } = req.body || {};
  const userEmail = email?.trim();

  if (!name || !phone || !userEmail) {
    return res.status(400).json({ error: 'Name, phone, and email are required.' });
  }

  if (!smtpUser || !smtpPass || !toEmail) {
    return res.status(500).json({ error: 'Mail configuration is missing. Check .env.' });
  }

  const adminMailOptions = {
    from: `GreenPasture Farm <${smtpUser}>`,
    to: toEmail,
    subject: `New enquiry from ${name}`,
    text: `You have a new enquiry from GreenPasture Farm website.

Name: ${name}
Phone: ${phone}
Email: ${userEmail}
Interested in: ${product || 'Not specified'}
Message: ${message || 'No message provided'}
`,
    html: `
      <h2>New enquiry from GreenPasture Farm website</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Interested in:</strong> ${product || 'Not specified'}</p>
      <p><strong>Message:</strong></p>
      <p>${message || 'No message provided'}</p>
    `,
  };

  const confirmationMailOptions = {
    from: `GreenPasture Farm <${smtpUser}>`,
    to: userEmail,
    subject: 'Your enquiry has been received',
    text: `Hello ${name},

Thank you for contacting GreenPasture Farm. We have received your enquiry and will respond shortly.

Here are the details you submitted:

Phone: ${phone}
Email: ${userEmail}
Interested in: ${product || 'Not specified'}
Message: ${message || 'No message provided'}

We appreciate your interest and will be in touch soon.
`,
    html: `
      <h2>Thank you for contacting GreenPasture Farm</h2>
      <p>Hello ${name},</p>
      <p>We have received your enquiry and will respond shortly.</p>
      <h3>Your submission details</h3>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Interested in:</strong> ${product || 'Not specified'}</p>
      <p><strong>Message:</strong></p>
      <p>${message || 'No message provided'}</p>
      <p>Thank you for choosing GreenPasture Farm.</p>
    `,
  };

  try {
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(confirmationMailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Mail send error:', error);
    res.status(500).json({ error: 'Failed to send email. Please try again later.' });
  }
});

app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
