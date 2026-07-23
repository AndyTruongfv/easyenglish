const fs = require('fs');
const path = require('path');

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

function unescapeUnicode(str) {
    if (!str) return '';
    let unescaped = str.replace(/\\u([a-fA-F0-9]{4})/g, function (g, m1) {
        return String.fromCharCode(parseInt(m1, 16));
    });
    unescaped = unescaped.replace(/\\x([a-fA-F0-9]{2})/g, function (g, m1) {
        return String.fromCharCode(parseInt(m1, 16));
    });
    unescaped = unescaped.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    return unescaped;
}

function extractLegacyCloze(html) {
    let answers = [];
    let htmlText = "";

    const regex = /I\[(\d+)\]\[1\]\[0\]\[0\]\s*=\s*'([^']+)';/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const idx = parseInt(match[1]);
        const answer = unescapeUnicode(match[2]);
        answers[idx] = answer;
    }

    const bodyMatch = html.match(/<div class="ClozeBody">([\s\S]*?)<\/div>/i);
    if (bodyMatch) {
        htmlText = bodyMatch[1].trim();
        // Replace all <span class="GapSpan"...><input ...></span> with {index}
        // Sometimes it's inside <span class="GapSpan" id="GapSpan0">
        // Just look for <span class="GapSpan" id="GapSpan(\d+)">...<\/span>
        htmlText = htmlText.replace(/<span[^>]*class="GapSpan"[^>]*id="GapSpan(\d+)"[^>]*>[\s\S]*?<\/span>/gi, (m, id) => {
            return `{${id}}`;
        });
        
        // Remove empty script tags or other junk
        htmlText = htmlText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    if (answers.length > 0 && htmlText) {
        return { answers, htmlText };
    }
    return null;
}

function extractJQuiz(html) {
    const questions = [];
    const qMatches = [...html.matchAll(/I\[(\d+)\]\[1\]\[0\]\[0\]\s*=\s*'([^']+)'/g)];
    for (const qMatch of qMatches) {
        const qId = qMatch[1];
        const qText = unescapeUnicode(qMatch[2]);
        const cMatches = [...html.matchAll(new RegExp(`I\\[${qId}\\]\\[2\\]\\[(\\d+)\\]\\[0\\]\\s*=\\s*'([^']+)'`, 'g'))];
        const choices = [];
        let correctAnswerIdx = 0;
        for (const cMatch of cMatches) {
            const cId = cMatch[1];
            choices.push(unescapeUnicode(cMatch[2]));
            const isCorrect = new RegExp(`I\\[${qId}\\]\\[2\\]\\[${cId}\\]\\[2\\]\\s*=\\s*1`).test(html);
            if (isCorrect) correctAnswerIdx = parseInt(cId, 10);
        }
        if (choices.length > 0) {
            questions.push({ question: qText, choices: choices, answer: correctAnswerIdx, explanation: "" });
        }
    }
    return questions;
}

function extractJMatch(html) {
    const pairs = [];
    const lMatches = [...html.matchAll(/LItems\[\d+\] = new Array\('([^']+)'/g)];
    const rMatches = [...html.matchAll(/RItems\[\d+\] = new Array\('([^']+)'/g)];
    for (let i = 0; i < Math.min(lMatches.length, rMatches.length); i++) {
        pairs.push({ left: unescapeUnicode(lMatches[i][1]), right: unescapeUnicode(rMatches[i][1]) });
    }
    return pairs;
}

function extractJCloze(html) {
    const cloze = [];
    const bodyStartIdx = html.toLowerCase().indexOf('clozebody"');
    if (bodyStartIdx !== -1) {
        const divStart = html.lastIndexOf('<div', bodyStartIdx);
        let endIdx = html.indexOf('</form>', divStart);
        if (endIdx === -1) endIdx = html.indexOf('<div class="NavButtonBar"', divStart);
        if (endIdx === -1) endIdx = html.indexOf('</div>', divStart + 1000);
        if (divStart !== -1 && endIdx !== -1) {
            let text = html.substring(divStart, endIdx);
            const iMatches = [...html.matchAll(/I\[(\d+)\]\[1\]\[0\]\[0\]\s*=\s*'([^']+)'/g)];
            for (const match of iMatches) {
                const id = match[1];
                const ans = unescapeUnicode(match[2]);
                const gapRegex = new RegExp(`<span[^>]*id="GapSpan${id}"[^>]*>[\\s\\S]*?<\\/span>`, 'gi');
                text = text.replace(gapRegex, `{${ans}}`);
            }
            text = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            text = text.replace(/&nbsp;/g, ' ').replace(/&#x00A0;/g, ' ').replace(/&#160;/g, ' ');
            cloze.push({ text: text, explanation: "" });
        }
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

    // Fix title matching:
    const titleMatch = entryData.match(/<title[^>]*>(.*?)<\/title>/);
    let title = titleMatch ? titleMatch[1].trim() : 'Unknown Title';
    if (!title || title === 'Unknown Title') {
        const h3Match = entryData.match(/<h3[^>]*>(.*?)<\/h3>/);
        if (h3Match) title = h3Match[1].replace(/<[^>]+>/g, '').trim();
    }
    if (!title) title = 'Untitled Article ' + idCounter;
    
    // Some titles might be HTML encoded
    title = decodeHtml(title);
    
    const contentMatch = entryData.match(/<content type='html'>([\s\S]*?)<\/content>/);
    if (!contentMatch) continue;
    
    let html = decodeHtml(contentMatch[1]);
    
    let type = 'article';
    let legacyCloze = null;
    
    let quiz = [];
    let pairs = [];
    let cloze = [];
    
    if (html.includes('JCloze')) {
        legacyCloze = extractLegacyCloze(html);
        if (legacyCloze) {
            type = 'legacy-cloze';
        }
        cloze = extractJCloze(html);
    } else if (html.includes('JQuiz')) {
        type = 'quiz';
        quiz = extractJQuiz(html);
    } else if (html.includes('JMatch')) {
        type = 'match';
        pairs = extractJMatch(html);
    }

    const categories = [];
    const catRegex = /<category scheme="[^"]+" term="([^"]+)"\/>/g;
    let catMatch;
    while ((catMatch = catRegex.exec(entryData)) !== null) {
      categories.push(catMatch[1]);
    }
    
    let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/<div class="NavButtonBar"[\s\S]*?<\/div>/gi, '');
    cleanHtml = cleanHtml.replace(/<div class="Feedback"[\s\S]*?<\/div>/gi, '');
    cleanHtml = cleanHtml.replace(/<div class="Titles"[\s\S]*?<\/div>/gi, ''); 

    entries.push({
        id: `article-${idCounter++}`,
        title: title,
        categories: categories,
        htmlContent: cleanHtml,
        type: type,
        quiz: quiz.length > 0 ? quiz : undefined,
        pairs: pairs.length > 0 ? pairs : undefined,
        cloze: cloze.length > 0 ? cloze : undefined,
        legacyCloze: legacyCloze
    });
  }
  
  fs.writeFileSync(outputFilePath, JSON.stringify(entries, null, 2));
  console.log(`Extracted ${entries.length} articles to ${outputFilePath}`);
} catch (error) {
  console.error("Failed:", error);
}
