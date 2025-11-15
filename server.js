const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Paths to certificate files (you'll need to generate these)
const keyPath = path.join(__dirname, 'certificates', 'localhost.key');
const certPath = path.join(__dirname, 'certificates', 'localhost.crt');

// Check if certificates exist
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('SSL certificates not found!');
  console.error('Please create certificates using:');
  console.error('1. Create a "certificates" folder in your project root');
  console.error('2. Generate certificates with: openssl req -newkey rsa:2048 -new -nodes -x509 -days 365 -keyout certificates/localhost.key -out certificates/localhost.crt');
  process.exit(1);
}

const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3001, (err) => {
    if (err) throw err;
    console.log('> Server running on https://localhost:3001');
  });
});