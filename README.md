# GreenPasture Farm Contact Backend

This project adds a Node.js backend for sending contact form enquiries via Gmail using Nodemailer.

## Setup

1. Run `npm install`.
2. Copy `.env.example` to `.env`.
3. Fill in your Gmail address and app password in `.env`.
4. Start the server with `npm start`.
5. Open `http://localhost:3000` and submit the form.

## Notes

- Use a Gmail app password if your account has 2-step verification enabled.
- The form posts to `/api/contact` and sends the enquiry email to `TO_EMAIL`.
