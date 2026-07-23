import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { equipBadge, getMyDashboard } from "@/lib/gamification.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Easy English" },
      { name: "description", content: "Your learning profile, badges and stats." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const queryClient = useQueryClient();
  const fetchDash = useServerFn(getMyDashboard);
  const equip = useServerFn(equipBadge);

  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchDash() });
  const { data: items } = useQuery({
    queryKey: ["shop_items"],
    queryFn: async () => (await supabase.from("shop_items").select("*")).data ?? [],
  });

  const stats = data?.stats;
  const profile = data?.profile;
  const ownedBadges = (items ?? []).filter(
    (i) => i.category === "badge" && data?.ownedItemIds.includes(i.id),
  );

  async function toggle(badgeId: string | null) {
    await equip({ data: { badgeId } });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    toast.success(badgeId ? "Badge equipped!" : "Badge removed");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="glass-panel rounded-3xl p-8">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary bg-primary/10 text-4xl">
            {profile?.equipped_badge
              ? ({ badge_owl: "🐜", badge_rocket: "🚀", badge_crown: "👑", badge_fire: "🔥" } as Record<string, string>)[
                  profile.equipped_badge
                ] ?? "🐜"
              : (profile?.display_name?.[0]?.toUpperCase() ?? "🐜")}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{profile?.display_name ?? "Learner"}</h1>
            <p className="text-muted-foreground">Keep going, one lesson at a time.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat icon="🔥" label="Streak" value={stats?.current_streak ?? 0} />
          <Stat icon="🏅" label="Best" value={stats?.longest_streak ?? 0} />
          <Stat icon="💎" label="Jewels" value={stats?.gems ?? 0} />
          <Stat icon="⭐" label="XP" value={stats?.xp ?? 0} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-extrabold">Your badges</h2>
        {ownedBadges.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
            No badges yet. Visit the Shop to earn some!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ownedBadges.map((b) => {
              const equipped = profile?.equipped_badge === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => toggle(equipped ? null : b.id)}
                  className={`glass-panel rounded-2xl p-4 text-center transition hover:border-primary/50 ${
                    equipped ? "border-primary bg-primary/20" : ""
                  }`}
                >
                  <div className="text-4xl">{b.icon}</div>
                  <div className="mt-2 text-sm font-bold">{b.name}</div>
                  <div className="mt-1 text-xs font-extrabold uppercase text-primary">
                    {equipped ? "Equipped" : "Equip"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="glass-panel rounded-2xl p-4 text-center">
      <div className="text-2xl">{icon}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
      <div className="text-xs font-bold uppercase text-muted-foreground">{label}</div>
    </div>
  );
}
