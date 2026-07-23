import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const completeInput = z.object({
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  score: z.number().int().min(0),
  total: z.number().int().min(1),
});

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string) {
  const d1 = new Date(a + "T00:00:00Z").getTime();
  const d2 = new Date(b + "T00:00:00Z").getTime();
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

export const completeLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => completeInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const perfect = data.score === data.total;
    const gemsEarned = perfect ? 10 : Math.max(2, Math.round((data.score / data.total) * 8));
    const xpEarned = 10 + data.score * 2;

    const { data: stats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const today = todayISO();
    let current_streak = stats?.current_streak ?? 0;
    let longest_streak = stats?.longest_streak ?? 0;

    if (!stats?.last_active_date) {
      current_streak = 1;
    } else if (stats.last_active_date === today) {
      // same day — no change
    } else {
      const gap = daysBetween(stats.last_active_date, today);
      if (gap === 1) current_streak += 1;
      else if (gap > 1 && (stats.streak_freezes ?? 0) > 0 && gap === 2) {
        // freeze covers one missed day
        current_streak += 1;
        await supabase
          .from("user_stats")
          .update({ streak_freezes: (stats.streak_freezes ?? 1) - 1 })
          .eq("user_id", userId);
      } else {
        current_streak = 1;
      }
    }
    longest_streak = Math.max(longest_streak, current_streak);

    await supabase.from("user_stats").upsert({
      user_id: userId,
      gems: (stats?.gems ?? 0) + gemsEarned,
      xp: (stats?.xp ?? 0) + xpEarned,
      current_streak,
      longest_streak,
      last_active_date: today,
      streak_freezes: stats?.streak_freezes ?? 0,
      updated_at: new Date().toISOString(),
    });

    await supabase.from("lesson_completions").insert({
      user_id: userId,
      course_id: data.courseId,
      lesson_id: data.lessonId,
      score: data.score,
      total: data.total,
      gems_earned: gemsEarned,
      perfect,
    });

    return { gemsEarned, xpEarned, current_streak, perfect };
  });

export const buyShopItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ itemId: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: item, error: itemErr } = await supabase
      .from("shop_items")
      .select("*")
      .eq("id", data.itemId)
      .maybeSingle();
    if (itemErr || !item) throw new Error("Item not found");

    const { data: stats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    const currentGems = stats?.gems ?? 0;
    if (currentGems < item.cost) throw new Error("Not enough jewels");

    if (item.category === "freeze") {
      await supabase
        .from("user_stats")
        .update({
          gems: currentGems - item.cost,
          streak_freezes: (stats?.streak_freezes ?? 0) + 1,
        })
        .eq("user_id", userId);
    } else {
      const { error: invErr } = await supabase
        .from("user_inventory")
        .insert({ user_id: userId, item_id: item.id });
      if (invErr && !`${invErr.message}`.includes("duplicate")) throw invErr;

      await supabase
        .from("user_stats")
        .update({ gems: currentGems - item.cost })
        .eq("user_id", userId);
    }

    return { ok: true, newGems: currentGems - item.cost };
  });

export const getMyDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: stats }, { data: completions }, { data: inventory }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_stats").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("lesson_completions").select("course_id, lesson_id, perfect").eq("user_id", userId),
        supabase.from("user_inventory").select("item_id").eq("user_id", userId),
      ]);
    return {
      profile: profile ?? null,
      stats: stats ?? { gems: 0, xp: 0, current_streak: 0, longest_streak: 0, streak_freezes: 0 },
      completedLessonIds: (completions ?? []).map((c) => `${c.course_id}:${c.lesson_id}`),
      ownedItemIds: (inventory ?? []).map((i) => i.item_id),
    };
  });

export const equipBadge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ badgeId: z.string().nullable() }).parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("profiles")
      .update({ equipped_badge: data.badgeId })
      .eq("id", context.userId);
    return { ok: true };
  });

export const getAllUsersProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    // In a real production app, you might want to check if context.userId is an admin
    const [{ data: profiles }, { data: stats }, { data: completions }] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("user_stats").select("*"),
      supabase.from("lesson_completions").select("*"),
    ]);

    return {
      profiles: profiles ?? [],
      stats: stats ?? [],
      completions: completions ?? [],
    };
  });
