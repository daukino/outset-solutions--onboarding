require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/contact', (req, res) => {
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

  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Outset Solutions running on http://localhost:${PORT}`));
