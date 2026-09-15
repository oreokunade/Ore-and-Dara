const fs = require('fs');
let content = fs.readFileSync('src/components/AdminModal.tsx', 'utf8');
content = content.replace(/'master': 'Master',/g, "'ore': 'Ore',\n                                'dara': 'Dara',");
fs.writeFileSync('src/components/AdminModal.tsx', content);
