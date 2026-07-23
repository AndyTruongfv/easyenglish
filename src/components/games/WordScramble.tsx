import { useState, useEffect } from "react";
import { getRandomVocab, GameVocab } from "@/data/games_vocab";

type Props = {
  onComplete: () => void;
};

export default function WordScramble({ onComplete }: Props) {
  const [vocab, setVocab] = useState<GameVocab | null>(null);
  const [jumbledLetters, setJumbledLetters] = useState<{ id: string; letter: string; used: boolean }[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{ id: string; letter: string }[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [round, setRound] = useState(1);
  const maxRounds = 3;

  useEffect(() => {
    startRound();
  }, [round]);

  const startRound = () => {
    const word = getRandomVocab(1)[0];
    setVocab(word);
    
    const letters = word.english.toUpperCase().split('');
    // Fisher-Yates shuffle
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    setJumbledLetters(letters.map((l, i) => ({ id: `${i}-${l}`, letter: l, used: false })));
    setSelectedLetters([]);
    setIsSuccess(false);
  };

  const handleSelectLetter = (item: { id: string; letter: string; used: boolean }) => {
    if (item.used || isSuccess) return;
    
    setJumbledLetters(prev => prev.map(l => l.id === item.id ? { ...l, used: true } : l));
    setSelectedLetters(prev => [...prev, { id: item.id, letter: item.letter }]);
  };

  const handleRemoveLetter = (index: number) => {
    if (isSuccess) return;
    
    const item = selectedLetters[index];
    setSelectedLetters(prev => prev.filter((_, i) => i !== index));
    setJumbledLetters(prev => prev.map(l => l.id === item.id ? { ...l, used: false } : l));
  };

  // Check completion
  useEffect(() => {
    if (!vocab) return;
    if (selectedLetters.length === vocab.english.length) {
      const formedWord = selectedLetters.map(s => s.letter).join('');
      if (formedWord === vocab.english.toUpperCase()) {
        setIsSuccess(true);
        setTimeout(() => {
          if (round < maxRounds) {
            setRound(r => r + 1);
          } else {
            onComplete();
          }
        }, 1500);
      } else {
        // Wrong word - shake and clear after delay
        setTimeout(() => {
          setSelectedLetters([]);
          setJumbledLetters(prev => prev.map(l => ({ ...l, used: false })));
        }, 800);
      }
    }
  }, [selectedLetters, vocab, round, maxRounds, onComplete]);

  if (!vocab) return null;

  return (
    <div className="w-full max-w-xl mx-auto space-y-8 animate-in fade-in duration-500 text-center">
      <div className="flex justify-between items-center bg-card p-4 rounded-2xl border border-border">
        <h2 className="text-xl font-bold text-foreground">Word Scramble</h2>
        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Round {round}/{maxRounds}
        </div>
      </div>

      <div className="p-8 bg-card rounded-3xl border border-border shadow-sm space-y-8">
        <div className="space-y-2">
          <div className="text-6xl mb-4">{vocab.emoji}</div>
          <p className="text-xl font-medium text-foreground">{vocab.vietnamese}</p>
          <p className="text-sm text-muted-foreground italic">"{vocab.example}"</p>
        </div>

        {/* Selected letters (Answer boxes) */}
        <div className={`flex flex-wrap justify-center gap-2 min-h-16 ${isSuccess ? 'animate-bounce' : ''}`}>
          {Array.from({ length: vocab.english.length }).map((_, i) => {
            const letter = selectedLetters[i];
            return (
              <div
                key={i}
                onClick={() => letter && handleRemoveLetter(i)}
                className={`w-12 h-14 flex items-center justify-center text-2xl font-extrabold rounded-xl border-b-4 transition-all ${
                  letter 
                    ? isSuccess 
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                      : selectedLetters.length === vocab.english.length // wrong attempt
                        ? 'bg-destructive text-destructive-foreground border-destructive-foreground'
                        : 'bg-primary text-primary-foreground border-primary-foreground cursor-pointer hover:-translate-y-1'
                    : 'bg-muted/50 border-muted text-transparent'
                }`}
              >
                {letter?.letter || ""}
              </div>
            );
          })}
        </div>

        {/* Jumbled letters pool */}
        <div className="flex flex-wrap justify-center gap-3 pt-8 border-t border-border/50">
          {jumbledLetters.map(l => (
            <button
              key={l.id}
              disabled={l.used || isSuccess}
              onClick={() => handleSelectLetter(l)}
              className={`w-14 h-16 text-3xl font-extrabold rounded-xl transition-all duration-200 ${
                l.used 
                  ? 'bg-muted text-muted-foreground/30 scale-95 border-b-2 border-muted' 
                  : 'bg-card text-foreground border-2 border-border shadow-sm border-b-4 hover:-translate-y-1 hover:border-primary hover:text-primary active:translate-y-0 active:border-b-2'
              }`}
            >
              {l.letter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
