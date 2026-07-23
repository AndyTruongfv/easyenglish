import fs from 'fs';
const html = fs.readFileSync('debug_jcloze.html', 'utf8');
const start = html.indexOf('<ol class="QuizQuestions"');
const end = html.indexOf('</ol>', start);
if (start !== -1 && end !== -1) {
    console.log(html.substring(start, end + 5));
} else {
    console.log("Not found");
}
