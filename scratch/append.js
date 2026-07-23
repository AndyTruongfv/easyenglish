const fs = require('fs');
const comp = fs.readFileSync('scratch/legacy_cloze_view.txt', 'utf-8');
fs.appendFileSync('src/routes/_authenticated/lesson.$courseId.$lessonId.tsx', '\n' + comp + '\nexport { LegacyClozeView };\n');
console.log("Done");
