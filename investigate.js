import fs from 'fs';

const atomFilePath = 'C:\\Users\\andyt\\.gemini\\antigravity-ide\\brain\\3990039e-cb78-48ae-9d8d-653a8baeeada\\scratch\\blog_archive\\Takeout\\Blogger\\Blogs\\Tiếng Anh chỉ là chuyện nhỏ!!!\\feed.atom';

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

const content = fs.readFileSync(atomFilePath, 'utf-8');
const entries = content.match(/<entry>([\s\S]*?)<\/entry>/g) || [];

let foundQuiz = false;
let foundCloze = false;

for (const entry of entries) {
    if (foundQuiz && foundCloze) break;
    const htmlMatch = entry.match(/<content type='html'>([\s\S]*?)<\/content>/);
    if (!htmlMatch) continue;
    
    let html = decodeHtml(htmlMatch[1]);
    
    if (!foundQuiz && html.includes('JQuiz')) {
        foundQuiz = true;
        console.log("=== JQUIZ SCRIPT ===");
        const scriptMatch = html.match(/<script type="text\/javascript">([\s\S]*?)<\/script>/);
        if (scriptMatch) {
            console.log(scriptMatch[1].substring(0, 1000));
        } else {
             console.log("NO SCRIPT MATCH!");
        }
    }
    
    if (!foundCloze && html.includes('JCloze')) {
        foundCloze = true;
        console.log("=== JCLOZE SCRIPT ===");
        const scriptMatch = html.match(/<script type="text\/javascript">([\s\S]*?)<\/script>/);
        if (scriptMatch) {
            console.log(scriptMatch[1].substring(0, 1000));
        } else {
             console.log("NO SCRIPT MATCH!");
        }
    }
}
