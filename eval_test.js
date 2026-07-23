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
      
    if (html.includes('JQuiz')) {
        const scriptMatch = html.match(/<script type="text\/javascript">([\s\S]*?)<\/script>/);
        if (scriptMatch) {
            let script = scriptMatch[1];
            // Remove function Client() and other DOM stuff that will crash Node
            script = script.replace(/function Client\(\)[\s\S]*?var C = new Client\(\);/, '');
            
            // Just try to eval the array definitions
            const arrayScript = script.split('//CODE FOR HANDLING')[0];
            
            try {
                let I = [];
                let State = [];
                eval(arrayScript);
                console.log("SUCCESSFULLY EVAL'D JQUIZ!");
                console.log(I[0][1][0][0]); // Question
                console.log(I[0][2][0][0]); // First choice
            } catch (e) {
                console.error("Eval failed", e.message);
            }
        }
        break;
    }
}
