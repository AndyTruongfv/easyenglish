import fs from 'fs';

const atomFilePath = 'C:\\Users\\andyt\\.gemini\\antigravity-ide\\brain\\3990039e-cb78-48ae-9d8d-653a8baeeada\\scratch\\blog_archive\\Takeout\\Blogger\\Blogs\\Tiếng Anh chỉ là chuyện nhỏ!!!\\feed.atom';
const outputFilePath = 'e:\\VIBE CODING\\gem-learn-quest-main\\src\\data\\blog_content.json';

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function extractJQuiz(html) {
    const questions = [];
    const scriptMatch = html.match(/<script type="text\/javascript">([\s\S]*?)<\/script>/);
    if (!scriptMatch) return questions;
    const script = scriptMatch[1];
    
    // Extract questions
    // Format: I[0][1][0][0] = 'Question text';
    const qMatches = [...script.matchAll(/I\[(\d+)\]\[1\]\[0\]\[0\]\s*=\s*'([^']+)'/g)];
    
    for (const qMatch of qMatches) {
        const qId = qMatch[1];
        const qText = qMatch[2];
        
        // Extract choices for this question
        // Format: I[0][2][0][0] = 'Choice text';
        const cMatches = [...script.matchAll(new RegExp(`I\\[${qId}\\]\\[2\\]\\[(\\d+)\\]\\[0\\]\\s*=\\s*'([^']+)'`, 'g'))];
        
        const choices = [];
        let correctAnswerIdx = 0;
        
        for (const cMatch of cMatches) {
            const cId = cMatch[1];
            choices.push(cMatch[2]);
            
            // Check if this choice is the correct answer
            // Format: I[0][2][0][2] = 1;
            const isCorrect = new RegExp(`I\\[${qId}\\]\\[2\\]\\[${cId}\\]\\[2\\]\\s*=\\s*1`).test(script);
            if (isCorrect) correctAnswerIdx = parseInt(cId, 10);
        }
        
        if (choices.length > 0) {
            questions.push({
                question: qText,
                choices: choices,
                answer: correctAnswerIdx,
                explanation: ""
            });
        }
    }
    
    return questions;
}

function extractJMatch(html) {
    const pairs = [];
    const scriptMatch = html.match(/<script type="text\/javascript">([\s\S]*?)<\/script>/);
    if (!scriptMatch) return pairs;
    const script = scriptMatch[1];
    
    const lMatches = [...script.matchAll(/LItems\[\d+\] = new Array\('([^']+)'/g)];
    const rMatches = [...script.matchAll(/RItems\[\d+\] = new Array\('([^']+)'/g)];
    
    for (let i = 0; i < Math.min(lMatches.length, rMatches.length); i++) {
        pairs.push({ left: lMatches[i][1], right: rMatches[i][1] });
    }
    return pairs;
}

function extractJCloze(html) {
    const cloze = [];
    
    // In many JCloze versions, the cloze text is in a <div id="ClozeDiv"> or <div class="ClozeBody">
    let bodyMatch = html.match(/<div [^>]*id="ClozeDiv"[^>]*>([\s\S]*?)<\/div>/i);
    if (!bodyMatch) bodyMatch = html.match(/<div [^>]*class="ClozeBody"[^>]*>([\s\S]*?)<\/div>/i);
    if (!bodyMatch) bodyMatch = html.match(/<div [^>]*id="clozebody"[^>]*>([\s\S]*?)<\/div>/i);
    
    if (bodyMatch) {
        let text = bodyMatch[1];
        // Replace <span class="GapSpan" id="GapSpan0">...</span> with {answer}
        // In the HTML, the answer is usually not directly inside the gap in the HTML, but in JS.
        // Wait, the gap is replaced by an input box. The answer is in the JS array `I`.
        // Let's just find the script to extract I[0][1][0][0] = 'answer';
        const scriptMatch = html.match(/<script type="text\/javascript">([\s\S]*?)<\/script>/);
        if (scriptMatch) {
            const script = scriptMatch[1];
            const iMatches = [...script.matchAll(/I\[(\d+)\]\[1\]\[0\]\[0\]\s*=\s*'([^']+)'/g)];
            
            // Reconstruct text by replacing GapSpan0 with {answer}
            for (const match of iMatches) {
                const id = match[1];
                const ans = match[2];
                // Regex to find <span id="GapSpan0">...</span>
                const gapRegex = new RegExp(`<span[^>]*id="GapSpan${id}"[^>]*>[\\s\\S]*?<\\/span>`, 'gi');
                text = text.replace(gapRegex, `{${ans}}`);
            }
        }
        
        // clean up html tags from text for the cloze UI
        text = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        
        cloze.push({
            text: text,
            explanation: ""
        });
    }
    
    return cloze;
}

try {
  const content = fs.readFileSync(atomFilePath, 'utf-8');
  
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  
  let idCounter = 1;

  while ((match = entryRegex.exec(content)) !== null) {
    const entryData = match[1];
    if (entryData.includes('<blogger:type>COMMENT</blogger:type>')) continue;
    if (entryData.includes('<blogger:status>DRAFT</blogger:status>')) continue;

    const titleMatch = entryData.match(/<title type='text'>(.*?)<\/title>/);
    let title = titleMatch ? titleMatch[1].trim() : 'Unknown Title';
    if (!title) title = 'Untitled Article ' + idCounter;
    
    const contentMatch = entryData.match(/<content type='html'>([\s\S]*?)<\/content>/);
    if (!contentMatch) continue;
    
    let html = decodeHtml(contentMatch[1]);
    
    let type = null;
    let quiz = [];
    let pairs = [];
    let cloze = [];
    
    if (html.includes('JQuiz')) {
        type = 'quiz';
        quiz = extractJQuiz(html);
    } else if (html.includes('JMatch')) {
        type = 'match';
        pairs = extractJMatch(html);
    } else if (html.includes('JCloze')) {
        type = 'cloze';
        cloze = extractJCloze(html);
    }

    const categories = [];
    const catRegex = /<category scheme="[^"]+" term="([^"]+)"\/>/g;
    let catMatch;
    while ((catMatch = catRegex.exec(entryData)) !== null) {
      categories.push(catMatch[1]);
    }
    
    // Clean HTML: remove the Hot Potatoes scripts and standard divs that clutter the reading view.
    let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/<div class="NavButtonBar"[\s\S]*?<\/div>/gi, '');
    cleanHtml = cleanHtml.replace(/<div class="Feedback"[\s\S]*?<\/div>/gi, '');

    entries.push({
        id: `article-${idCounter++}`,
        title: title,
        categories: categories,
        htmlContent: cleanHtml,
        type: type || 'article',
        quiz: quiz.length > 0 ? quiz : undefined,
        pairs: pairs.length > 0 ? pairs : undefined,
        cloze: cloze.length > 0 ? cloze : undefined
    });
  }
  
  fs.writeFileSync(outputFilePath, JSON.stringify(entries, null, 2));
  console.log(`Extracted ${entries.length} articles to ${outputFilePath}`);
} catch (error) {
  console.error("Failed:", error);
}
