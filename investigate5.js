import fs from 'fs';
const html = fs.readFileSync('debug_jcloze.html', 'utf8');
const start = html.indexOf('<body');
const end = html.indexOf('</body>');
if (start !== -1 && end !== -1) {
    fs.writeFileSync('debug_body.txt', html.substring(start, end));
    console.log('Saved debug_body.txt');
} else {
    console.log("Not found");
}
