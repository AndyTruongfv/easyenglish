const fs = require('fs');
const lines = fs.readFileSync('src/routes/_authenticated/admin.tsx', 'utf-8').split('\n');
const newLines = [...lines.slice(0, 46), 'import { PRESET_TRENDS, TOP_CHARTS } from "../../lib/songs";', ...lines.slice(361)];
fs.writeFileSync('src/routes/_authenticated/admin.tsx', newLines.join('\n'));
