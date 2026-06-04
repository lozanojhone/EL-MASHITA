const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'teams.json');
const ADMIN_TOKEN = 'event-admin-token-2026';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'Futbol2026!';

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, '[]', 'utf8');
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function readTeams() {
  const raw = fs.readFileSync(dataFile, 'utf8');
  return JSON.parse(raw || '[]');
}

function writeTeams(teams) {
  fs.writeFileSync(dataFile, JSON.stringify(teams, null, 2), 'utf8');
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  if (auth === `Bearer ${ADMIN_TOKEN}`) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Acceso no autorizado.' });
}

app.post('/api/register', (req, res) => {
  const {
    teamName,
    delegateName,
    contactNumber,
    players,
    substitutes
  } = req.body;

  if (!teamName || !delegateName || !contactNumber || !Array.isArray(players) || !Array.isArray(substitutes)) {
    return res.status(400).json({ success: false, message: 'Datos incompletos en el formulario.' });
  }

  const teams = readTeams();
  const team = {
    id: `team-${Date.now()}`,
    teamName,
    delegateName,
    contactNumber,
    players,
    substitutes,
    createdAt: new Date().toISOString()
  };

  teams.push(team);
  writeTeams(teams);

  res.json({ success: true, message: 'Inscripción registrada correctamente.', team });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ success: true, token: ADMIN_TOKEN });
  }
  return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
});

app.get('/api/teams', authMiddleware, (req, res) => {
  const search = (req.query.q || '').toLowerCase();
  const teams = readTeams();
  const filtered = search
    ? teams.filter(team => team.teamName.toLowerCase().includes(search))
    : teams;
  res.json({ success: true, teams: filtered, total: filtered.length });
});

app.get('/api/teams/:id', authMiddleware, (req, res) => {
  const teams = readTeams();
  const team = teams.find(t => t.id === req.params.id);
  if (!team) {
    return res.status(404).json({ success: false, message: 'Equipo no encontrado.' });
  }
  res.json({ success: true, team });
});

app.get('/api/stats', authMiddleware, (req, res) => {
  const teams = readTeams();
  res.json({ success: true, totalTeams: teams.length });
});

app.get('/api/report/:id', authMiddleware, (req, res) => {
  const teams = readTeams();
  const team = teams.find(t => t.id === req.params.id);
  if (!team) {
    return res.status(404).json({ success: false, message: 'Equipo no encontrado para generar PDF.' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=inscripcion-${team.teamName.replace(/\s+/g, '_')}.pdf`);

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  doc.fontSize(22).fillColor('#0b3d91').text('Ficha de Inscripción de Equipo', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).fillColor('#333').text(`Equipo: ${team.teamName}`);
  doc.text(`Delegado: ${team.delegateName}`);
  doc.text(`Contacto: ${team.contactNumber}`);
  doc.text(`Fecha de registro: ${new Date(team.createdAt).toLocaleString()}`);
  doc.moveDown();
  doc.fontSize(18).fillColor('#0b3d91').text('Jugadores Titulares');
  doc.fontSize(14).fillColor('#000');
  team.players.forEach((player, index) => {
    doc.text(`${index + 1}. ${player}`);
  });

  doc.moveDown();
  doc.fontSize(18).fillColor('#0b3d91').text('Jugadores Suplentes');
  doc.fontSize(14).fillColor('#000');
  team.substitutes.forEach((player, index) => {
    doc.text(`${index + 1}. ${player}`);
  });

  doc.moveDown();
  doc.fontSize(16).fillColor('#333').text('Gracias por participar en la inauguración del campeonato de fútbol.');
  doc.end();
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
