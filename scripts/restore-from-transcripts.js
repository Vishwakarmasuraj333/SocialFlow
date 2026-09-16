const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function processTranscript(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.includes('admin') || !line.includes('write_to_file')) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === 'write_to_file' || tc.name === 'default_api:write_to_file') {
            const args = tc.args || (tc.function && JSON.parse(tc.function.arguments));
            if (!args || !args.TargetFile || !args.CodeContent) continue;

            let target = args.TargetFile.replace(/\\/g, '/');
            if (target.includes('/src/app/(dashboard)/admin/')) {
              const rel = target.split('/src/app/(dashboard)/admin/')[1];
              if (rel === 'layout.tsx') continue;

              const dest = path.join('src', 'app', 'admin', '(panel)', ...rel.split('/'));
              const destDir = path.dirname(dest);
              if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
              }
              fs.writeFileSync(dest, args.CodeContent, 'utf8');
              console.log('Restored from transcript:', dest);
            }
          }
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
}

async function run() {
  const brainDir = 'C:\\Users\\imdee\\.gemini\\antigravity-ide\\brain';
  const conversations = fs.readdirSync(brainDir);

  for (const conv of conversations) {
    const transcriptFull = path.join(brainDir, conv, '.system_generated', 'logs', 'transcript_full.jsonl');
    if (fs.existsSync(transcriptFull)) {
      console.log('Scanning:', conv);
      await processTranscript(transcriptFull);
    }
  }

  console.log('Done scanning transcripts!');
}

run();
