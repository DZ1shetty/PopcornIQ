const fs = require('fs');
const path = require('path');

const hexToRgb = (hex) => {
    if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `${r} ${g} ${b}`;
};

const indexCssPath = path.join(__dirname, 'client', 'src', 'index.css');
let indexCss = fs.readFileSync(indexCssPath, 'utf-8');

// Replace hex codes
indexCss = indexCss.replace(/--color-([^:]+):\s*#([0-9a-fA-F]{3,6});/g, (match, p1, p2) => {
    return `--color-${p1}: ${hexToRgb('#' + p2)};`;
});
fs.writeFileSync(indexCssPath, indexCss);

const tailwindConfigPath = path.join(__dirname, 'client', 'tailwind.config.js');
let tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf-8');

// Replace tailwind config references
tailwindConfig = tailwindConfig.replace(/'var\(--color-([^']+)\)'/g, (match, p1) => {
    return `'rgb(var(--color-${p1}) / <alpha-value>)'`;
});
fs.writeFileSync(tailwindConfigPath, tailwindConfig);

console.log('Successfully updated Tailwind variables to RGB format for opacity support.');
