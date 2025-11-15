const fs = require('fs');
const path = require('path');

// Check if certificates already exist
const certPath = path.join(__dirname, 'certificates');
const keyPath = path.join(certPath, 'localhost.key');
const certFilePath = path.join(certPath, 'localhost.crt');

// Create certificates directory if it doesn't exist
if (!fs.existsSync(certPath)) {
  fs.mkdirSync(certPath, { recursive: true });
}

// If certificates don't exist, we'll use a placeholder message
// In practice, you'd want to use a command like:
// openssl req -newkey rsa:2048 -new -nodes -x509 -days 365 -keyout localhost.key -out localhost.crt

// For now, we'll document how to do it manually:
console.log('To run with HTTPS, you need to generate certificates. Run these commands in your terminal:');
console.log('');
console.log('1. cd D:\\\\Project\\\\consert\\\\new-pwa');
console.log('2. mkdir certificates');
console.log('3. openssl req -newkey rsa:2048 -new -nodes -x509 -days 365 -keyout certificates/localhost.key -out certificates/localhost.crt');
console.log('');
console.log('Then update your package.json to use HTTPS.');