export type Flashcard = {
  term: string;
  definition: string;
  example: string;
  ipa?: string;
};

export type QuizQuestion = {
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
};

export type MatchPair = { left: string; right: string };

export type ClozeQuestion = {
  text: string;
  explanation: string;
};

export type LegacyClozeData = {
  htmlText: string;
  answers: string[];
  audioUrl?: string;
  youtubeUrl?: string;
  karaokeUrl?: string;
};

export type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  type: "flashcards+quiz" | "quiz" | "match" | "toeic" | "cloze" | "mix" | "crossword" | "legacy-cloze" | "legacy-quiz";
  flashcards?: Flashcard[];
  quiz?: QuizQuestion[];
  pairs?: MatchPair[];
  cloze?: ClozeQuestion[];
  legacyCloze?: LegacyClozeData;
  timeLimitSec?: number;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  color: string;
  emoji: string;
  locked?: boolean;
  lessons: Lesson[];
};

export const COURSES: Course[] = [
  {
    id: "english-tenses",
    title: "English Tenses Mastery",
    description: "Master all 12 English Tenses with knowledge and fill-in-the-blanks.",
    color: "primary",
    emoji: "⏳",
    lessons: [
      {
        id: "present-simple",
        title: "Present Simple",
        subtitle: "Habits and general truths",
        icon: "1️⃣",
        type: "cloze",
        cloze: [
          { text: "She {goes} to the gym every morning.", explanation: "Add 'es' for 3rd person singular 'go'." },
          { text: "Water {boils} at 100 degrees Celsius.", explanation: "General truth requires Present Simple." },
          { text: "I {don't} like playing tennis.", explanation: "Negative form uses do not / don't." }
        ]
      },
      {
        id: "present-continuous",
        title: "Present Continuous",
        subtitle: "Actions happening right now",
        icon: "2️⃣",
        type: "cloze",
        cloze: [
          { text: "Look! The baby {is sleeping} right now.", explanation: "Use 'is' + V-ing for singular subjects." },
          { text: "We {are studying} for our exams this week.", explanation: "Temporary situations take Present Continuous." }
        ]
      },
      {
        id: "present-perfect",
        title: "Present Perfect",
        subtitle: "Past actions with present results",
        icon: "3️⃣",
        type: "cloze",
        cloze: [
          { text: "I {have finished} my homework already.", explanation: "Use 'have' + past participle (V3)." },
          { text: "She {has lived} in London since 2010.", explanation: "Since requires Present Perfect." }
        ]
      },
      {
        id: "present-perfect-continuous",
        title: "Present Perfect Continuous",
        subtitle: "Actions started in past and still continuing",
        icon: "4️⃣",
        type: "cloze",
        cloze: [
          { text: "They {have been working} here for five years.", explanation: "Use 'have been' + V-ing." }
        ]
      },
      {
        id: "past-simple",
        title: "Past Simple",
        subtitle: "Completed actions in the past",
        icon: "5️⃣",
        type: "cloze",
        cloze: [
          { text: "I {visited} Paris last summer.", explanation: "Regular verbs add -ed in the past." },
          { text: "He {went} to the store yesterday.", explanation: "Irregular past of 'go' is 'went'." }
        ]
      },
      {
        id: "past-continuous",
        title: "Past Continuous",
        subtitle: "Actions in progress at a specific time in the past",
        icon: "6️⃣",
        type: "cloze",
        cloze: [
          { text: "I {was watching} TV when the phone rang.", explanation: "Use 'was' + V-ing for singular subjects." }
        ]
      },
      {
        id: "past-perfect",
        title: "Past Perfect",
        subtitle: "Action completed before another action in the past",
        icon: "7️⃣",
        type: "cloze",
        cloze: [
          { text: "The train {had left} before we arrived.", explanation: "Use 'had' + past participle (V3)." }
        ]
      },
      {
        id: "past-perfect-continuous",
        title: "Past Perfect Continuous",
        subtitle: "Action progressing up to a point in the past",
        icon: "8️⃣",
        type: "cloze",
        cloze: [
          { text: "She {had been crying} for an hour when he came.", explanation: "Use 'had been' + V-ing." }
        ]
      },
      {
        id: "future-simple",
        title: "Future Simple",
        subtitle: "Predictions and spontaneous decisions",
        icon: "9️⃣",
        type: "cloze",
        cloze: [
          { text: "I think it {will rain} tomorrow.", explanation: "Use 'will' + base verb for predictions." }
        ]
      },
      {
        id: "future-continuous",
        title: "Future Continuous",
        subtitle: "Action in progress at a specific future time",
        icon: "🔟",
        type: "cloze",
        cloze: [
          { text: "This time next week, I {will be lying} on the beach.", explanation: "Use 'will be' + V-ing." }
        ]
      },
      {
        id: "future-perfect",
        title: "Future Perfect",
        subtitle: "Action completed before a point in the future",
        icon: "1️⃣1️⃣",
        type: "cloze",
        cloze: [
          { text: "By next year, I {will have graduated} from university.", explanation: "Use 'will have' + V3." }
        ]
      },
      {
        id: "future-perfect-continuous",
        title: "Future Perfect Continuous",
        subtitle: "Duration of an action up to a future point",
        icon: "1️⃣2️⃣",
        type: "cloze",
        cloze: [
          { text: "By 5 PM, we {will have been waiting} for three hours.", explanation: "Use 'will have been' + V-ing." }
        ]
      }
    ],
  },
  {
    id: "grammar-foundation",
    title: "Grammar Foundation",
    description: "Master Articles, Pronouns & Prepositions.",
    color: "sky",
    emoji: "📚",
    lessons: [
      {
        id: "articles-a-an-the",
        title: "Articles A, AN, THE",
        subtitle: "Definite and indefinite articles",
        icon: "🅰️",
        type: "cloze",
        cloze: [
          { text: "I bought {an} apple and {a} banana.", explanation: "'an' before vowel sound, 'a' before consonant." },
          { text: "{The} sun rises in the east.", explanation: "Unique objects use 'the'." }
        ]
      }
    ],
  },
  {
    id: "vocabulary-builder",
    title: "Vocabulary Builder",
    description: "Everyday Life, Human Body, People & Traits.",
    color: "green",
    emoji: "🌱",
    lessons: [
      {
        id: "contracts",
        title: "Contracts & Agreements",
        subtitle: "Match the business terms",
        icon: "📝",
        type: "match",
        pairs: [
          { left: "Agreement", right: "A mutual understanding between two or more persons." },
          { left: "Breach", right: "Failure to fulfill the terms of a contract." },
          { left: "Clause", right: "A distinct article or provision in a contract." }
        ]
      }
    ],
  },
  {
    id: "exam-preparation",
    title: "Exam Preparation",
    description: "TOEIC Reading & Listening, IELTS.",
    color: "grape",
    emoji: "🎯",
    locked: false,
    lessons: [
      {
        id: "reading-part-5",
        title: "Incomplete Sentences",
        subtitle: "Vocabulary & Grammar in context",
        icon: "⏱️",
        type: "quiz",
        timeLimitSec: 900,
        quiz: [
          {
            question: "The new software will ________ our accounting processes.",
            choices: ["streamline", "streamlines", "streamlining", "streamlined"],
            answer: 0,
            explanation: "After 'will' we need the base form of the verb.",
          }
        ]
      }
    ],
  },
  {
    id: "fun-and-games",
    title: "Fun & Games",
    description: "Karaoke, Fill-in Songs, Crosswords.",
    color: "gold",
    emoji: "🎵",
    locked: true,
    lessons: [],
  }
];

