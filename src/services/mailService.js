const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

let transporterPromise = null;

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  if (SMTP_USER && SMTP_PASS) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      })
    );
    return transporterPromise;
  }

  // Fallback: create an Ethereal test account
  transporterPromise = (async () => {
    const testAccount = await nodemailer.createTestAccount();
    const t = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.warn('SMTP credentials not set — using Ethereal test account for email delivery.');
    return t;
  })();

  return transporterPromise;
}

const sendMail = async ({ to, subject, text, html }) => {
  const transporter = await getTransporter();
  const from = SMTP_USER || (transporter.options && transporter.options.auth && transporter.options.auth.user) || 'no-reply@example.com';

  const info = await transporter.sendMail({ from, to, subject, text, html });

  try {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.info('Preview URL:', preview);
  } catch (e) {
    // ignore
  }

  return info;
};

module.exports = { sendMail };
