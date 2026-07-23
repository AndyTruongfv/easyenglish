import { createFileRoute, Link } from "@tanstack/react-router";
import { COURSES } from "@/data/courses";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyDashboard } from "@/lib/gamification.functions";
import { Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/courses")({
  head: () => ({
    meta: [
      { title: "Courses — Easy English" },
      { name: "description", content: "Browse all English courses." },
    ],
  }),
  component: Courses,
});

function Courses() {
  const fetchDash = useServerFn(getMyDashboard);
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDash(),
  });
  const completedIds = data?.completedLessonIds || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-extrabold text-foreground">Browse All Courses</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {COURSES.map((c) => {
          const totalLessons = c.lessons.length;
          const completedInCourse = c.lessons.filter(l => completedIds.includes(`${c.id}:${l.id}`)).length;
          const progress = totalLessons > 0 ? (completedInCourse / totalLessons) * 100 : 0;
          
          const firstIncomplete = c.lessons.find(l => !completedIds.includes(`${c.id}:${l.id}`)) || c.lessons[0];
          
          // Generate a pseudo-random rating for social proof
          const rating = (4.5 + (c.id.length % 5) * 0.1).toFixed(1);

          return (
            <div
              key={c.id}
              className="group flex flex-col rounded-3xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="text-5xl group-hover:scale-110 transition-transform">{c.emoji}</div>
                <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full text-xs font-bold">
                  <Star size={12} className="fill-current" /> {rating}/5
                </div>
              </div>
              <h2 className="mt-4 text-xl font-extrabold text-foreground">{c.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground flex-1">{c.description}</p>
              
              <div className="mt-6 space-y-4">
                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
                    <span>{c.locked ? "Coming soon" : `${totalLessons} lessons`}</span>
                    {!c.locked && <span>{Math.round(progress)}%</span>}
                  </div>
                  {!c.locked && (
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                {!c.locked && firstIncomplete && (
                  <Link
                    to="/lesson/$courseId/$lessonId"
                    params={{ courseId: c.id, lessonId: firstIncomplete.id }}
                    className="block w-full text-center py-3 rounded-xl bg-primary text-primary-foreground font-extrabold shadow-[0_4px_15px_rgba(var(--primary),0.3)] hover:shadow-[0_6px_20px_rgba(var(--primary),0.4)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
                  >
                    {progress > 0 && progress < 100 ? "CONTINUE" : "LEARN NOW"}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
