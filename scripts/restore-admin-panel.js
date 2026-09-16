const fs = require('fs');
const path = require('path');

function getMapFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.map'))
    .map(f => path.join(dir, f));
}

const mapFiles = [
  ...getMapFiles('.next/server/chunks/ssr'),
  ...getMapFiles('.next/dev/server/chunks/ssr'),
  ...getMapFiles('.next/server'),
];

console.log(`Checking ${mapFiles.length} chunk map files.`);

let restoredCount = 0;
const restoredPaths = new Set();

for (const mapFile of mapFiles) {
  try {
    const content = fs.readFileSync(mapFile, 'utf8');
    if (!content.includes('admin')) continue;
    const map = JSON.parse(content);
    if (!map.sources || !map.sourcesContent) continue;

    for (let i = 0; i < map.sources.length; i++) {
      let src = map.sources[i];
      src = decodeURIComponent(src);

      if (src.includes('src/app/(dashboard)/admin/') || src.includes('src\\app\\(dashboard)\\admin\\')) {
        const match = src.match(/src[/\\]app[/\\]\(dashboard\)[/\\]admin[/\\](.*)/);
        if (match) {
          let relPath = match[1];
          if (relPath.startsWith('layout.tsx')) continue;

          const destPath = path.join('src', 'app', 'admin', '(panel)', relPath);
          const destDir = path.dirname(destPath);

          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }

          const fileContent = map.sourcesContent[i];
          if (fileContent) {
            fs.writeFileSync(destPath, fileContent, 'utf8');
            restoredCount++;
            restoredPaths.add(destPath);
            console.log(`Restored: ${destPath}`);
          }
        }
      }
    }
  } catch (err) {
    // Ignore invalid JSON maps
  }
}

console.log(`Total unique files restored: ${restoredPaths.size}`);