import blogContent from "./blog_content.json";

// Dynamically generate a course from the parsed blog content
const blogArchiveCourse: Course = {
  id: "blog-archive",
  title: "Blog Archive",
  description: "Extracted legacy exercises from your blog.",
  color: "purple",
  emoji: "📦",
  lessons: blogContent
    .filter((article: any) => article.quiz || article.cloze || article.pairs || article.legacyCloze)
    .map((article: any) => ({
      id: article.id,
      title: article.title || "Unknown Title",
      subtitle: article.categories?.[0] || "Blog Post",
      icon: "📚",
      type: article.type as any,
      quiz: article.quiz,
      cloze: article.cloze,
      pairs: article.pairs,
      legacyCloze: article.legacyCloze
        ? {
            ...article.legacyCloze,
            youtubeUrl: article.youtubeUrl || article.legacyCloze.youtubeUrl,
            karaokeUrl: article.karaokeUrl || article.legacyCloze.karaokeUrl,
          }
        : undefined,
    })),
};

COURSES.push(blogArchiveCourse);

import { getCustomLessons } from "@/lib/custom_lessons";

export function getCourse(id: string) {
  const course = COURSES.find((c) => c.id === id);
  if (!course) return undefined;
  if (id === "blog-archive") {
    const custom = getCustomLessons();
    return {
      ...course,
      lessons: [...custom, ...course.lessons],
    };
  }
  return course;
}

export function getLesson(courseId: string, lessonId: string) {
  const custom = getCustomLessons().find((l) => l.id === lessonId);
  if (custom) return custom;
  return getCourse(courseId)?.lessons.find((l) => l.id === lessonId);
}
