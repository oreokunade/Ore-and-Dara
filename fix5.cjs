const fs = require('fs');
let content = fs.readFileSync('src/utils/storage.ts', 'utf8');

content = content.replace(/createdBy: string = 'master'/g, "createdBy: string = 'ore'");

fs.writeFileSync('src/utils/storage.ts', content);
