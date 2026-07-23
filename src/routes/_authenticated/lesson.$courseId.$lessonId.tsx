import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getLesson, type Flashcard, type QuizQuestion, type MatchPair, type ClozeQuestion } from "@/data/courses";
import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { completeLesson } from "@/lib/gamification.functions";
import { X, ArrowRight, Volume2, Clock, Music, Play, Pause, CheckCircle, XCircle, FileText, Link as LinkIcon, Sparkles, Search, Copy, ExternalLink, Eye, EyeOff, Loader2, Mic, BookOpen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/lesson/$courseId/$lessonId")({
  head: ({ params }) => ({
    meta: [
      { title: `Lesson — Easy English` },
      { name: "description", content: `Lesson ${params.lessonId} in Easy English.` },
    ],
  }),
  component: LessonPage,
  notFoundComponent: () => <div className="p-8 text-center">Lesson not found.</div>,
});

type Stage = "flashcards" | "quiz" | "match" | "cloze" | "legacy-cloze" | "mix" | "crossword" | "done";

function LessonPage() {
  const { courseId, lessonId } = Route.useParams();
  const lesson = getLesson(courseId, lessonId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submit = useServerFn(completeLesson);

  const hasFlash = !!lesson?.flashcards?.length;
  const hasMatch = lesson?.type === "match";
  const hasCloze = lesson?.type === "cloze";
  const hasMix = lesson?.type === "mix";
  const hasCrossword = lesson?.type === "crossword";
  const hasLegacyCloze = lesson?.type === "legacy-cloze";
  const initialStage = hasMatch ? "match" : hasLegacyCloze ? "legacy-cloze" : hasCloze ? "cloze" : hasMix ? "mix" : hasCrossword ? "crossword" : hasFlash ? "flashcards" : "quiz";

  const [stage, setStage] = useState<Stage>(initialStage);
  const [flashIdx, setFlashIdx] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [clozeIdx, setClozeIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<{ gemsEarned: number; perfect: boolean } | null>(null);

  // Timer logic
  const [timeLeft, setTimeLeft] = useState<number | null>(lesson?.timeLimitSec ?? null);
  
  useEffect(() => {
    if (timeLeft === null || stage === "done") return;
    
    if (timeLeft <= 0) {
      // Auto submit when time is up
      toast.error("Time is up!");
      setStage("done");
      finish(score);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, stage]);

  if (!lesson) return <div className="p-8 text-center">Lesson not found.</div>;

  const flashcards: Flashcard[] = lesson.flashcards ?? [];
  const quiz: QuizQuestion[] = lesson.quiz ?? [];
  const pairs: MatchPair[] = lesson.pairs ?? [];
  const cloze: ClozeQuestion[] = lesson.cloze ?? [];
  const legacyCloze = lesson.legacyCloze;
  
  const totalItems = stage === "match" ? pairs.length : stage === "cloze" ? cloze.length : stage === "legacy-cloze" && legacyCloze ? legacyCloze.answers.length : quiz.length;

  const progress =
    stage === "flashcards"
      ? (flashIdx / Math.max(1, flashcards.length)) * 0.4
      : stage === "quiz"
        ? 0.4 + (quizIdx / Math.max(1, quiz.length)) * 0.6
        : stage === "cloze"
        ? (clozeIdx / Math.max(1, cloze.length)) * 1
        : stage === "legacy-cloze"
        ? 0.5 // Progress handled within LegacyClozeView or jumps to 1
        : stage === "match"
        ? 0.5 // Match progress is handled internally or jumps to 1
        : 1;

  async function finish(finalScore: number) {
    try {
      const res = await submit({ data: { courseId, lessonId, score: finalScore, total: totalItems } });
      setResult({ gemsEarned: res.gemsEarned, perfect: res.perfect });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save progress");
      setResult({ gemsEarned: 0, perfect: false });
    }
  }

  function next() {
    if (stage === "flashcards") {
      if (flashIdx + 1 < flashcards.length) setFlashIdx(flashIdx + 1);
      else setStage("quiz");
      return;
    }
    if (stage === "quiz") {
      const correct = selected === quiz[quizIdx].answer;
      const newScore = correct ? score + 1 : score;
      if (correct) setScore(newScore);
      if (quizIdx + 1 < quiz.length) {
        setQuizIdx(quizIdx + 1);
        setSelected(null);
        setRevealed(false);
      } else {
        setStage("done");
        finish(newScore);
      }
    }
    if (stage === "cloze") {
      if (clozeIdx + 1 < cloze.length) {
        setClozeIdx(clozeIdx + 1);
      } else {
        setStage("done");
        finish(score);
      }
    }
  }
  
  function onMatchFinish(finalScore: number) {
    setScore(finalScore);
    setStage("done");
    finish(finalScore);
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-2xl flex-col">
      {/* Top progress bar */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close lesson"
        >
          <X size={28} />
        </button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          />
        </div>
        {timeLeft !== null && (
          <div className={`flex items-center gap-1 font-bold ${timeLeft < 60 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>
            <Clock size={18} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
        <span className="text-sm font-bold text-muted-foreground">
          {stage === "quiz" ? `${quizIdx + 1}/${quiz.length}` : ""}
        </span>
      </div>

      {stage === "flashcards" && flashcards[flashIdx] && (
        <FlashcardView
          card={flashcards[flashIdx]}
          onSpeak={speak}
          onNext={next}
          index={flashIdx}
          total={flashcards.length}
        />
      )}

      {stage === "quiz" && quiz[quizIdx] && (
        <QuizView
          q={quiz[quizIdx]}
          selected={selected}
          revealed={revealed}
          onSelect={(i) => !revealed && setSelected(i)}
          onCheck={() => selected !== null && setRevealed(true)}
          onNext={next}
        />
      )}

      {stage === "match" && (
        <MatchView pairs={pairs} onFinish={onMatchFinish} />
      )}

      {stage === "cloze" && cloze[clozeIdx] && (
        <ClozeView
          q={cloze[clozeIdx]}
          onNext={(correct) => {
            if (correct) setScore(score + 1);
            next();
          }}
        />
      )}

      {stage === "legacy-cloze" && legacyCloze && (
        <LegacyClozeView
          data={legacyCloze}
          lessonTitle={lesson.title}
          onFinish={(finalScore) => {
            setScore(finalScore);
            setStage("done");
            finish(finalScore);
          }}
        />
      )}

      {stage === "mix" && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <h2 className="mb-4 text-2xl font-extrabold text-primary">Sentence Jumble</h2>
          <p className="text-muted-foreground">MixView is under construction...</p>
          <button onClick={() => onMatchFinish(10)} className="btn-chunky mt-8 bg-primary text-primary-foreground">Skip for now</button>
        </div>
      )}

      {stage === "crossword" && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <h2 className="mb-4 text-2xl font-extrabold text-primary">Crossword Puzzle</h2>
          <p className="text-muted-foreground">CrosswordView is under construction...</p>
          <button onClick={() => onMatchFinish(10)} className="btn-chunky mt-8 bg-primary text-primary-foreground">Skip for now</button>
        </div>
      )}

      {stage === "done" && (
        <CelebrationModal
          score={score}
          total={totalItems}
          result={result}
          onContinue={() => navigate({ to: "/dashboard" })}
        />
      )}
    </div>
  );
}

function FlashcardView({
  card,
  onSpeak,
  onNext,
  index,
  total,
}: {
  card: Flashcard;
  onSpeak: (t: string) => void;
  onNext: () => void;
  index: number;
  total: number;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="flex flex-1 flex-col">
      <p className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Flashcard {index + 1} of {total} · Tap to flip
      </p>
      <button
        onClick={() => setFlipped(!flipped)}
        className="glass-panel animate-pop mx-auto flex min-h-[280px] w-full max-w-md flex-col items-center justify-center gap-4 rounded-3xl p-8 text-center transition hover:-translate-y-0.5"
      >
        {!flipped ? (
          <>
            <h2 className="text-4xl font-extrabold text-primary">{card.term}</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSpeak(card.term);
              }}
              className="rounded-full border-2 border-border p-2 hover:bg-muted"
              aria-label="Pronounce"
            >
              <Volume2 size={18} />
            </button>
            <p className="text-xs text-muted-foreground">Tap to see meaning</p>
          </>
        ) : (
          <>
            <p className="text-lg font-bold">{card.definition}</p>
            <p className="italic text-muted-foreground">&ldquo;{card.example}&rdquo;</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSpeak(card.example);
              }}
              className="rounded-full border-2 border-border p-2 hover:bg-muted"
            >
              <Volume2 size={18} />
            </button>
          </>
        )}
      </button>
      <div className="mt-auto pt-6">
        <button
          onClick={() => {
            setFlipped(false);
            onNext();
          }}
          className="btn-chunky w-full bg-primary text-primary-foreground active:btn-chunky-active"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

function QuizView({
  q,
  selected,
  revealed,
  onSelect,
  onCheck,
  onNext,
}: {
  q: QuizQuestion;
  selected: number | null;
  revealed: boolean;
  onSelect: (i: number) => void;
  onCheck: () => void;
  onNext: () => void;
}) {
  const correct = selected === q.answer;
  return (
    <div className="flex flex-1 flex-col">
      <h2 className="mb-6 text-2xl font-extrabold md:text-3xl">{q.question}</h2>
      <div className="grid grid-cols-1 gap-3">
        {q.choices.map((c, i) => {
          const isSel = selected === i;
          const showCorrect = revealed && i === q.answer;
          const showWrong = revealed && isSel && i !== q.answer;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              disabled={revealed}
              className={`glass-panel rounded-2xl border-2 p-4 text-left font-bold transition ${
                showCorrect
                  ? "border-primary bg-primary/10 text-primary"
                  : showWrong
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : isSel
                      ? "border-primary bg-primary/20"
                      : "border-transparent bg-card/40 hover:bg-card/60"
              }`}
            >
              <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-current text-sm">
                {String.fromCharCode(65 + i)}
              </span>
              {c}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div
          className={`glass-panel animate-pop mt-6 rounded-2xl border-2 p-4 ${
            correct ? "border-primary bg-primary/10" : "border-destructive bg-destructive/10"
          }`}
        >
          <p className={`font-extrabold ${correct ? "text-primary" : "text-destructive"}`}>
            {correct ? "🎉 Correct!" : "❌ Not quite"}
          </p>
          <p className="mt-1 text-sm">{q.explanation}</p>
        </div>
      )}

      <div className="mt-auto pt-6">
        {!revealed ? (
          <button
            onClick={onCheck}
            disabled={selected === null}
            className="btn-chunky w-full bg-primary text-primary-foreground active:btn-chunky-active disabled:cursor-not-allowed disabled:opacity-40"
          >
            Check
          </button>
        ) : (
          <button
            onClick={onNext}
            className={`btn-chunky w-full text-primary-foreground active:btn-chunky-active ${
              correct ? "bg-primary" : "bg-destructive"
            }`}
            style={{ boxShadow: correct ? "0 4px 0 0 var(--primary-dark)" : "0 4px 0 0 oklch(0.5 0.24 25)" }}
          >
            Continue <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

function MatchView({ pairs, onFinish }: { pairs: MatchPair[]; onFinish: (score: number) => void }) {
  // Shuffle arrays to make it a game
  const [leftItems, setLeftItems] = useState<{id: number; text: string}[]>([]);
  const [rightItems, setRightItems] = useState<{id: number; text: string}[]>([]);
  
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);

  useEffect(() => {
    // Initialize and shuffle
    const lefts = pairs.map((p, i) => ({ id: i, text: p.left }));
    const rights = pairs.map((p, i) => ({ id: i, text: p.right }));
    
    // Simple shuffle
    const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);
    setLeftItems(shuffle(lefts));
    setRightItems(shuffle(rights));
  }, [pairs]);

  useEffect(() => {
    if (selectedLeft !== null && selectedRight !== null) {
      if (selectedLeft === selectedRight) {
        // Match!
        setMatchedPairs((prev) => [...prev, selectedLeft]);
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        // Mismatch!
        setErrors((prev) => prev + 1);
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 500);
      }
    }
  }, [selectedLeft, selectedRight]);

  useEffect(() => {
    if (matchedPairs.length === pairs.length && pairs.length > 0) {
      // Finished! Score is total pairs minus errors (minimum 0)
      const finalScore = Math.max(0, pairs.length - errors);
      setTimeout(() => onFinish(finalScore), 1000);
    }
  }, [matchedPairs, pairs.length, errors, onFinish]);

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="mb-6 text-2xl font-extrabold md:text-3xl">Tap the matching pairs</h2>
      <div className="grid grid-cols-2 gap-4 flex-1">
        <div className="flex flex-col gap-3">
          {leftItems.map((item) => {
            const isMatched = matchedPairs.includes(item.id);
            const isSelected = selectedLeft === item.id;
            const isError = selectedLeft !== null && selectedRight !== null && isSelected && selectedLeft !== selectedRight;
            
            if (isMatched) return <div key={`l-${item.id}`} className="h-14 opacity-0" />; // Empty space
            
            return (
              <button
                key={`l-${item.id}`}
                onClick={() => setSelectedLeft(item.id)}
                className={`rounded-2xl border-2 p-3 text-sm font-bold transition flex items-center justify-center min-h-[4rem] text-center ${
                  isError ? "border-destructive bg-destructive/10 text-destructive" :
                  isSelected ? "border-primary bg-primary/10 text-primary scale-105" :
                  "border-border bg-card hover:border-primary/50"
                }`}
              >
                {item.text}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          {rightItems.map((item) => {
            const isMatched = matchedPairs.includes(item.id);
            const isSelected = selectedRight === item.id;
            const isError = selectedLeft !== null && selectedRight !== null && isSelected && selectedLeft !== selectedRight;
            
            if (isMatched) return <div key={`r-${item.id}`} className="h-14 opacity-0" />; // Empty space
            
            return (
              <button
                key={`r-${item.id}`}
                onClick={() => setSelectedRight(item.id)}
                className={`rounded-2xl border-2 p-3 text-sm font-bold transition flex items-center justify-center min-h-[4rem] text-center ${
                  isError ? "border-destructive bg-destructive/10 text-destructive" :
                  isSelected ? "border-primary bg-primary/10 text-primary scale-105" :
                  "border-border bg-card hover:border-primary/50"
                }`}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CelebrationModal({
  score,
  total,
  result,
  onContinue,
}: {
  score: number;
  total: number;
  result: { gemsEarned: number; perfect: boolean } | null;
  onContinue: () => void;
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 100;
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center">
      <Confetti />
      <div className="glass-panel animate-pop w-full max-w-md rounded-3xl p-8 text-center shadow-2xl">
        <div className="text-7xl">{result?.perfect ? "🏆" : "🎉"}</div>
        <h2 className="mt-4 text-3xl font-extrabold text-primary">
          {result?.perfect ? "Perfect!" : "Lesson complete!"}
        </h2>
        <p className="mt-2 text-muted-foreground">
          You scored <span className="font-extrabold text-foreground">{score}/{total}</span> ({pct}%)
        </p>
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="rounded-2xl border-2 border-gem/40 bg-gem/10 px-5 py-3">
            <div className="text-2xl animate-gem">💎</div>
            <div className="mt-1 font-extrabold text-gem">+{result?.gemsEarned ?? 0}</div>
          </div>
          <div className="rounded-2xl border-2 border-gold/40 bg-gold/10 px-5 py-3">
            <div className="text-2xl">⭐</div>
            <div className="mt-1 font-extrabold text-gold">+{10 + score * 2} XP</div>
          </div>
        </div>
        <button
          onClick={onContinue}
          className="btn-chunky mt-8 w-full bg-primary text-primary-foreground active:btn-chunky-active"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 40 });
  const colors = ["#58cc02", "#1cb0f6", "#ffc800", "#ff4b4b", "#ce82ff"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const dur = 2 + Math.random() * 2;
        const color = colors[i % colors.length];
        return (
          <span
            key={i}
            className="absolute top-0 h-3 w-2 rounded-sm"
            style={{
              left: `${left}%`,
              backgroundColor: color,
              animation: `confetti-fall ${dur}s ${delay}s linear forwards`,
            }}
          />
        );
      })}
    </div>
  );
}

export function ClozeView({ q, onNext }: { q: ClozeQuestion; onNext: (correct: boolean) => void }) {
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  
  // Parse the text to find the {answer}
  const match = q.text.match(/\{([^}]+)\}/);
  const answer = match ? match[1] : "";
  const parts = q.text.split(/\{[^}]+\}/);

  const isCorrect = input.trim().toLowerCase() === answer.toLowerCase();

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="mb-6 text-2xl font-extrabold md:text-3xl">Fill in the blank</h2>
      
      <div className="glass-panel my-8 rounded-3xl p-8 text-center text-xl leading-loose shadow-xl">
        {parts[0]}
        <input
          type="text"
          value={input}
          onChange={(e) => !revealed && setInput(e.target.value)}
          disabled={revealed}
          className={`mx-2 inline-block w-40 rounded-xl border-b-4 border-l-2 border-r-2 border-t-2 bg-background/50 px-3 py-1 text-center font-extrabold outline-none transition-colors ${
            revealed
              ? isCorrect
                ? "border-primary text-primary"
                : "border-destructive text-destructive"
              : "border-border focus:border-primary"
          }`}
          placeholder="..."
          autoFocus
        />
        {parts[1]}
      </div>

      {revealed && (
        <div
          className={`glass-panel animate-pop mt-6 rounded-2xl border-2 p-4 ${
            isCorrect ? "border-primary bg-primary/10" : "border-destructive bg-destructive/10"
          }`}
        >
          <p className={`font-extrabold ${isCorrect ? "text-primary" : "text-destructive"}`}>
            {isCorrect ? "🎉 Correct!" : `❌ The answer is: ${answer}`}
          </p>
          {q.explanation && <p className="mt-1 text-sm">{q.explanation}</p>}
        </div>
      )}

      <div className="mt-auto pt-6">
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            disabled={!input.trim()}
            className="btn-chunky w-full bg-primary text-primary-foreground active:btn-chunky-active disabled:cursor-not-allowed disabled:opacity-40"
          >
            Check
          </button>
        ) : (
          <button
            onClick={() => {
              setRevealed(false);
              setInput("");
              onNext(isCorrect);
            }}
            className={`btn-chunky w-full text-primary-foreground active:btn-chunky-active ${
              isCorrect ? "bg-primary" : "bg-destructive"
            }`}
          >
            Continue <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

type AudioTrackResult = {
  trackId: number;
  trackName: string;
  artistName: string;
  previewUrl: string;
  artworkUrl100: string;
};

export function LegacyClozeView({
  data,
  lessonTitle,
  categoryType,
  onFinish,
}: {
  data: import("@/data/courses").LegacyClozeData;
  lessonTitle?: string;
  categoryType?: "grammar" | "vocab" | "toeic" | "ielts" | "news" | "song";
  onFinish: (score: number) => void;
}) {
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [hints, setHints] = useState<Record<number, number>>({});
  const [focusedGap, setFocusedGap] = useState<number | null>(null);
  const [showFullText, setShowFullText] = useState(false);
  const [showKaraokePlayer, setShowKaraokePlayer] = useState(false);
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [hideVideoScreen, setHideVideoScreen] = useState(true);
  const [activeMediaUrl, setActiveMediaUrl] = useState<string | null>(
    data.audioUrl || data.youtubeUrl || null
  );

  const [audioResults, setAudioResults] = useState<AudioTrackResult[]>([]);
  const [isSearchingAudio, setIsSearchingAudio] = useState(false);
  const [activeTrackInfo, setActiveTrackInfo] = useState<string | null>(null);

  const segments = useMemo(() => {
    return data.htmlText.split(/\{(\d+)\}/g);
  }, [data.htmlText]);

  // Dictionary Translation State (Anh-Anh / Anh-Việt)
  const [dictMode, setDictMode] = useState<"EN_EN" | "EN_VI" | "OFF">("EN_VI");
  const [lookupWord, setLookupWord] = useState("");
  const [lookupData, setLookupData] = useState<{ word: string; phonetics: string; en: string; vi: string } | null>(null);

  const handleLookupWord = async (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim().toLowerCase();
    
    // Play TTS pronunciation
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(term);
      utt.lang = "en-US";
      window.speechSynthesis.speak(utt);
    }

    try {
      setLookupData({
        word: term,
        phonetics: "/.../",
        en: "Đang dùng Gemini tra từ điển...",
        vi: ""
      });

      const { lookupWordInDictionary } = await import("@/lib/gemini");
      const result = await lookupWordInDictionary(term, data.htmlText.substring(0, 500));
      setLookupData(result);
    } catch (e) {
      // Sample built-in dictionary map for quick fallback
      const dictMap: Record<string, { phonetics: string; en: string; vi: string }> = {
        mitigating: { phonetics: "/ˈmɪt.ɪ.ɡeɪ.tɪŋ/", en: "Making less severe or harmful", vi: "Giảm nhẹ, xoa dịu hậu quả" },
        anthropogenic: { phonetics: "/ˌæn.θrə.pəˈdʒen.ɪk/", en: "Caused or produced by human activity", vi: "Do hoạt động của con người gây ra" },
        prerequisites: { phonetics: "/ˌpriːˈrek.wɪ.zɪts/", en: "Things that are required prior to something else", vi: "Các điều kiện tiên quyết bắt buộc" },
        procurement: { phonetics: "/prəˈkjʊə.mənt/", en: "The process of obtaining goods or services", vi: "Sự thu mua, cung ứng vật tư" },
        authorization: { phonetics: "/ˌɔː.θər.aɪˈzeɪ.ʃən/", en: "Official permission or power to do something", vi: "Sự phê duyệt, ủy quyền hợp pháp" },
        compliance: { phonetics: "/kəmˈplaɪ.əns/", en: "The action of obeying an order, rule, or request", vi: "Sự tuân thủ đúng quy định" },
        breakthrough: { phonetics: "/ˈbreɪk.θruː/", en: "A sudden, dramatic, and important discovery", vi: "Bước tiến nhảy vọt, đột phá lớn" },
        "pave the way for": { phonetics: "/peɪv ðə weɪ fɔːr/", en: "Create conditions that make it easier for something to happen", vi: "Mở đường cho, tạo tiền đề thuận lợi" },
        crucial: { phonetics: "/ˈkruː.ʃəl/", en: "Extremely important or necessary", vi: "Cực kỳ quan trọng, quyết định" },
      };

      const found = dictMap[clean];
      if (found) {
        setLookupData({ word: term, ...found });
      } else {
        setLookupData({
          word: term,
          phonetics: `/${clean}/`,
          en: `API Error / Academic term: "${term}"`,
          vi: `Lỗi kết nối từ điển AI. Từ vựng chuyên ngành: "${term}"`,
        });
      }
    }
  };


  // Auto detect YouTube or mp3 links inside htmlText if not provided in props
  useEffect(() => {
    if (!activeMediaUrl && data.htmlText) {
      const ytMatch = data.htmlText.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s"<']+/i);
      const audioMatch = data.htmlText.match(/https?:\/\/[^\s"<']+\.(mp3|wav|ogg)/i);
      if (ytMatch) setActiveMediaUrl(ytMatch[0]);
      else if (audioMatch) setActiveMediaUrl(audioMatch[0]);
    }
  }, [data.htmlText, activeMediaUrl]);

  const fetchAudioSearchResults = async (query: string) => {
    if (!query.trim()) return;
    setIsSearchingAudio(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=5`);
      const resData = await res.json();
      if (resData.results && Array.isArray(resData.results)) {
        setAudioResults(resData.results);
      }
    } catch (e) {
      console.error("Audio search error:", e);
    } finally {
      setIsSearchingAudio(false);
    }
  };

  // Automatically pre-fetch song results when modal opens if lessonTitle is available
  useEffect(() => {
    if (showMediaInput && audioResults.length === 0 && lessonTitle) {
      fetchAudioSearchResults(lessonTitle);
    }
  }, [showMediaInput, lessonTitle, audioResults.length]);

  const totalGaps = data.answers.length;

  const calculateScore = () => {
    let score = 0;
    for (let i = 0; i < totalGaps; i++) {
      if ((inputs[i] || "").trim().toLowerCase() === (data.answers[i] || "").trim().toLowerCase()) {
        score++;
      }
    }
    return score;
  };

  const currentScore = calculateScore();
  const scorePercent = Math.round((currentScore / Math.max(1, totalGaps)) * 100);

  const handleCheck = () => {
    setChecked(true);
    setShowFullText(true);
  };

  const handleTTSClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const button = target.closest('button[data-tts]');
    if (button) {
      const word = button.getAttribute('data-tts');
      if (word && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(word);
        u.lang = 'en-US';
        u.rate = 0.85;
        window.speechSynthesis.speak(u);
      }
    }
  };

  const handleContinue = () => {
    onFinish(currentScore);
  };

  const handleHint = () => {
    if (focusedGap === null) return;
    const answer = data.answers[focusedGap];
    if (!answer) return;

    setHints((prev) => {
      const currentHintLen = prev[focusedGap] || 0;
      if (currentHintLen < answer.length) {
        const newHintLen = currentHintLen + 1;
        setInputs((prevInputs) => ({
          ...prevInputs,
          [focusedGap]: answer.substring(0, newHintLen),
        }));
        return { ...prev, [focusedGap]: newHintLen };
      }
      return prev;
    });
  };

  const handleCopySongTitle = () => {
    if (!lessonTitle) return;
    navigator.clipboard.writeText(lessonTitle);
    toast.success(`Copied "${lessonTitle}" to clipboard!`);
  };

  const handleOpenYouTubeSearch = (customQuery?: string) => {
    const query = customQuery || (lessonTitle ? `${lessonTitle} official audio` : "English song official audio");
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
  };

  const handleAddMedia = () => {
    const val = mediaUrlInput.trim();
    if (!val) return;

    if (val.startsWith("http://") || val.startsWith("https://")) {
      setActiveMediaUrl(val);
      setActiveTrackInfo(null);
      setShowMediaInput(false);
      toast.success("Media link attached!");
    } else {
      // Perform in-app audio search first
      fetchAudioSearchResults(val);
    }
  };

  const handleSpeakFullText = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported in this browser.");
      return;
    }
    const segs = data.htmlText.split(/\{(\d+)\}/);
    let fullPlainText = "";
    segs.forEach((seg, idx) => {
      if (idx % 2 === 0) {
        const doc = new DOMParser().parseFromString(seg, "text/html");
        fullPlainText += doc.body.textContent || "";
      } else {
        const gapId = parseInt(seg, 10);
        fullPlainText += " " + (data.answers[gapId] || "") + " ";
      }
    });

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullPlainText);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    toast.success("Playing audio narration...");
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1`
      : null;
  };

  const detectedCategory = categoryType || (() => {
    const text = (lessonTitle || "") + " " + (data.htmlText || "");
    if (/ngữ\s*pháp|văn\s*phạm|grammar|công\s*thức|conditional/i.test(text)) return "grammar";
    if (/từ\s*vựng|vocab|furniture|collocation/i.test(text)) return "vocab";
    if (/toeic|memorandum/i.test(text)) return "toeic";
    if (/ielts|academic\s*reading/i.test(text)) return "ielts";
    if (/tin\s*nóng|tin\s*tức|news|reuters|bbc|cnn|trích\s*dẫn/i.test(text)) return "news";
    return "song";
  })();


  return (
    <div className="flex flex-1 flex-col space-y-6">
      {/* Category-Specific Top Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-extrabold md:text-3xl">
            {detectedCategory === "grammar" && <>📘 Grammar &amp; Structure Practice</>}
            {detectedCategory === "vocab" && <>🔤 Vocabulary &amp; Collocations Practice</>}
            {detectedCategory === "toeic" && <>🎯 TOEIC Business Reading &amp; Cloze</>}
            {detectedCategory === "ielts" && <>🎓 IELTS Academic Reading Passage</>}
            {detectedCategory === "news" && <>📰 News Listening &amp; Reading (Tin Tức Thời Sự)</>}
            {detectedCategory === "song" && <><Music className="text-primary" size={28} /> Fill in the Blanks / Song Lyrics</>}
          </h2>
          <p className="text-sm text-muted-foreground">
            {detectedCategory === "grammar" && "Study the grammar formulas, review examples, and complete the practice exercises below!"}
            {detectedCategory === "vocab" && "Learn word meanings, IPA phonetics, audio pronunciation 🔊, and fill in the blanks!"}
            {detectedCategory === "toeic" && "Read official business memos & complete Part 5 & Part 6 practice questions!"}
            {detectedCategory === "ielts" && "Read full academic passages (Band 7.0-9.0) with interactive bilingual dictionary tooltips!"}
            {detectedCategory === "news" && "Listen aloud to current affairs news with source attribution & practice listening comprehension!"}
            {detectedCategory === "song" && "Listen to the audio, type missing lyrics, and check your score!"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {detectedCategory === "song" && (
            <button
              onClick={() => setShowMediaInput(!showMediaInput)}
              className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 text-primary px-3 py-2 text-sm font-extrabold shadow-sm transition hover:bg-primary/20"
              title="Search MP3 audio or attach video link"
            >
              <LinkIcon size={16} /> {activeMediaUrl ? "Change Song / Audio" : "🎧 Search & Stream MP3"}
            </button>
          )}

          {detectedCategory === "news" && (
            <>
              <button
                onClick={() => {
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                    const plain = data.htmlText.replace(/<[^>]+>/g, " ").replace(/\{[^}]+\}/g, "...");
                    const utt = new SpeechSynthesisUtterance(plain);
                    utt.lang = "en-US";
                    utt.rate = 0.9;
                    window.speechSynthesis.speak(utt);
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300 px-3 py-2 text-sm font-extrabold shadow-sm transition hover:bg-rose-500/20 shadow-md"
                title="Listen to news article read aloud by AI native voice"
              >
                <Volume2 size={16} /> 🔊 Listen News Aloud
              </button>

              <button
                onClick={() => setShowMediaInput(!showMediaInput)}
                className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 text-primary px-3 py-2 text-sm font-extrabold shadow-sm transition hover:bg-primary/20"
                title="Search news audio or podcast link"
              >
                <LinkIcon size={16} /> 🎧 Search News Audio
              </button>
            </>
          )}

          <button
            onClick={handleHint}
            disabled={focusedGap === null || checked}
            className="btn-chunky bg-secondary text-secondary-foreground active:btn-chunky-active disabled:cursor-not-allowed disabled:opacity-40"
          >
            💡 Hint
          </button>
        </div>
      </div>

      {/* Interactive Bilingual Dictionary Control Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-primary/30 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-primary/10 via-background to-secondary/10 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase text-primary flex items-center gap-1">
            <BookOpen size={16} /> Từ Điển Tương Tác:
          </span>
          <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border">
            <button
              onClick={() => setDictMode("EN_VI")}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition ${
                dictMode === "EN_VI" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              🇻🇳 Anh - Việt
            </button>
            <button
              onClick={() => setDictMode("EN_EN")}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition ${
                dictMode === "EN_EN" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              🇬🇧 Anh - Anh
            </button>
            <button
              onClick={() => setDictMode("OFF")}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition ${
                dictMode === "OFF" ? "bg-destructive/20 text-destructive shadow-sm" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              🔇 Tắt Dịch
            </button>
          </div>
        </div>

        {/* Quick Search Lookup Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tra nhanh từ / cụm từ khó..."
            value={lookupWord}
            onChange={(e) => setLookupWord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLookupWord(lookupWord);
            }}
            className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-bold outline-none focus:border-primary w-48 shadow-inner"
          />
          <button
            onClick={() => handleLookupWord(lookupWord)}
            className="btn-chunky bg-primary text-primary-foreground text-xs px-3 py-1.5 font-extrabold flex items-center gap-1"
          >
            <Search size={14} /> Tra Từ
          </button>
        </div>
      </div>

      {/* Dictionary Card Drawer when a word is looked up */}
      {lookupData && dictMode !== "OFF" && (
        <div className="glass-panel p-4 rounded-2xl border-2 border-primary/50 bg-primary/10 shadow-lg space-y-2 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-black text-primary capitalize">{lookupData.word}</h4>
              <span className="text-xs font-bold text-muted-foreground">{lookupData.phonetics}</span>
              <button
                onClick={() => {
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                    const utt = new SpeechSynthesisUtterance(lookupData.word);
                    utt.lang = "en-US";
                    window.speechSynthesis.speak(utt);
                  }
                }}
                className="p-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition text-xs"
                title="Nghe phát âm"
              >
                🔊 Audio
              </button>
            </div>
            <button
              onClick={() => setLookupData(null)}
              className="text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              ✕ Đóng
            </button>
          </div>

          <div className="text-xs font-semibold leading-relaxed">
            {dictMode === "EN_VI" ? (
              <p><b>🇻🇳 Nghĩa Anh-Việt:</b> {lookupData.vi}</p>
            ) : (
              <p><b>🇬🇧 EN-EN Definition:</b> {lookupData.en}</p>
            )}
          </div>
        </div>
      )}

      {/* Category Banner Card */}
      {lessonTitle && (
        <div className="glass-panel p-4 rounded-2xl border border-primary/20 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-primary/5 via-background to-secondary/5 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-xl">
              {detectedCategory === "grammar" && "📘"}
              {detectedCategory === "vocab" && "🔤"}
              {detectedCategory === "toeic" && "🎯"}
              {detectedCategory === "ielts" && "🎓"}
              {detectedCategory === "news" && "📰"}
              {detectedCategory === "song" && "🎵"}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {detectedCategory === "grammar" && "Grammar Topic"}
                {detectedCategory === "vocab" && "Vocabulary Subject"}
                {detectedCategory === "toeic" && "TOEIC Business Material"}
                {detectedCategory === "ielts" && "IELTS Academic Material"}
                {detectedCategory === "news" && "Current Affairs News Article"}
                {detectedCategory === "song" && "Song / Lesson Title"}
              </span>
              <h3 className="text-base font-extrabold text-foreground">{lessonTitle}</h3>
            </div>
          </div>

          {detectedCategory === "song" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowMediaInput(true);
                  fetchAudioSearchResults(lessonTitle);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-extrabold shadow-sm hover:opacity-90 transition"
                title="Search and play MP3 audio directly in app"
              >
                <Play size={14} /> Stream MP3 Directly
              </button>

              <button
                onClick={handleCopySongTitle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-extrabold shadow-sm hover:bg-muted transition"
                title="Copy song name to clipboard"
              >
                <Copy size={14} /> Copy Title
              </button>
            </div>
          )}
        </div>
      )}

      {/* Optional Media URL Paste & In-App Audio Search Dialog (Song + News only) */}
      {showMediaInput && (detectedCategory === "song" || detectedCategory === "news") && (
        <div className="glass-panel p-5 rounded-3xl border-2 border-primary/40 space-y-4 bg-background/95 animate-in fade-in zoom-in duration-200 shadow-xl">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h4 className="font-extrabold text-sm flex items-center gap-2 text-primary">
              <Search size={16} /> {detectedCategory === "news" ? "🎙️ Search News Podcast / Audio Article" : "Direct In-App Audio Search (Mobile Friendly)"}
            </h4>
            <button onClick={() => setShowMediaInput(false)} className="text-xs text-muted-foreground font-bold hover:text-foreground">✕ Close</button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder={detectedCategory === "news" ? "Search news podcast or topic (e.g. BBC Global News, CNN Daily)..." : "Type Song Name (e.g. A Whole New World, Perfect)..."}
              value={mediaUrlInput}
              onChange={(e) => setMediaUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddMedia()}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background font-medium outline-none focus:border-primary text-sm shadow-inner"
            />
            <button
              onClick={handleAddMedia}
              className="btn-chunky bg-primary text-primary-foreground px-4 py-2 text-sm flex items-center gap-1.5"
            >
              {isSearchingAudio ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {detectedCategory === "news" ? "Search Podcast" : "Search MP3"}
            </button>
          </div>

          {/* In-App Direct Audio Search Results List */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>{detectedCategory === "news" ? "🎙️ Podcast / Audio Article Streams (Luyện Nghe Tin Tức)" : "🎧 Direct In-App Audio Streams (No App Switching!)"}</span>
              {isSearchingAudio && <span className="flex items-center gap-1 text-primary"><Loader2 size={12} className="animate-spin" /> Searching...</span>}
            </div>

            {audioResults.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {audioResults.map((track) => (
                  <div
                    key={track.trackId}
                    className="flex items-center justify-between p-2.5 rounded-2xl border border-border/80 bg-background/80 hover:border-primary/50 transition shadow-sm gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={track.artworkUrl100} alt={track.trackName} className="h-10 w-10 rounded-xl object-cover shadow-sm shrink-0" />
                      <div className="min-w-0">
                        <h5 className="font-extrabold text-xs text-foreground truncate">{track.trackName}</h5>
                        <p className="text-[11px] text-muted-foreground truncate">{track.artistName}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveMediaUrl(track.previewUrl);
                        setActiveTrackInfo(`${track.trackName} — ${track.artistName}`);
                        setShowMediaInput(false);
                        toast.success(`🎵 Playing audio: ${track.trackName}`);
                      }}
                      className="btn-chunky bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-1.5 flex items-center gap-1 shrink-0 font-extrabold"
                    >
                      <Play size={12} /> Stream Audio Directly
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              !isSearchingAudio && (
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground text-center">
                  Type any song name above to search & stream high quality audio directly inside the app.
                </div>
              )
            )}
          </div>

          {/* Fallback YouTube Search & External Link Options */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs">
            <span className="text-muted-foreground font-bold">External Options:</span>
            {lessonTitle && (
              <button
                onClick={() => handleOpenYouTubeSearch(`${lessonTitle} official audio`)}
                className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-bold hover:bg-red-500/20 transition flex items-center gap-1"
              >
                <Search size={12} /> Open YouTube Audio Search
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Audio/Video Player Bar — Song & News only */}
      {activeMediaUrl && (detectedCategory === "song" || detectedCategory === "news") && (
        <div className="glass-panel p-4 rounded-3xl border border-primary/20 shadow-lg overflow-hidden relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5 truncate">
              {detectedCategory === "news" ? <Volume2 size={16} /> : <Music size={16} />}{" "}
              {activeTrackInfo ? `Playing: ${activeTrackInfo}` : (detectedCategory === "news" ? "📰 News Audio Player" : "Song Player / Audio Reference")}
            </span>

            <div className="flex items-center gap-2">
              {getYouTubeEmbedUrl(activeMediaUrl) && (
                <button
                  onClick={() => setHideVideoScreen(!hideVideoScreen)}
                  className={`flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg border transition ${
                    hideVideoScreen
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                      : "bg-muted text-foreground border-border"
                  }`}
                  title="Toggle video cover screen so lyrics aren't spoiled"
                >
                  {hideVideoScreen ? <EyeOff size={14} /> : <Eye size={14} />}
                  {hideVideoScreen ? "🙈 Hide Video (Audio-Only Mode)" : "👁️ Show Video"}
                </button>
              )}

              <button
                onClick={() => setActiveMediaUrl(null)}
                className="text-xs text-muted-foreground hover:text-destructive transition font-bold"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {getYouTubeEmbedUrl(activeMediaUrl) ? (
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-inner border border-white/10 relative bg-black">
              {/* Overlay Screen Cover in Audio-Only Listening Mode */}
              {hideVideoScreen && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md p-6 text-center animate-in fade-in duration-200">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-3 animate-pulse">
                    <Music size={32} />
                  </div>
                  <h4 className="text-lg font-extrabold text-foreground">🙈 Audio-Only Mode Active</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Video screen is covered so lyrics won't spoil your listening practice!
                  </p>
                  <button
                    onClick={() => setHideVideoScreen(false)}
                    className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-extrabold hover:bg-muted transition"
                  >
                    <Eye size={14} /> Reveal Video Screen
                  </button>
                </div>
              )}

              <iframe
                src={getYouTubeEmbedUrl(activeMediaUrl)!}
                title="Song Video Player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="bg-background/60 p-3 rounded-2xl border border-border">
              <audio controls src={activeMediaUrl} className="w-full h-10 outline-none" />
            </div>
          )}
        </div>
      )}

      {/* Main Exercise Box */}
      <div 
        onClick={handleTTSClick}
        className="glass-panel relative flex-1 overflow-y-auto rounded-3xl p-6 text-lg leading-loose shadow-xl border border-white/10"
      >
        {segments.map((segment, idx) => {
          if (idx % 2 === 0) {
            return (
              <span key={idx} dangerouslySetInnerHTML={{ __html: segment }} className="inline" />
            );
          } else {
            const gapId = parseInt(segment, 10);
            const answer = data.answers[gapId] || "";
            const userVal = inputs[gapId] || "";
            const isCorrect = userVal.trim().toLowerCase() === answer.trim().toLowerCase();

            return (
              <span key={idx} className="inline-flex items-center align-middle gap-1 mx-1">
                <input
                  type="text"
                  value={userVal}
                  onChange={(e) => {
                    if (!checked) {
                      setInputs({ ...inputs, [gapId]: e.target.value });
                    }
                  }}
                  onFocus={() => setFocusedGap(gapId)}
                  onBlur={() => {
                    setTimeout(() => {
                      setFocusedGap((prev) => (prev === gapId ? null : prev));
                    }, 200);
                  }}
                  disabled={checked && isCorrect}
                  className={`inline-block w-36 rounded-xl border-b-4 border-l-2 border-r-2 border-t-2 bg-background/70 px-2 py-1 text-center font-extrabold outline-none transition-all ${
                    checked
                      ? isCorrect
                        ? "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                        : "border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/40"
                      : focusedGap === gapId
                        ? "border-primary ring-2 ring-primary/20 scale-105"
                        : "border-border hover:border-primary/50"
                  }`}
                  placeholder="..."
                />

                {/* Inline Error Correction Badge when checked */}
                {checked && !isCorrect && (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-rose-100 dark:bg-rose-950 px-2 py-0.5 text-xs font-bold text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-in fade-in">
                    <XCircle size={14} className="text-rose-500" />
                    <span className="line-through opacity-70">{userVal || "___"}</span>
                    <span>➔</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold underline">{answer}</span>
                  </span>
                )}
                
                {checked && isCorrect && (
                  <span className="text-emerald-500 font-extrabold text-sm flex items-center">
                    <CheckCircle size={18} />
                  </span>
                )}
              </span>
            );
          }
        })}
      </div>

      {/* Score & Full Lyrics Section when checked */}
      {checked && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Score Banner */}
          <div className="glass-panel p-6 rounded-3xl border-2 border-primary/30 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-background to-secondary/10 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-primary-foreground shadow-md">
                {scorePercent}%
              </div>
              <div>
                <h3 className="text-xl font-extrabold">
                  {scorePercent >= 80 ? "🎉 Fantastic job!" : scorePercent >= 50 ? "👍 Good effort!" : "💪 Keep practicing!"}
                </h3>
                <p className="text-sm font-semibold text-muted-foreground">
                  You scored <span className="text-foreground font-black">{currentScore}</span> out of <span className="text-foreground font-black">{totalGaps}</span> correct words.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFullText(!showFullText)}
              className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-extrabold text-secondary-foreground shadow-sm transition hover:scale-105"
            >
              <FileText size={18} /> {showFullText
                ? (detectedCategory === "song" ? "Hide Full Lyrics" : "Hide Full Text")
                : (detectedCategory === "grammar" ? "📜 Show Full Answer Key & Explanations"
                  : detectedCategory === "vocab" ? "📖 Show Full Vocabulary List & Answers"
                  : detectedCategory === "toeic" ? "📋 Show Full TOEIC Reading Answers"
                  : detectedCategory === "ielts" ? "🎓 Show Full IELTS Passage Answers"
                  : detectedCategory === "news" ? "📰 Show Full Article & Answers"
                  : "📜 Show Full Correct Lyrics")}
            </button>
          </div>

          {/* Full Correct Lyrics / Full Text Card */}
          {showFullText && (
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 shadow-2xl space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between border-b border-emerald-500/20 pb-4 gap-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xl">
                  <Sparkles size={24} />
                  {detectedCategory === "grammar" ? "✅ Grammar Answer Key & Formula Review"
                    : detectedCategory === "vocab" ? "📖 Vocabulary Reference & Answer Key"
                    : detectedCategory === "toeic" ? "🎯 TOEIC Answer Key & Passage Review"
                    : detectedCategory === "ielts" ? "🎓 IELTS Answer Key & Academic Text"
                    : detectedCategory === "news" ? "📰 Full News Article & Answer Key"
                    : "Full Correct Song Lyrics"}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSpeakFullText}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 transition"
                  >
                    <Volume2 size={16} /> Listen Aloud
                  </button>
                </div>
              </div>

              <div onClick={handleTTSClick} className="text-lg leading-relaxed space-y-2 font-medium">
                {segments.map((segment, idx) => {
                  if (idx % 2 === 0) {
                    return (
                      <span
                        key={idx}
                        dangerouslySetInnerHTML={{ __html: segment }}
                        className="inline"
                      />
                    );
                  } else {
                    const gapId = parseInt(segment, 10);
                    const answer = data.answers[gapId] || "";
                    return (
                      <span
                        key={idx}
                        className="mx-1 inline-block font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-lg border border-emerald-500/30 shadow-sm"
                      >
                        {answer}
                      </span>
                    );
                  }
                })}
              </div>

              {/* 🎤 Karaoke Sing-Along Section — Song Only */}
              {detectedCategory === "song" && (
              <div className="pt-4 border-t border-emerald-500/20">
                <div className="glass-panel p-5 rounded-3xl border-2 border-pink-500/30 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-primary/10 shadow-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-extrabold text-pink-600 dark:text-pink-400 text-lg">
                      <Mic size={22} className="animate-bounce" /> 🎤 Sing-Along / Karaoke Time!
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowKaraokePlayer(!showKaraokePlayer)}
                        className="px-3.5 py-1.5 rounded-xl bg-pink-600 text-white font-extrabold text-xs hover:bg-pink-700 transition shadow-md flex items-center gap-1"
                      >
                        <Play size={14} /> {showKaraokePlayer ? "Hide Karaoke" : "🎤 Play Karaoke Video"}
                      </button>
                      <button
                        onClick={() => {
                          const query = `${lessonTitle || "English Song"} karaoke with lyrics`;
                          window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
                        }}
                        className="px-3 py-1.5 rounded-xl border border-pink-500/30 bg-background text-xs font-bold hover:bg-muted transition flex items-center gap-1"
                      >
                        <Search size={12} /> Search YouTube Karaoke <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>

                  {showKaraokePlayer && (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-pink-500/30 shadow-2xl animate-in fade-in zoom-in duration-200 mt-2">
                      <iframe
                        src={
                          data.karaokeUrl && getYouTubeEmbedUrl(data.karaokeUrl)
                            ? getYouTubeEmbedUrl(data.karaokeUrl)!
                            : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent((lessonTitle || "") + " karaoke lyrics")}`
                        }
                        title="Karaoke Video"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-auto pt-4">
        {!checked ? (
          <button
            onClick={handleCheck}
            className="btn-chunky w-full bg-primary text-primary-foreground active:btn-chunky-active text-lg py-3"
          >
            Check Answers & Score
          </button>
        ) : (
          <button
            onClick={handleContinue}
            className="btn-chunky w-full bg-primary text-primary-foreground active:btn-chunky-active text-lg py-3 flex items-center justify-center gap-2"
          >
            Finish Lesson <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
