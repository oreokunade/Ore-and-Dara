const fs = require('fs');
let content = fs.readFileSync('src/utils/storage.ts', 'utf8');

content = content.replace(/filterByRole !== 'master'/g, "!['ore', 'dara'].includes(filterByRole)");

fs.writeFileSync('src/utils/storage.ts', content);
