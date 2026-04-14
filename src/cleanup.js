const fs = require('fs');

const file = 'd:\\Documents\\AntiGravity\\travel-agency\\index.html';
let html = fs.readFileSync(file, 'utf8');

// Regex to remove all dark: classes globally
html = html.replace(/\bdark:[a-zA-Z0-9\-\/]+\b/g, '');

fs.writeFileSync(file, html, 'utf8');
console.log('Removed dark mode classes.');
