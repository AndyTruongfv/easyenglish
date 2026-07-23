import { useState, useEffect } from "react";
import { getRandomVocab, GameVocab } from "@/data/games_vocab";

type Props = {
  onComplete: () => void;
};

type CardItem = {
  id: string;
  vocabId: string;
  text: string;
  type: "english" | "vietnamese";
  matched: boolean;
};

export default function WordMatching({ onComplete }: Props) {
  const [leftCards, setLeftCards] = useState<CardItem[]>([]);
  const [rightCards, setRightCards] = useState<CardItem[]>([]);
  
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [errorPair, setErrorPair] = useState<{left: string, right: string} | null>(null);
  
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const vocab = getRandomVocab(5); // 5 pairs
    const left: CardItem[] = vocab.map(v => ({ id: `l-${v.id}`, vocabId: v.id, text: v.english, type: "english", matched: false }));
    const right: CardItem[] = vocab.map(v => ({ id: `r-${v.id}`, vocabId: v.id, text: v.vietnamese, type: "vietnamese", matched: false }));
    
    setLeftCards(left.sort(() => Math.random() - 0.5));
    setRightCards(right.sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsGameOver(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      const leftCard = leftCards.find(c => c.id === selectedLeft);
      const rightCard = rightCards.find(c => c.id === selectedRight);
      
      if (leftCard?.vocabId === rightCard?.vocabId) {
        // Match!
        setTimeout(() => {
          setLeftCards(prev => prev.map(c => c.id === selectedLeft ? { ...c, matched: true } : c));
          setRightCards(prev => prev.map(c => c.id === selectedRight ? { ...c, matched: true } : c));
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 300);
      } else {
        // Mismatch
        setErrorPair({ left: selectedLeft, right: selectedRight });
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setErrorPair(null);
        }, 800);
      }
    }
  }, [selectedLeft, selectedRight, leftCards, rightCards]);

  useEffect(() => {
    if (leftCards.length > 0 && leftCards.every(c => c.matched)) {
      setTimeout(onComplete, 500);
    }
  }, [leftCards, onComplete]);

  const handleCardClick = (card: CardItem) => {
    if (card.matched || isGameOver) return;
    if (card.type === "english") {
      setSelectedLeft(card.id === selectedLeft ? null : card.id);
    } else {
      setSelectedRight(card.id === selectedRight ? null : card.id);
    }
  };

  const getCardStyle = (card: CardItem) => {
    if (card.matched) return "bg-emerald-500/20 border-emerald-500/50 text-emerald-600 scale-95 opacity-50 cursor-default";
    
    const isSelected = selectedLeft === card.id || selectedRight === card.id;
    const isError = errorPair?.left === card.id || errorPair?.right === card.id;
    
    if (isError) return "bg-destructive/20 border-destructive text-destructive animate-[shake_0.5s_ease-in-out]";
    if (isSelected) return "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-105 border-primary";
    
    return "bg-card border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer hover:-translate-y-1";
  };

  if (isGameOver) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-destructive">Time's Up!</h2>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-white rounded-lg">Try Again</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border">
        <h2 className="text-xl font-bold text-foreground">Match the Pairs</h2>
        <div className={`text-xl font-extrabold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-amber-500'}`}>
          00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-8">
        <div className="flex flex-col gap-4">
          {leftCards.map(card => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`p-4 rounded-xl border-2 text-center font-bold transition-all duration-300 ${getCardStyle(card)}`}
            >
              {card.text}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {rightCards.map(card => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`p-4 rounded-xl border-2 text-center font-bold transition-all duration-300 ${getCardStyle(card)}`}
            >
              {card.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
