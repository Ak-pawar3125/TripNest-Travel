const fs = require('fs');

const file = 'd:\\Documents\\AntiGravity\\travel-agency\\index.html';
let html = fs.readFileSync(file, 'utf8');

// The replacement mapping
const map = [
    // Backgrounds
    { regex: /(?<!\w)bg-white(?!\/)/g, replace: 'bg-slate-900' },
    { regex: /(?<!\w)bg-white\/90\b/g, replace: 'bg-slate-900/90' },
    { regex: /(?<!\w)bg-gray-50\b/g, replace: 'bg-slate-950' },
    { regex: /(?<!\w)bg-gray-100\b/g, replace: 'bg-slate-800' },
    { regex: /(?<!\w)bg-blue-50\b/g, replace: 'bg-slate-800' },
    { regex: /(?<!\w)bg-blue-100\b/g, replace: 'bg-blue-900/30' },
    { regex: /(?<!\w)bg-indigo-50\b/g, replace: 'bg-indigo-900/30' },
    
    // Borders
    { regex: /(?<!\w)border-gray-100\b/g, replace: 'border-slate-800' },
    { regex: /(?<!\w)border-gray-200\b/g, replace: 'border-slate-700' },
    { regex: /(?<!\w)border-blue-200\b/g, replace: 'border-slate-700' },
    
    // Text
    { regex: /(?<!\w)text-gray-900\b/g, replace: 'text-slate-50' },
    { regex: /(?<!\w)text-gray-800\b/g, replace: 'text-slate-200' },
    { regex: /(?<!\w)text-gray-700\b/g, replace: 'text-slate-300' },
    { regex: /(?<!\w)text-gray-600\b/g, replace: 'text-slate-300' },
    { regex: /(?<!\w)text-gray-500\b/g, replace: 'text-slate-400' },
    { regex: /(?<!\w)text-blue-900\b/g, replace: 'text-blue-100' },
    
    // Hovers Focus
    { regex: /(?<!\w)hover:bg-gray-100\b/g, replace: 'hover:bg-slate-800' },
    { regex: /(?<!\w)focus:bg-white\b/g, replace: 'focus:bg-slate-800' },
];

map.forEach(op => {
    html = html.replace(op.regex, op.replace);
});

// Specific fix for empty extra colons left from before
html = html.replace(/\s+:bg-slate-900/g, '');
html = html.replace(/\s+:text-blue-400/g, '');

fs.writeFileSync(file, html, 'utf8');
console.log('Successfully applied dark theme permanently.');
