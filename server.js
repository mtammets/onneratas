'use strict';

/**
 * Minimal Express static server with nice startup logs.
 * - Serves files from ./public
 * - Prints both Local and Network URLs (LAN IPv4) on start
 * - Exposes a tiny test API and a health endpoint
 *
 * Run:
 *   node server.js
 * or add to package.json:
 *   "scripts": { "dev": "node server.js" }
 */

const express = require('express');
const path = require('path');
const os = require('os');

const app = express();

/** Server config */
const PORT = Number(process.env.PORT) || 3000;
/**
 * Bind to 0.0.0.0 to be reachable from devices on the same network (LAN).
 * Change to '127.0.0.1' if you only want local access.
 */
const HOST = process.env.HOST || '0.0.0.0';

/* ──────────────────────────────────────────────────────────────
   Middleware & Static Files
────────────────────────────────────────────────────────────── */

/** Serve the ./public directory as static assets */
app.use(express.static(path.join(__dirname, 'public')));

/* ──────────────────────────────────────────────────────────────
   Routes (Sample & Health)
────────────────────────────────────────────────────────────── */

/** Simple test API to verify server is up */
app.get('/api/hello', (_req, res) => {
    res.json({ message: 'Hello, world! Server is running 🚀' });
});

/** Health check endpoint (handy for monitors / containers) */
app.get('/healthz', (_req, res) => {
    res.status(200).send('ok');
});

/* (Optional) Not-found handler for API routes */
app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

/* ──────────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────────── */

/**
 * Collect non-internal IPv4 addresses for pretty LAN URL logs.
 * Compatible with different Node versions where net.family can be 'IPv4' or 4.
 */
function getLANUrls(port) {
    const nets = os.networkInterfaces();
    const urls = [];

    Object.keys(nets).forEach((name) => {
        (nets[name] || []).forEach((net) => {
            const isV4 = net.family === 'IPv4' || net.family === 4;
            if (isV4 && !net.internal) {
                urls.push(`http://${net.address}:${port}`);
            }
        });
    });

    // De-duplicate (some environments report duplicates)
    return [...new Set(urls)];
}

/**
 * Pretty-print startup banner with Local and Network URLs.
 */
function printStartupBanner(port) {
    const lan = getLANUrls(port);

    console.log('\nServer started:');
    console.log(`  Local:   http://localhost:${port}`);
    if (lan.length) {
        lan.forEach((url) => console.log(`  Network: ${url}`));
    } else {
        console.log('  Network: (No LAN IPv4 address found)');
    }
    console.log('');
}

/* ──────────────────────────────────────────────────────────────
   Start & Lifecycle
────────────────────────────────────────────────────────────── */

const server = app.listen(PORT, HOST, () => {
    printStartupBanner(PORT);
});

/** Basic error handling for bind failures, etc. */
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
    } else if (err.code === 'EACCES') {
        console.error(`Port ${PORT} requires elevated privileges.`);
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});

/** Graceful shutdown on Ctrl+C / SIGTERM */
function shutdown(signal) {
    console.log(`\nReceived ${signal}. Shutting down...`);
    server.close((closeErr) => {
        if (closeErr) {
            console.error('Error during server close:', closeErr);
            process.exit(1);
        }
        console.log('Server closed. Bye! 👋');
        process.exit(0);
    });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
