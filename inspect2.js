import fs from 'fs';

const atomFilePath = 'C:\\Users\\andyt\\.gemini\\antigravity-ide\\brain\\3990039e-cb78-48ae-9d8d-653a8baeeada\\scratch\\blog_archive\\Takeout\\Blogger\\Blogs\\Tiếng Anh chỉ là chuyện nhỏ!!!\\feed.atom';

const content = fs.readFileSync(atomFilePath, 'utf-8');
const entries = content.match(/<entry>([\s\S]*?)<\/entry>/g) || [];

for (const entry of entries) {
    if (entry.includes('<blogger:type>COMMENT</blogger:type>')) continue;
    const htmlMatch = entry.match(/<content type='html'>([\s\S]*?)<\/content>/);
    if (!htmlMatch) continue;
    
    let html = htmlMatch[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');
      
    if (html.includes('JCloze')) {
        const bodyMatch = html.match(/<div [^>]*class="ClozeBody"[^>]*>([\s\S]*?)<\/div>/i) || html.match(/<div [^>]*id="ClozeBody"[^>]*>([\s\S]*?)<\/div>/i);
        if (bodyMatch) {
            console.log("CLOZE BODY:");
            console.log(bodyMatch[1]);
        } else {
            console.log("NO CLOZE BODY");
        }
        break;
    }
}
