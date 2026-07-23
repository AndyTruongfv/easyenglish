import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { buyShopItem, getMyDashboard } from "@/lib/gamification.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Easy English" },
      { name: "description", content: "Spend jewels on badges and streak freezes." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const queryClient = useQueryClient();
  const fetchDash = useServerFn(getMyDashboard);
  const buy = useServerFn(buyShopItem);

  const { data: dash } = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchDash() });
  const { data: items } = useQuery({
    queryKey: ["shop_items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shop_items").select("*").order("cost");
      if (error) throw error;
      return data;
    },
  });

  const owned = new Set(dash?.ownedItemIds ?? []);
  const gems = dash?.stats?.gems ?? 0;

  async function handleBuy(id: string, cost: number, name: string) {
    if (gems < cost) return toast.error("Not enough jewels!");
    try {
      await buy({ data: { itemId: id } });
      toast.success(`You got ${name}!`);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Purchase failed");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Shop 🛍️</h1>
          <p className="text-muted-foreground">Spend your jewels on rewards.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border-2 border-gem/40 bg-gem/10 px-4 py-2">
          <span className="text-xl animate-gem">💎</span>
          <span className="text-lg font-extrabold text-gem">{gems}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(items ?? []).map((item) => {
          const isOwned = owned.has(item.id);
          const canAfford = gems >= item.cost;
          return (
            <div
              key={item.id}
              className="rounded-3xl border-4 border-border bg-card p-6 text-center shadow-[0_6px_0_0_var(--border)]"
            >
              <div className="text-6xl">{item.icon}</div>
              <h3 className="mt-3 text-lg font-extrabold">{item.name}</h3>
              <p className="mt-1 h-10 text-sm text-muted-foreground">{item.description}</p>
              <div className="mt-3 flex items-center justify-center gap-1 text-gem font-extrabold">
                <span>💎</span> {item.cost}
              </div>
              {isOwned && item.category === "badge" ? (
                <div className="btn-chunky mt-4 w-full cursor-default bg-muted text-muted-foreground">
                  <Check size={16} /> Owned
                </div>
              ) : (
                <button
                  onClick={() => handleBuy(item.id, item.cost, item.name)}
                  disabled={!canAfford}
                  className="btn-chunky mt-4 w-full bg-primary text-primary-foreground active:btn-chunky-active disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Buy
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
