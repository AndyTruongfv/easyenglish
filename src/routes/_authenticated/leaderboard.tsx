import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLeaderboard } from "@/lib/gamification.functions";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Star, Flame, Trophy, Medal } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Easy English" },
      { name: "description", content: "Global XP Leaderboard" },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const fetchLeaderboard = useServerFn(getLeaderboard);
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => fetchLeaderboard(),
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentUserId(data.user.id);
    });
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse font-bold">Loading global rankings...</div>;
  }

  const stats = data?.stats || [];
  const profiles = data?.profiles || [];

  // Map profiles to stats
  const leaderboard = stats.map((stat, index) => {
    const profile = profiles.find((p) => p.id === stat.user_id);
    return {
      rank: index + 1,
      userId: stat.user_id,
      displayName: profile?.display_name || "Anonymous Learner",
      avatarUrl: profile?.avatar_url,
      equippedBadge: profile?.equipped_badge,
      xp: stat.xp,
      gems: stat.gems,
      streak: stat.current_streak,
    };
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <section className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-full mb-2">
          <Trophy size={48} className="text-amber-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">Global Leaderboard</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Compete with learners worldwide. Earn XP by completing lessons and maintain your daily streaks to climb the ranks!
        </p>
      </section>

      <section className="glass-panel border-2 border-border/50 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4 font-extrabold text-center">Rank</th>
                <th className="px-6 py-4 font-extrabold">Learner</th>
                <th className="px-6 py-4 font-extrabold text-right">Total XP</th>
                <th className="px-6 py-4 font-extrabold text-center">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {leaderboard.map((user) => {
                const isCurrentUser = user.userId === currentUserId;
                
                let rankVisual: any = <span className="text-lg font-bold text-muted-foreground">#{user.rank}</span>;
                if (user.rank === 1) rankVisual = <Crown size={24} className="text-amber-500 mx-auto" />;
                else if (user.rank === 2) rankVisual = <Medal size={24} className="text-slate-400 mx-auto" />;
                else if (user.rank === 3) rankVisual = <Medal size={24} className="text-amber-700 mx-auto" />;

                return (
                  <tr 
                    key={user.userId} 
                    className={`transition-colors hover:bg-muted/30 ${isCurrentUser ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"}`}
                  >
                    <td className="px-6 py-4 text-center align-middle w-24">
                      {rankVisual}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg border border-primary/20">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                          ) : (
                            user.equippedBadge ? user.equippedBadge : user.displayName[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className={`font-extrabold ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                            {user.displayName} {isCurrentUser && "(You)"}
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">Level {Math.floor(user.xp / 500) + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full font-extrabold">
                        {user.xp} <Star size={14} className="fill-current" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 font-bold text-muted-foreground">
                        {user.streak > 0 ? (
                          <><Flame size={16} className="text-orange-500 fill-orange-500" /> {user.streak}</>
                        ) : (
                          "-"
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No learners have earned XP yet. Be the first!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
