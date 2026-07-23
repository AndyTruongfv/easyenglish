import fs from 'fs';

const atomFilePath = 'C:\\Users\\andyt\\.gemini\\antigravity-ide\\brain\\3990039e-cb78-48ae-9d8d-653a8baeeada\\scratch\\blog_archive\\Takeout\\Blogger\\Blogs\\Tiếng Anh chỉ là chuyện nhỏ!!!\\feed.atom';

const content = fs.readFileSync(atomFilePath, 'utf-8');
const entries = content.match(/<entry>([\s\S]*?)<\/entry>/g) || [];

for (const entry of entries) {
    const htmlMatch = entry.match(/<content type='html'>([\s\S]*?)<\/content>/);
    if (!htmlMatch) continue;
    
    let html = htmlMatch[1];
    
    if (html.includes('JCloze') || html.includes('JCLOZE')) {
        fs.writeFileSync('debug_jcloze.html', html);
        console.log('Saved debug_jcloze.html');
        break;
    }
}
