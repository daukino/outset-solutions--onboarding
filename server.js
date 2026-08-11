require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3004;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });

  const entry = { name, email, message, at: new Date().toISOString() };
  console.log(`[CONTACT] ${entry.at} | ${name} | ${email}`);

  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  const file = path.join(dataDir, 'contacts.json');
  let contacts = [];
  try { contacts = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
  contacts.push(entry);
  fs.writeFileSync(file, JSON.stringify(contacts, null, 2));

  try {
    await resend.emails.send({
      from: 'Outset Solutions <noreply@outsetsolutions.co.nz>',
      to: 'info@outsetsolutions.co.nz',
      subject: `New enquiry from ${name}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px">
          <h2 style="margin:0 0 24px;font-size:1.4rem;color:#0E1C32">New enquiry via outsetsolutions.co.nz</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;width:100px">Name</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-weight:600">${name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Email</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827"><a href="mailto:${email}" style="color:#0E1C32">${email}</a></td></tr>
          </table>
          <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px">
            <p style="margin:0;color:#374151;line-height:1.7;white-space:pre-wrap">${message}</p>
          </div>
          <p style="margin:0;font-size:.8rem;color:#9ca3af">Received ${new Date().toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })} NZT</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[RESEND ERROR]', err.message);
  }

  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Outset Solutions running on http://localhost:${PORT}`));
