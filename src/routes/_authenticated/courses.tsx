import { createFileRoute, Link } from "@tanstack/react-router";
import { COURSES } from "@/data/courses";

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
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-extrabold">All Courses</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {COURSES.map((c) => (
          <div
            key={c.id}
            className="rounded-3xl border-4 border-border bg-card p-6 shadow-[0_6px_0_0_var(--border)]"
          >
            <div className="text-5xl">{c.emoji}</div>
            <h2 className="mt-3 text-xl font-extrabold">{c.title}</h2>
            <p className="text-sm text-muted-foreground">{c.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-muted-foreground">
                {c.locked ? "Coming soon" : `${c.lessons.length} lessons`}
              </span>
              {!c.locked && (
                <Link
                  to="/dashboard"
                  className="btn-chunky bg-primary text-primary-foreground active:btn-chunky-active"
                >
                  Start
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
