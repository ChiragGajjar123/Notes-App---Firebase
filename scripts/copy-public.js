const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const srcDir = path.join(__dirname, '../public');
const destDir = path.join(__dirname, '../.next/static');

if (fs.existsSync(srcDir)) {
  console.log(`Copying public assets from ${srcDir} to ${destDir}...`);
  copyDir(srcDir, destDir);
  console.log('Public assets copied successfully.');
} else {
  console.error('Public directory not found.');
}
