const fs = require('fs');
const path = require('path');
const fetch = globalThis.fetch || require('node-fetch');

async function main() {
  const filePath = process.argv[2] || path.join(__dirname, '..', 'BBGM_IBA_2067_preseason.json');
  if (!fs.existsSync(filePath)) {
    console.error('File not found', filePath);
    process.exit(1);
  }
  const body = fs.readFileSync(filePath, 'utf8');
  try {
    const res = await fetch('http://localhost:3000/api/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    const txt = await res.text();
    console.log('Status', res.status);
    console.log(txt.slice(0, 2000));
  } catch (e) {
    console.error('Fetch error', e);
  }
}

main();
