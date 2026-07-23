import { useState, useEffect } from "react";
import { getRandomVocab } from "@/data/games_vocab";

type Props = {
  onComplete: () => void;
};

type CardItem = {
  id: string;
  vocabId: string;
  content: string;
  type: "english" | "meaning";
  isFlipped: boolean;
  isMatched: boolean;
};

export default function MemoryMatch({ onComplete }: Props) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const vocab = getRandomVocab(6); // 6 pairs = 12 cards
    const deck: CardItem[] = [];
    
    vocab.forEach(v => {
      deck.push({ id: `en-${v.id}`, vocabId: v.id, content: v.english, type: "english", isFlipped: false, isMatched: false });
      deck.push({ id: `mn-${v.id}`, vocabId: v.id, content: `${v.emoji} ${v.vietnamese}`, type: "meaning", isFlipped: false, isMatched: false });
    });
    
    // Shuffle
    setCards(deck.sort(() => Math.random() - 0.5));
  }, []);

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);
      
      const [firstIndex, secondIndex] = newFlippedIndices;
      if (newCards[firstIndex].vocabId === newCards[secondIndex].vocabId) {
        // Match
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[firstIndex].isMatched = true;
            updated[secondIndex].isMatched = true;
            return updated;
          });
          setFlippedIndices([]);
          setIsLocked(false);
          checkWin();
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[firstIndex].isFlipped = false;
            updated[secondIndex].isFlipped = false;
            return updated;
          });
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const checkWin = () => {
    setCards(currentCards => {
      if (currentCards.every(c => c.isMatched)) {
        setTimeout(onComplete, 800);
      }
      return currentCards;
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-card p-4 rounded-2xl border border-border">
        <h2 className="text-xl font-bold text-foreground">Memory Match</h2>
        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Moves: <span className="text-primary text-lg">{moves}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 perspective-1000">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`relative w-full aspect-[4/3] cursor-pointer transform-style-3d transition-transform duration-500 ${
              card.isFlipped || card.isMatched ? "rotate-y-180" : "hover:-translate-y-1 hover:shadow-lg"
            }`}
            onClick={() => handleCardClick(index)}
          >
            {/* Card Back (Hidden when flipped) */}
            <div className="absolute w-full h-full bg-primary/10 border-2 border-primary/30 rounded-xl backface-hidden flex items-center justify-center text-primary/40 text-4xl font-black">
              ?
            </div>
            
            {/* Card Front (Visible when flipped) */}
            <div className={`absolute w-full h-full rounded-xl backface-hidden rotate-y-180 flex items-center justify-center p-2 text-center border-2 shadow-sm ${
              card.isMatched 
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-600 opacity-70" 
                : "bg-card border-border text-foreground"
            }`}>
              <span className="font-bold text-sm md:text-base leading-tight break-words line-clamp-3">
                {card.content}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
