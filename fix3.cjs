const fs = require('fs');
let content = fs.readFileSync('src/components/AdminModal.tsx', 'utf8');

content = content.replace(/role !== 'master'/g, "!['ore', 'dara'].includes(role || '')");
content = content.replace(/{ id: 'master', label: 'Master \\(1212\\)' },/g, "{ id: 'ore', label: 'Ore (1999)' },\n                              { id: 'dara', label: 'Dara (2003)' },");
content = content.replace(/getInviteCodes\('master'\)/g, "getInviteCodes()");
content = content.replace(/role = 'master'/g, "role = 'ore'");

fs.writeFileSync('src/components/AdminModal.tsx', content);
