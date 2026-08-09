const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/Andres/Proyecto/quickfix';

let html = fs.readFileSync(path.join(dir, 'land-marmoles.html'), 'utf8');
const navB64 = fs.readFileSync(path.join(dir, '_b64_nav.txt'), 'utf8').trim();
const fullB64 = fs.readFileSync(path.join(dir, '_b64_full.txt'), 'utf8').trim();
const pisoB64 = fs.readFileSync(path.join(dir, '_b64_piso.txt'), 'utf8').trim();

// === 1. REMOVE SOCIAL MEDIA ICONS ===
html = html.replace(
  /\s*<div class="social-links">[\s\S]*?<\/div>\s*(?=<div class="footer-copy">)/,
  '\n    '
);
console.log('1. Social icons removed');

// === 2. REVERT FONT (remove Manrope override) ===
// Remove Manrope font import
html = html.replace(
  '<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">\n',
  ''
);
// Remove Manrope font-family rule
html = html.replace(
  /\s*\/\* Tipografia Manrope \(excepto iconos\) \*\/\n\s*\*:not\(i\):not\(\[class\*="fa-"\]\)\{ font-family:'Manrope',sans-serif !important; \}\n/,
  '\n'
);
// Remove Manrope h1-h3 weight override  
html = html.replace(
  /\s*h1,h2,h3,\.section-title,\.hero h1,\.cta-section h2,\.stat-n\{ font-weight:800 !important; letter-spacing:-\.02em; \}\n/,
  '\n'
);
// Remove Manrope from nav-logo inline style
html = html.replace(
  /font-family:'Manrope',sans-serif;/g,
  ''
);
console.log('2. Font reverted to original (Figtree/DM Serif Display)');

// === 3. LOGO WITH TRANSPARENT BACKGROUND ===
// Replace nav-logo image (find old base64, replace with new)
html = html.replace(
  /(<a class="nav-logo"[^>]*>)<img src="data:image\/webp;base64,[^"]*" alt="Land Mármoles" style="height:34px;width:auto;flex:none">/,
  `$1<img src="data:image/webp;base64,${navB64}" alt="Land Mármoles" style="height:34px;width:auto;flex:none">`
);
// Replace footer logo (make it BIGGER: 120px instead of 80px)
html = html.replace(
  /<img src="data:image\/webp;base64,[^"]*" alt="Land Mármoles — Transformamos espacios" style="height:80px;width:auto;display:block">/,
  `<img src="data:image/webp;base64,${fullB64}" alt="Land Mármoles — Transformamos espacios" style="height:140px;width:auto;display:block">`
);
console.log('3. Logos updated (transparent bg, footer bigger)');

// === 4. FLOOR TEXTURE BACKGROUND ===
// Add body background with piso texture in the brand style block
const bodyBgCSS = `  /* Textura piso de fondo */
  body{ background-image:url('data:image/webp;base64,${pisoB64}'); background-size:cover; background-attachment:fixed; background-position:center; }
  html.dark body{ background-image:none; }`;

// Insert after the brand palette vars in the override style block
html = html.replace(
  '  html.dark{ --accent:#4C8DFF; --accent2:#0B4DBA; --gold:#E5B53A; --muted:#A8A8A8; --text2:#C8C8C8; --sep:rgba(255,255,255,.14); }',
  '  html.dark{ --accent:#4C8DFF; --accent2:#0B4DBA; --gold:#E5B53A; --muted:#A8A8A8; --text2:#C8C8C8; --sep:rgba(255,255,255,.14); }\n' + bodyBgCSS
);
console.log('4. Floor texture background added');

// === 5. WHATSAPP GREEN FOR WA BUTTONS ===
// btn-primary (hero WhatsApp button) - override to WhatsApp green
// cta-wa (CTA section WhatsApp button) - override to WhatsApp green
// nav-btn (Cotizar) - override to WhatsApp green
const waGreenCSS = `
  /* WhatsApp buttons en verde oficial */
  .btn-primary{ background:#25D366 !important; }
  .btn-primary:hover{ background:#1ebe5d !important; box-shadow:0 8px 24px rgba(37,211,102,.45) !important; }
  .cta-wa{ background:#25D366 !important; color:#fff !important; }
  .cta-wa:hover{ background:#1ebe5d !important; }
  .nav-btn{ background:#25D366 !important; }
  .nav-btn:hover{ background:#1ebe5d !important; }
  .svc-cta{ background:#25D366 !important; color:#fff !important; }
  .svc-cta:hover{ background:#1ebe5d !important; }`;

// Insert before closing </style> of brand block
html = html.replace(
  '  .testi-stars,.pro-stars{ color:var(--gold) !important; }\n</style>\n</head>',
  '  .testi-stars,.pro-stars{ color:var(--gold) !important; }' + waGreenCSS + '\n  /* Nav Cotizar centrado sin subrayado */\n  .nav-btn{ display:inline-flex !important; align-items:center !important; justify-content:center !important; text-decoration:none !important; }\n  /* Pro card mas grande */\n  .pro-card{ max-width:420px !important; padding:32px !important; }\n  .pro-av{ width:90px !important; height:90px !important; font-size:1.8rem !important; margin-bottom:16px !important; }\n  .pro-name{ font-size:1.25rem !important; margin-bottom:6px !important; }\n  .pro-spec{ font-size:.95rem !important; margin-bottom:12px !important; }\n  .pro-stars{ font-size:1rem !important; margin-bottom:16px !important; }\n  .pro-wa{ font-size:1rem !important; padding:12px 24px !important; }\n</style>\n</head>'
);
console.log('5. WhatsApp green applied to all WA buttons');
console.log('7. Cotizar centered, no underline');
console.log('8. Pro card (Ricardo) enlarged');

// === 6. CTA SECTION - LESS BROWN YELLOW ===
// Original: linear-gradient(135deg, #6B3410 0%, #8B4513 50%, #C8860A 100%)
// New: warm golden yellow, less brown
html = html.replace(
  'background:linear-gradient(135deg, #6B3410 0%, #8B4513 50%, #C8860A 100%);',
  'background:linear-gradient(135deg, #C8960A 0%, #D9A520 50%, #F0C840 100%);'
);
console.log('6. CTA section: warmer golden yellow (less brown)');

// === ALSO: inline max-width on pro-card HTML ===
html = html.replace(
  'style="max-width:320px;margin:0 auto"',
  'style="max-width:420px;margin:0 auto"'
);

fs.writeFileSync(path.join(dir, 'land-marmoles.html'), html, 'utf8');
console.log('\nAll 8 changes applied successfully!');
console.log('File size:', (fs.statSync(path.join(dir, 'land-marmoles.html')).size / 1024 / 1024).toFixed(2), 'MB');
