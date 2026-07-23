import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyDashboard } from "@/lib/gamification.functions";
import { LogOut, ChevronDown } from "lucide-react";
import { useEffect } from "react";
import blogContent from "@/data/blog_content.json";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppShell,
});

function AppShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchDash = useServerFn(getMyDashboard);
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDash(),
  });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/auth", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!profile) return;
    
    let localToken = localStorage.getItem("local_session_token");
    if (!localToken) {
      // First login or missing local token, let's create and sync it
      localToken = crypto.randomUUID();
      localStorage.setItem("local_session_token", localToken);
      supabase.from("profiles").update({ session_token: localToken }).eq("id", profile.id).then();
    } else if (profile.session_token && profile.session_token !== localToken) {
      // Mismatch detected on load
      import("sonner").then(({ toast }) => toast.error("Tài khoản của bạn vừa được đăng nhập ở thiết bị khác."));
      handleSignOut();
      return;
    }

    // Subscribe to profile changes
    const channel = supabase
      .channel("profile-session")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${profile.id}`,
        },
        (payload) => {
          const newSession = payload.new.session_token;
          if (newSession && newSession !== localToken) {
            import("sonner").then(({ toast }) => toast.error("Tài khoản của bạn vừa được đăng nhập ở thiết bị khác."));
            handleSignOut();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, profile?.session_token]);

  const stats = data?.stats;
  const profile = data?.profile;

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  // Extract categories dynamically
  const categoriesMap = new Map<string, Array<{ id: string; title: string }>>();
  blogContent.forEach((article: any) => {
    const cat = article.categories && article.categories.length > 0 ? article.categories[0] : "General";
    if (!categoriesMap.has(cat)) categoriesMap.set(cat, []);
    categoriesMap.get(cat)!.push({ id: article.id, title: article.title });
  });

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      {/* Top Navigation Bar */}
      <header className="glass-panel sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between border-b-0 px-4 py-3 md:px-8 shadow-md">
        <div className="flex items-center w-full md:w-auto justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-2xl font-extrabold text-primary">
            <img src="/ant_mascot.png" alt="Mascot" className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:inline-block">Easy English</span>
          </Link>
          
          <div className="md:hidden flex items-center gap-2">
            <StatChip icon="🔥" value={stats?.current_streak ?? 0} color="text-flame" />
          </div>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6 mt-4 md:mt-0">
          <Link to="/dashboard" className={`font-bold transition hover:text-primary ${pathname === "/dashboard" ? "text-primary" : "text-foreground"}`}>Góc học tập</Link>
          <Link to="/courses" className={`font-bold transition hover:text-primary ${pathname === "/courses" ? "text-primary" : "text-foreground"}`}>Thư viện bài làm</Link>
          <Link to="/admin" className={`font-extrabold text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary transition hover:bg-primary/20 flex items-center gap-1 ${pathname === "/admin" ? "ring-2 ring-primary" : ""}`}>
            ✨ Admin
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <StatChip icon="🔥" value={stats?.current_streak ?? 0} color="text-flame" animate />
          <StatChip icon="💎" value={stats?.gems ?? 0} color="text-gem" animate />
          
          <div className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${profile?.is_vip ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50' : 'bg-muted text-muted-foreground'}`}>
            {profile?.is_vip ? 'VIP' : 'FREE'}
          </div>
          
          <div className="relative group">
            <button className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/50 bg-card font-extrabold shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:scale-110 transition-transform cursor-pointer">
              {profile?.equipped_badge ? getBadgeEmoji(profile.equipped_badge) : (profile?.display_name?.[0]?.toUpperCase() ?? "🐜")}
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="glass-panel p-2 flex flex-col shadow-2xl rounded-xl border border-white/20">
                <Link to="/profile" className="px-3 py-2 text-sm font-bold hover:bg-muted/30 rounded-md transition text-left text-foreground">Profile</Link>
                <button onClick={handleSignOut} className="px-3 py-2 text-sm font-bold text-destructive hover:bg-destructive/10 rounded-md transition text-left flex items-center gap-2 cursor-pointer">
                  <LogOut size={16}/> Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}

function StatChip({
  icon,
  value,
  color,
  animate,
}: {
  icon: string;
  value: number;
  color: string;
  animate?: boolean;
}) {
  return (
    <div className="glass-panel flex items-center gap-1.5 rounded-2xl px-3 py-1.5 shadow-md">
      <span className={`text-xl ${animate ? (icon === "🔥" ? "animate-flame" : "animate-gem") : ""}`}>
        {icon}
      </span>
      <span className={`font-extrabold ${color}`}>{value}</span>
    </div>
  );
}

const BADGE_EMOJI: Record<string, string> = {
  badge_owl: "🐜",
  badge_rocket: "🚀",
  badge_crown: "👑",
  badge_fire: "🔥",
};
function getBadgeEmoji(id: string) {
  return BADGE_EMOJI[id] ?? "🐜";
}
