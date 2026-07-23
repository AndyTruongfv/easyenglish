import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { completeGame } from "@/lib/gamification.functions";
import { useState } from "react";
import { ArrowLeft, Trophy, Loader2 } from "lucide-react";
import { toast } from "sonner";

import FlashcardMaster from "@/components/games/FlashcardMaster";
import WordMatching from "@/components/games/WordMatching";
import WordScramble from "@/components/games/WordScramble";
import MemoryMatch from "@/components/games/MemoryMatch";

export const Route = createFileRoute("/_authenticated/games/$gameId")({
  head: (ctx) => ({
    meta: [
      { title: `Game: ${ctx.params.gameId} — Easy English` },
    ],
  }),
  component: GameComponent,
});

function GameComponent() {
  const { gameId } = Route.useParams();
  const queryClient = useQueryClient();
  const submitGame = useServerFn(completeGame);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatGameTitle = (id: string) => {
    switch (id) {
      case "flashcards": return "Flashcard Master";
      case "matching": return "Word Matching";
      case "scramble": return "Word Scramble";
      case "memory": return "Memory Flip";
      default: return "Mini-game";
    }
  };

  const handleGameComplete = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitGame({ data: { gameId } });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Game Completed! Earned +${res.xpEarned} XP 🎉`);
      setIsPlaying(false);
    } catch (error) {
      toast.error("Failed to submit game progress.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderGame = () => {
    if (isSubmitting) {
      return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-muted-foreground font-bold animate-pulse">Calculating Score...</p>
        </div>
      );
    }

    switch (gameId) {
      case "flashcards":
        return <FlashcardMaster onComplete={handleGameComplete} />;
      case "matching":
        return <WordMatching onComplete={handleGameComplete} />;
      case "scramble":
        return <WordScramble onComplete={handleGameComplete} />;
      case "memory":
        return <MemoryMatch onComplete={handleGameComplete} />;
      default:
        return (
          <div className="p-12 text-center text-muted-foreground">
            Unknown game mode: {gameId}
          </div>
        );
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Link
          to="/games"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <ArrowLeft size={16} />
          </div>
          Back to Games Hub
        </Link>
      </div>

      <div className="glass-panel min-h-[60vh] flex flex-col p-4 md:p-8 rounded-3xl border-2 border-border/50 relative overflow-hidden">
        {isPlaying ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-foreground">{formatGameTitle(gameId)}</h1>
            </div>
            {renderGame()}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in-95 duration-500">
            <div className="inline-flex items-center justify-center h-24 w-24 bg-amber-500/20 text-amber-500 rounded-full mb-2 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
              <Trophy size={48} />
            </div>
            <h2 className="text-4xl font-extrabold text-foreground">Round Cleared!</h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Great job! You earned <strong className="text-amber-500">+20 XP</strong> for completing this round. Your progress has been saved.
            </p>
            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm">
              <button
                onClick={() => setIsPlaying(true)}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-extrabold shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                PLAY AGAIN
              </button>
              <Link
                to="/games"
                className="w-full py-4 rounded-xl bg-card border-2 border-border text-foreground font-extrabold hover:bg-muted active:bg-muted/80 transition-colors"
              >
                MORE GAMES
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
