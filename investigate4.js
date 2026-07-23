import fs from 'fs';
const html = fs.readFileSync('debug_jcloze.html', 'utf8');

// The question text must be somewhere! Let's search for the first question's text or choices
console.log(html.substring(html.indexOf('<div class="QuestionNavigation"'), html.indexOf('<div class="QuestionNavigation"') + 1500));
