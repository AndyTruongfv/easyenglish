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
        console.log("=== JCLOZE ===");
        const script = html.match(/<script type="text\/javascript">([\s\S]*?)<\/script>/)?.[1];
        if (script) {
            // Find LItems or I array
            const idx = script.indexOf('I = new Array();');
            if (idx > -1) {
                console.log(script.substring(idx, idx + 1000));
            } else {
                console.log("No I array found in JCloze.");
                // dump last 1000 chars of script
                console.log(script.substring(script.length - 1000));
            }
        }
        
        // Also look at the body HTML for the cloze text
        const bodyMatch = html.match(/<div class="ClozeBody">([\s\S]*?)<\/div>/);
        if (bodyMatch) {
            console.log("CLOZE BODY:");
            console.log(bodyMatch[1].substring(0, 500));
        }
        break;
    }
}
