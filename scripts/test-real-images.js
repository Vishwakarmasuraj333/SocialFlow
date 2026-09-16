const https = require('https');

const sites = [
  'https://www.ilovepdf.com',
  'https://www.workcomposer.com',
  'https://tillu.co.uk',
  'https://aerox1.vercel.app',
  'https://suraj-animation-portfolio.vercel.app',
  'https://fototrendz.vercel.app',
  'https://tuvaa1.vercel.app'
];

async function check(url) {
  return new Promise((resolve) => {
    // Test Microlink
    const mlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
    https.get(mlinkUrl, (res) => {
      console.log('Microlink:', url, '=>', res.statusCode, res.headers['content-type']);
      resolve();
    }).on('error', (e) => {
      console.log('Microlink error:', e.message);
      resolve();
    });
  });
}

async function checkMshots(url) {
  return new Promise((resolve) => {
    const mshotsUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=800&h=500`;
    https.get(mshotsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      console.log('mShots:', url, '=>', res.statusCode, res.headers['content-type']);
      resolve();
    }).on('error', (e) => {
      console.log('mShots error:', e.message);
      resolve();
    });
  });
}

async function run() {
  for (const s of sites) {
    await check(s);
    await checkMshots(s);
  }
}

run();
