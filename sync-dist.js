// sync-dist.js - Synchronizes static root assets into dist/ after vite build
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  // Sync img folder
  const srcImg = path.join(__dirname, 'img');
  const distImg = path.join(distDir, 'img');
  if (fs.existsSync(srcImg)) {
    fs.mkdirSync(distImg, { recursive: true });
    fs.cpSync(srcImg, distImg, { recursive: true });
    console.log('✓ img/ sincronizzata in dist/img');
  }

  // Sync static root files if present
  const staticFiles = [
    'shared.html',
    'modals.html',
    'challenges.json',
    'specialita.json',
    'descriptions.json',
    'config.js',
    'manifest.json',
    'favicon.ico',
    'sw.js',
    'firebase-messaging-sw.js',
    'icon-192.png',
    'icon-512.png'
  ];

  staticFiles.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(distDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  });
  console.log('✓ File statici sincronizzati in dist/');
}
