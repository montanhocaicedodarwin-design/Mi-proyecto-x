require('dotenv').config();
const path = require('path');
const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;
const dataFile = path.join(__dirname, 'contacts.json');
const adminToken = process.env.ADMIN_TOKEN || 'cambiame123';

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// CORS ligero y soporte OPTIONS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Rate limit simple por IP (ventana de 1 minuto)
const rateMap = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const max = 60; // peticiones por ventana
  const entry = rateMap.get(ip) || { count: 0, start: now };

  if (now - entry.start > windowMs) {
    entry.count = 1;
    entry.start = now;
  } else {
    entry.count += 1;
  }

  rateMap.set(ip, entry);
  if (entry.count > max) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' });
  }
  next();
}

// Lectura/escritura atómica asíncrona de contacts.json
async function readContacts() {
  try {
    const data = await fs.promises.readFile(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeContacts(contacts) {
  const tmp = `${dataFile}.tmp`;
  await fs.promises.writeFile(tmp, JSON.stringify(contacts, null, 2), 'utf8');
  await fs.promises.rename(tmp, dataFile);
}

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token === adminToken) {
    return next();
  }
  res.status(401).json({ error: 'No autorizado. Proporcione el token de administrador correcto.' });
}

app.post('/api/contact', rateLimit, async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;

    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const contacts = await readContacts();
    const newContact = {
      id: contacts.length > 0 ? contacts[contacts.length - 1].id + 1 : 1,
      nombre,
      email,
      mensaje,
      fecha: new Date().toISOString()
    };

    contacts.push(newContact);
    await writeContacts(contacts);

    res.status(201).json({ message: 'Contacto guardado correctamente.', contacto: newContact });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'La contraseña es obligatoria.' });
  }

  if (password !== adminToken) {
    return res.status(401).json({ error: 'Contraseña incorrecta.' });
  }

  res.json({ message: 'Autenticación correcta.', token: adminToken });
});

app.get('/api/contacts', requireAdmin, async (req, res) => {
  const contacts = await readContacts();
  res.json(contacts);
});

app.delete('/api/contacts/:id', requireAdmin, async (req, res) => {
  const contacts = await readContacts();
  const id = Number(req.params.id);
  const filtered = contacts.filter((contact) => contact.id !== id);

  if (filtered.length === contacts.length) {
    return res.status(404).json({ error: 'Contacto no encontrado.' });
  }

  await writeContacts(filtered);
  res.json({ message: 'Contacto eliminado correctamente.' });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
