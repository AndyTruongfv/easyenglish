// src/lib/gemini.ts
// Google Gemini AI Service for Easy English Admin Panel

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("Thiếu Gemini API Key trong .env");

  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(`Gemini API lỗi ${res.status}: ${err?.error?.message || res.statusText}`);
  }

  const data = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) throw new Error("Gemini không trả về nội dung.");
  return text;
}

function clean(raw: string): string {
  return raw.replace(/```html?\n?/gi, "").replace(/```\n?/g, "").trim();
}

// ─────────────────────────────────────────────────────────────────────────
export async function generateVocabularyAZ(topic: string, level: string): Promise<string> {
  // Build level-specific instructions
  const isBasic = /A1|A2|Cơ bản|basic/i.test(level);
  const isAdvanced = /C1|C2|Nâng cao|advanced/i.test(level);

  const levelGuide = isBasic
    ? `LEVEL: Basic (A1-A2). Use ONLY simple, everyday words a beginner would learn first.
Examples of appropriate words: table, chair, bed, lamp, door, window, floor, wall.
Do NOT include academic, formal, or rare words. Keep Vietnamese definitions short and simple.
Target: 30-40 common words.`
    : isAdvanced
    ? `LEVEL: Advanced (C1-C2). Use ONLY sophisticated, academic, formal, or specialized vocabulary.
Examples: ergonomic, upholstery, ottoman, credenza, chaise longue, wainscoting, kitchenette, vestibule, refurbish, furnishings.
Do NOT include basic words like "table", "chair", "bed". Every word should challenge a C1-C2 learner.
Include compound nouns, collocations, and technical terms specific to "${topic}".
Target: 50-80 advanced words.`
    : `LEVEL: Intermediate (B1-B2). Use words beyond basic but not overly academic.
Examples: bookshelf, armrest, nightstand, countertop, wardrobe, cabinet, cushion, chandelier, drawer, furnishing.
Avoid beginner words (table, chair, bed) AND avoid rare/academic words.
Include useful compound nouns and practical terms for daily life.
Target: 40-60 intermediate words.`;

  const prompt = `You are an expert English-Vietnamese vocabulary teacher specializing in level-appropriate word selection.

TASK: Generate a comprehensive A-Z vocabulary list for the topic: "${topic}".

${levelGuide}

═══════════════════════════════════════════════
STRICT HTML OUTPUT FORMAT (copy this structure EXACTLY):
═══════════════════════════════════════════════

<h3 style="font-size:18px;font-weight:900;margin-bottom:10px;">🔤 Bảng Từ Vựng A-Z: ${topic} — ${level}</h3>
<div style="font-family:'Trebuchet MS',sans-serif;font-size:14px;background:rgba(16,185,129,0.06);border:2px solid #10b981;border-radius:16px;padding:16px;margin-bottom:12px;">
<p style="font-size:13px;font-weight:bold;color:#059669;margin-bottom:10px;letter-spacing:1px;">
<a href="#vA" style="color:#059669;text-decoration:none;">A</a> ! <a href="#vB" style="color:#059669;text-decoration:none;">B</a> ! <a href="#vC" style="color:#059669;text-decoration:none;">C</a> ! <a href="#vD" style="color:#059669;text-decoration:none;">D</a> ! <a href="#vE" style="color:#059669;text-decoration:none;">E</a> ! <a href="#vF" style="color:#059669;text-decoration:none;">F</a> ! <a href="#vG" style="color:#059669;text-decoration:none;">G</a> ! <a href="#vH" style="color:#059669;text-decoration:none;">H</a> ! <a href="#vI" style="color:#059669;text-decoration:none;">I</a> ! <a href="#vJ" style="color:#059669;text-decoration:none;">J</a> ! <a href="#vK" style="color:#059669;text-decoration:none;">K</a> ! <a href="#vL" style="color:#059669;text-decoration:none;">L</a> ! <a href="#vM" style="color:#059669;text-decoration:none;">M</a> ! <a href="#vN" style="color:#059669;text-decoration:none;">N</a> ! <a href="#vO" style="color:#059669;text-decoration:none;">O</a> ! <a href="#vP" style="color:#059669;text-decoration:none;">P</a> ! <a href="#vQ" style="color:#059669;text-decoration:none;">Q</a> ! <a href="#vR" style="color:#059669;text-decoration:none;">R</a> ! <a href="#vS" style="color:#059669;text-decoration:none;">S</a> ! <a href="#vT" style="color:#059669;text-decoration:none;">T</a> ! <a href="#vU" style="color:#059669;text-decoration:none;">U</a> ! <a href="#vV" style="color:#059669;text-decoration:none;">V</a> ! <a href="#vW" style="color:#059669;text-decoration:none;">W</a> ! <a href="#vZ" style="color:#059669;text-decoration:none;">Z</a>
</p>

Then for EACH letter that has words:

<a name="vA"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">A</p>
<b>word one</b> <span style="color:#cc3366;">/IPA/</span>: <span style="color:#0369a1;">Vietnamese meaning</span><br/>
<b>word two</b> <span style="color:#cc3366;">/IPA/</span>: <span style="color:#0369a1;">Vietnamese meaning</span><br/>
<b>word three</b> <span style="color:#cc3366;">/IPA/</span>: <span style="color:#0369a1;">Vietnamese meaning</span><br/>
<b>word four</b> <span style="color:#cc3366;">/IPA/</span>: <span style="color:#0369a1;">Vietnamese meaning</span><br/>

(Continue for B, C, D... through Z)

Close the main div with </div>

Then add exercises:
<h4>📝 Bài Tập Điền Từ:</h4>
1. Sentence using {answer_word}.<br/>
2. Another sentence using {answer_word}.<br/>
(5-10 exercises using words from the list above)

═══════════════════════════════════════════════
CRITICAL RULES:
═══════════════════════════════════════════════
- YOU MUST GENERATE A LONG LIST! DO NOT BE LAZY! Generate AT LEAST 50 WORDS TOTAL!
- For EACH letter, you MUST provide MULTIPLE words (e.g. 3-5 words per letter). Do not just provide 1 word per letter.
- Even if a topic is narrow, think of related compound nouns, adjectives, verbs, and accessories.
- The A-Z navigation bar at the top is MANDATORY. Include ALL 26 letters as anchor links.
- IPA transcription must be accurate British English (Cambridge Dictionary standard).
- Vietnamese meanings must be natural, clear Vietnamese — NOT Google Translate output.
- STRICTLY follow level guidance above — wrong level = FAILURE.
- VITAL: If the topic involves physical objects (e.g. "Fruits", "Vegetables", "Meat", "Animals", "Furniture", "Anatomy", "Therapy", "Chiropractic"), you MUST include 1 to 3 beautiful, highly relevant Wikimedia Commons image URLs illustrating the topic (e.g. a diagram of meat cuts, a colorful fruit basket, or human skeleton) using <img src="..." style="max-width:100%; max-height:400px; border-radius:12px; margin: 15px auto; display:block; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);" /> at the top of the list!
- Output ONLY raw HTML. No markdown. No code fences. No explanatory text.`;

  const raw = await callGemini(prompt);
  let html = clean(raw);

  // Post-process: inject TTS 🔊 buttons after each <b>word</b>
  html = html.replace(
    /<b>([^<]+)<\/b>\s*<span style="color:#cc3366;">/g,
    (_, word) => {
      const escaped = word.trim().replace(/'/g, "\\'");
      return `<b>${word}</b> <button data-tts="${escaped}" style="background:rgba(37,99,235,0.12);border:1px solid rgba(37,99,235,0.3);color:#2563eb;border-radius:6px;padding:1px 7px;font-size:11px;cursor:pointer;margin-left:4px;font-weight:bold;" title="Phát âm: ${word.trim()}">🔊</button> <span style="color:#cc3366;">`;
    }
  );

  return html;
}

// ─────────────────────────────────────────────────────────────────────────
// 2. TOEIC — Full practice content
// ─────────────────────────────────────────────────────────────────────────
export async function generateTOEICContent(topic: string, skill: string, level: string): Promise<string> {
  const skillMap: Record<string, string> = {
    reading: `Create a TOEIC Part 7 Reading section for topic "${topic}" (level: ${level}).
Content: realistic business document (email/memo/report/article, 300-450 words).
Questions: 5 multiple-choice (A/B/C/D). Do NOT replace the correct option with the answer placeholder. Keep (A) (B) (C) (D) intact. Instead, on a new line BELOW option (D), output exactly: "Your Answer: {A}" (replace A with the correct letter).
Add: 8-word vocabulary box with IPA and Vietnamese meaning.`,

    listening: `Create a TOEIC Part 3 Listening dialogue for topic "${topic}" (level: ${level}).
Dialogue: 2-3 speakers, realistic business conversation, ~150 words.
Questions: 3 multiple-choice. Do NOT replace the options. Keep (A) (B) (C) (D) intact. On a new line BELOW option (D), output exactly: "Your Answer: {A}" (replace A with the correct letter).
Include speaker notes in italics.`,

    grammar: `Create 10 TOEIC Part 5 sentence completion questions for topic "${topic}" (level: ${level}).
Format: "She ___ the report by noon. <br/>(A) submit <br/>(B) submitted <br/>(C) submitting <br/>(D) to submit"
Do NOT replace the correct option in the list. Keep A,B,C,D intact. Below option D, write exactly: "Your Answer: {B}" (replace B with correct letter).
Add brief grammar tip for each question.`,

    writing: `Create a TOEIC Writing Task for topic "${topic}" (level: ${level}).
Include task prompt, then a model answer (200-220 words).
Add key phrases list with IPA and Vietnamese meaning.`,
  };

  const prompt = `You are a certified TOEIC expert teacher. ${skillMap[skill] || skillMap.reading}
Level: ${level}. Adjust reading passage word count, sentence complexity, and distractor difficulty according to the selected TOEIC range.

STRICT HTML OUTPUT (no markdown):
- Wrap reading/dialogue in: <div style="background:rgba(245,158,11,0.06);border:2px solid #f59e0b;border-radius:16px;padding:16px;margin-bottom:16px;line-height:1.8;font-size:14px;">
- Headers in color #f59e0b
- Vocabulary box: <div style="background:rgba(245,158,11,0.1);border:1px solid #f59e0b;border-radius:12px;padding:12px;margin:14px 0;">
- Level badge: <span style="background:#f59e0b;color:white;padding:2px 8px;border-radius:6px;font-size:12px;font-weight:bold;">${level}</span>
- CRITICAL: For ALL questions, you must still generate the full question text and all multiple-choice options (A, B, C, D). However, to make it interactive, you MUST place the correct answer inside curly braces at the blank space or at the end of the question like this: {A}, {True}, or {answer}. Do not provide a separate answer key at the bottom.
- ONLY HTML output`;

  return clean(await callGemini(prompt));
}

// ─────────────────────────────────────────────────────────────────────────
// 3. IELTS — Academic passage or writing/speaking task
// ─────────────────────────────────────────────────────────────────────────
export async function generateIELTSContent(topic: string, skill: string, band: string): Promise<string> {
  const skillMap: Record<string, string> = {
    reading: `Create a complete IELTS Academic Reading passage for "${topic}" targeting Band ${band}.
Full article: 700-900 words, authentic academic language and structure.
Questions: 13 total — 5 True/False/Not Given, 4 matching headings, 4 fill-in-blank.
CRITICAL: You must write out the full questions and options. To make them interactive, place the correct answer inside curly braces at the blank space or at the end of the question like this: {True}, {Paragraph A}, or {answer}.
Vocabulary: 10 academic words with IPA and Vietnamese meaning.`,

    writing1: `Create an IELTS Academic Writing Task 1 for "${topic}" targeting Band ${band}.
Describe a chart/graph/process. Model answer: 190-210 words.
Include key language for trends, key phrases list with IPA.`,

    writing2: `Create an IELTS Academic Writing Task 2 essay on "${topic}" targeting Band ${band}.
Essay type: discuss/argue/problem-solution (specify which).
Model answer: 290-320 words with Band ${band} academic vocabulary.
Include essay structure breakdown and 8 key vocab with IPA + Vietnamese.`,

    speaking: `Create IELTS Speaking Part 1, 2, and 3 for topic "${topic}" targeting Band ${band}.
Part 1: 4 questions + model answers.
Part 2: Cue card + 2-minute model answer.
Part 3: 3 discussion questions + extended model answers.
Key vocabulary + idiomatic expressions with IPA.`,
  };

  const prompt = `You are an IELTS examiner and expert teacher. ${skillMap[skill] || skillMap.reading}
Band Target: ${band}. Adjust academic vocabulary density and question type depth based on the selected Band range.

STRICT HTML OUTPUT (no markdown):
- Passage wrapper: <div style="background:rgba(139,92,246,0.06);border:2px solid #8b5cf6;border-radius:16px;padding:16px;margin-bottom:16px;line-height:1.9;font-size:14px;"> (IMPORTANT: CLOSE this div </div> immediately after the reading passage! Do NOT put the questions inside this wrapper!)
- Section headers in color #8b5cf6 (e.g. <h3 style="color:#8b5cf6;margin-top:20px;">Questions</h3>)
- Academic words: <b style="color:#2563eb;">word</b>
- Vietnamese meanings in color #0369a1
- Band badge: <span style="background:#8b5cf6;color:white;padding:2px 8px;border-radius:6px;font-size:12px;font-weight:bold;">Band ${band}</span>
- ONLY HTML output`;

  return clean(await callGemini(prompt));
}

// ─────────────────────────────────────────────────────────────────────────
// 4. GRAMMAR — Explanation + diagram + exercises
// ─────────────────────────────────────────────────────────────────────────
export async function generateGrammarLesson(topic: string): Promise<string> {
  const prompt = `You are an expert English grammar teacher for Vietnamese learners.
Create a complete grammar lesson for: "${topic}".

Include:
1. Structure diagram (in a highlighted box)
2. 3 clear usage rules (English + Vietnamese explanation)
3. Common mistakes Vietnamese learners make (with red X / green ✓ examples)
4. 8 illustrative sentences (mark grammar parts with {answer})
5. 8 practice fill-in-the-blank exercises (use {answer} format)

STRICT HTML OUTPUT (no markdown):
- Structure box: <div style="background:rgba(59,130,246,0.1);border:2px dashed #3b82f6;padding:14px;border-radius:14px;font-weight:bold;margin-bottom:14px;line-height:1.6;">
- Formulas in: <span style="color:#2563eb;font-size:15px;">formula</span>
- Correct examples in: <span style="color:#059669;">✓ example</span>
- Wrong examples in: <span style="color:#ef4444;">✗ wrong example</span>
- Vietnamese notes in: <span style="color:#0369a1;">explanation</span>
- Mistakes box: <div style="background:rgba(239,68,68,0.08);border:1px solid #ef4444;border-radius:10px;padding:10px;margin:10px 0;">
- ONLY HTML output`;

  return clean(await callGemini(prompt));
}

// ─────────────────────────────────────────────────────────────────────────
// 5. NEWS — Adapted article with vocabulary + exercises
// ─────────────────────────────────────────────────────────────────────────
export async function generateNewsLesson(topic: string, source: string, level: string): Promise<string> {
  const prompt = `You are an English teacher creating a news-based English lesson.
Write an educational news article on: "${topic}" at level: ${level}.
Style: inspired by ${source} (journalistic, factual, balanced).

Include:
1. Headline and dateline/byline
2. Full article body: 450-600 words appropriate for level ${level}. IMPORTANT: The original article body must NOT contain any fill-in-the-blank gaps or curly braces {}. Display the full unedited article text here.
3. Vocabulary box: 10 key words/phrases with IPA, English definition, Vietnamese meaning
4. Exercise Section: 5 comprehension questions with fill-in-blank answers using {answer} format. These MUST be placed at the very end of the output in a separate exercise section.
5. 2 discussion questions for speaking practice (MUST be explicitly numbered 1. and 2. using an <ol> list)

STRICT HTML OUTPUT (no markdown):
- Article wrapper: <div style="background:rgba(99,102,241,0.06);border:2px solid #6366f1;border-radius:16px;padding:16px;margin-bottom:16px;line-height:1.9;font-size:14px;"> (IMPORTANT: CLOSE this div </div> immediately after the article body! Do NOT put the vocabulary or exercises inside this wrapper!)
- Section headers: <h3 style="color:#4f46e5;margin-top:20px;">Section Name</h3>
- Headline: <h2 style="font-size:20px;font-weight:900;color:#1e1b4b;margin-bottom:4px;">HEADLINE</h2>
- Source line: <p style="font-size:11px;color:#6b7280;margin-bottom:14px;">Source: ${source} | Level: ${level} | Educational Use Only</p>
- Vocabulary box: <div style="background:rgba(99,102,241,0.1);border:1px solid #6366f1;border-radius:12px;padding:12px;margin:14px 0;">
- ONLY HTML output`;

  return clean(await callGemini(prompt));
}

// ─────────────────────────────────────────────────────────────────────────
// 6. SONG — Cloze lesson from song title/artist
// ─────────────────────────────────────────────────────────────────────────
export async function generateSongLesson(songTitle: string, artist: string): Promise<string> {
  const prompt = `You are an English teacher creating a song-based English lesson for educational use.
Song: "${songTitle}" by ${artist}.

Include:
1. Song info header (artist, genre, year, theme)
2. Key vocabulary from the song: 8-10 words with IPA and Vietnamese meaning
3. 2-3 sample verses with fill-in-the-blank gaps using {answer} format (paraphrase if needed for copyright)
4. Thematic analysis and cultural context (3-4 sentences)
5. 3 discussion questions about the song's theme

STRICT HTML OUTPUT (no markdown):
- Song info box: <div style="background:rgba(236,72,153,0.08);border:2px solid #ec4899;border-radius:16px;padding:14px;margin-bottom:14px;">
- Lyrics section: <div style="font-style:italic;background:rgba(0,0,0,0.04);padding:12px;border-left:4px solid #ec4899;border-radius:0 10px 10px 0;margin:10px 0;line-height:2.2;">
- ONLY HTML output`;

  return clean(await callGemini(prompt));
}

// ─────────────────────────────────────────────────────────────────────────
// DICTIONARY LOOKUP
// ─────────────────────────────────────────────────────────────────────────
export async function lookupWordInDictionary(
  word: string,
  context?: string
): Promise<{ word: string; phonetics: string; en: string; vi: string }> {
  const prompt = `You are a professional English-Vietnamese dictionary.
Please define the following word or phrase: "${word}"
${context ? `Context of usage: "${context}"` : ""}

Output STRICTLY in JSON format with EXACTLY these fields:
{
  "word": "The exact word or phrase",
  "phonetics": "IPA transcription (e.g. /wɜːd/)",
  "en": "English definition (clear and concise)",
  "vi": "Vietnamese meaning (natural and accurate)"
}
Do NOT output anything else, no markdown fences, just the raw JSON object.`;

  const raw = await callGemini(prompt);
  try {
    return JSON.parse(raw);
  } catch (e) {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Cannot parse dictionary JSON");
  }
}

