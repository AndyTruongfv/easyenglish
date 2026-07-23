import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2, Brain, Puzzle, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/games")({
  head: () => ({
    meta: [
      { title: "Fun & Games — Easy English" },
      { name: "description", content: "Interactive mini-games to boost your vocabulary." },
    ],
  }),
  component: GamesHub,
});

const GAMES = [
  {
    id: "flashcards",
    title: "Flashcard Master",
    description: "3D flip cards with pronunciations.",
    icon: <Brain className="text-pink-500" size={32} />,
    color: "pink",
  },
  {
    id: "matching",
    title: "Word Matching",
    description: "Pair English words with Vietnamese meanings.",
    icon: <Puzzle className="text-emerald-500" size={32} />,
    color: "emerald",
  },
  {
    id: "scramble",
    title: "Word Scramble",
    description: "Unscramble letters to form words.",
    icon: <Gamepad2 className="text-amber-500" size={32} />,
    color: "amber",
  },
  {
    id: "memory",
    title: "Memory Flip",
    description: "Match pairs under time constraints.",
    icon: <Clock className="text-blue-500" size={32} />,
    color: "blue",
  },
];

function GamesHub() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <section className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 rounded-full mb-2">
          <Gamepad2 size={48} className="text-purple-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">Fun & Games Hub</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Take a break from traditional lessons! Play interactive vocabulary mini-games to reinforce your knowledge and earn <strong className="text-amber-500">+20 XP</strong> per round.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {GAMES.map((game) => (
          <div
            key={game.id}
            className="group flex flex-col rounded-3xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-${game.color}-500/10 blur-3xl pointer-events-none`}></div>
            
            <div className="flex items-start justify-between">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-${game.color}-500/10 border border-${game.color}-500/20 shadow-inner group-hover:scale-110 transition-transform`}>
                {game.icon}
              </div>
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                +20 XP
              </div>
            </div>
            
            <h2 className="mt-6 text-2xl font-extrabold text-foreground">{game.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground flex-1">{game.description}</p>
            
            <div className="mt-6">
              <Link
                to="/games/$gameId"
                params={{ gameId: game.id }}
                className="block w-full text-center py-3 rounded-xl bg-primary text-primary-foreground font-extrabold shadow-[0_4px_15px_rgba(var(--primary),0.3)] hover:shadow-[0_6px_20px_rgba(var(--primary),0.4)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
              >
                PLAY NOW
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
