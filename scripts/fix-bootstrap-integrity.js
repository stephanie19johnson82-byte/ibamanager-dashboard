const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
      continue;
    }
    if (!full.endsWith('.html')) continue;

    const text = fs.readFileSync(full, 'utf8');
    const oldHash = 'integrity="sha384-pprn3073KE6tl6YpGb57x3nSE9VdGq4nUn4F6lyDJwhy8P5QEa5dY8BRT8niErm9"';
    const newHash = 'integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"';
    if (!text.includes(oldHash)) continue;

    const fixed = text.split(oldHash).join(newHash);
    fs.writeFileSync(full, fixed, 'utf8');
    console.log('updated', full);
  }
}

walk(process.cwd());
