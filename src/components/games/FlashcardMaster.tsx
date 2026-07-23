import { useState, useEffect } from "react";
import { getRandomVocab, GameVocab } from "@/data/games_vocab";
import { Volume2, Check, RotateCcw } from "lucide-react";

type Props = {
  onComplete: () => void;
};

export default function FlashcardMaster({ onComplete }: Props) {
  const [deck, setDeck] = useState<GameVocab[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    setDeck(getRandomVocab(10));
  }, []);

  const currentCard = deck[currentIndex];

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard) return;
    const utterance = new SpeechSynthesisUtterance(currentCard.english);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  const handleNext = (isKnown: boolean) => {
    setDirection(isKnown ? "right" : "left");
    setTimeout(() => {
      setDirection(null);
      setIsFlipped(false);
      if (currentIndex + 1 < deck.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onComplete();
      }
    }, 300); // Wait for swipe animation
  };

  if (!currentCard) return null;

  const progress = ((currentIndex) / deck.length) * 100;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="w-full space-y-2">
        <div className="flex justify-between text-xs font-bold text-muted-foreground">
          <span>Card {currentIndex + 1} of {deck.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="relative w-full aspect-[3/4] perspective-1000">
        <div
          className={`w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${
            isFlipped ? "rotate-y-180" : ""
          } ${
            direction === "left" ? "-translate-x-full opacity-0 rotate-z-[-10deg]" : 
            direction === "right" ? "translate-x-full opacity-0 rotate-z-[10deg]" : ""
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div className="absolute w-full h-full bg-card border-2 border-border/50 rounded-3xl shadow-lg backface-hidden flex flex-col items-center justify-center p-8 text-center hover:shadow-xl transition-shadow">
            <span className="text-6xl mb-6">{currentCard.emoji}</span>
            <h2 className="text-4xl font-extrabold text-foreground mb-4">{currentCard.english}</h2>
            <button
              onClick={playAudio}
              className="p-4 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
            >
              <Volume2 size={28} />
            </button>
            <p className="absolute bottom-6 text-sm text-muted-foreground animate-pulse">Tap to flip</p>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full bg-primary text-primary-foreground rounded-3xl shadow-lg backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-3xl font-extrabold mb-2">{currentCard.vietnamese}</h2>
            <div className="w-16 h-1 bg-white/30 rounded-full mb-6"></div>
            <p className="text-lg italic opacity-90">"{currentCard.example}"</p>
          </div>
        </div>
      </div>

      <div className="flex w-full justify-between gap-4 mt-8">
        <button
          onClick={() => handleNext(false)}
          className="flex-1 py-4 bg-card border-2 border-border rounded-xl text-foreground font-bold hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all flex items-center justify-center gap-2 group"
        >
          <RotateCcw size={20} className="group-hover:-rotate-45 transition-transform" />
          Review Later
        </button>
        <button
          onClick={() => handleNext(true)}
          className="flex-1 py-4 bg-emerald-500 text-white rounded-xl font-bold shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
        >
          <Check size={20} className="group-hover:scale-125 transition-transform" />
          Know
        </button>
      </div>
    </div>
  );
}
