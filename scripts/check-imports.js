const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      getFiles(full, files);
    } else if (full.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

const files = getFiles('src');
let issues = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lucideMatch = content.match(/import\s*\{([\s\S]*?)\}\s*from\s*['"]lucide-react['"]/);
  if (lucideMatch) {
    const importedIcons = new Set(
      lucideMatch[1]
        .split(',')
        .map((s) => s.trim().split(/\s+as\s+/)[0].trim())
        .filter(Boolean)
    );

    // Look for all JSX tags
    const jsxMatches = content.matchAll(/<([A-Z][A-Za-z0-9]+)[\s\/>]/g);
    for (const m of jsxMatches) {
      const tag = m[1];
      // If tag starts with uppercase and is not imported in general imports
      const header = content.slice(0, content.indexOf('export default'));
      const hasImport = new RegExp('\\b' + tag + '\\b').test(header);
      if (!hasImport) {
        // Check if it's standard React or custom JSX defined in component
        if (!['React', 'Fragment', 'Image', 'Link', 'Button', 'Card', 'Badge', 'Modal'].includes(tag)) {
          console.log(`[!] Missing import in ${file}: <${tag} />`);
          issues++;
        }
      }
    }
  }
}

console.log(`Scan completed. Total unresolved JSX tag issues: ${issues}`);
