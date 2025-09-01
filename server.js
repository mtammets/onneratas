// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serveeri public kausta staatilisi faile (nt index.html, CSS, JS, pildid)
app.use(express.static(path.join(__dirname, 'public')));

// Lihtne test route
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Tere, maailm! Server töötab 🚀' });
});

// Käivita server
app.listen(PORT, () => {
    console.log(`Server käivitatud: http://localhost:${PORT}`);
});
