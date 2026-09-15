const fs = require('fs');
let content = fs.readFileSync('src/components/AdminModal.tsx', 'utf8');

content = content.replace(/role === 'master'/g, "['ore', 'dara'].includes(role || '')");
content = content.replace(/const roles = \['master', 'custom1964', 'groomsfamily', 'bridesfamily'\];/g, "const roles = ['ore', 'dara', 'custom1964', 'groomsfamily', 'bridesfamily'];");
content = content.replace(/'master': 'MASTER \\(1212\\)',/g, "'ore': 'ORE (1999)',\n                                'dara': 'DARA (2003)',");

fs.writeFileSync('src/components/AdminModal.tsx', content);
