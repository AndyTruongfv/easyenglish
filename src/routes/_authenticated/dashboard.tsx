import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyDashboard } from "@/lib/gamification.functions";
import { useEffect, useState } from "react";
import { Lesson } from "@/data/courses";
import { getCustomLessons } from "@/lib/custom_lessons";
import { BookOpen, Target, Newspaper, Music, GraduationCap, ChevronDown, Check, Lock } from "lucide-react";
import { SubscriptionModal } from "@/components/SubscriptionModal";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Learn — Easy English" },
      { name: "description", content: "Your daily learning path with streaks and jewels." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const fetchDash = useServerFn(getMyDashboard);
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchDash() });
  const completed = new Set(data?.completedLessonIds ?? []);
  const stats = data?.stats;

  const [customLessons, setCustomLessons] = useState<Lesson[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Học tiếng Anh qua bài hát");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const isVIP = data?.profile?.is_vip === true;

  useEffect(() => {
    setCustomLessons(getCustomLessons());
  }, []);

  const categorizedLessons = {
    "Văn phạm": customLessons.filter((l) => /văn phạm|grammar/i.test(l.subtitle)),
    "Từ vựng": customLessons.filter((l) => /từ vựng|vocab/i.test(l.subtitle) && !/chuyên ngành|esp|khách sạn|du lịch|kế toán|xây dựng|kiến trúc|luật|thể thao/i.test(l.subtitle)),
    "Tiếng Anh Chuyên Ngành": customLessons.filter((l) => /chuyên ngành|esp|khách sạn|du lịch|kế toán|xây dựng|kiến trúc|luật|thể thao/i.test(l.subtitle)),
    "Luyện thi (TOEIC, IELTS, TOEFL)": customLessons.filter((l) => /toeic|ielts|toefl/i.test(l.subtitle)),
    "Tin tức - Sự kiện": customLessons.filter((l) => /tin tức|news/i.test(l.subtitle)),
    "Học tiếng Anh qua bài hát": customLessons.filter((l) => /bài hát|song/i.test(l.subtitle)),
  };

  const categories = [
    { id: "Văn phạm", icon: <BookOpen className="text-blue-500" />, desc: "Các chủ điểm ngữ pháp cốt lõi từ cơ bản đến nâng cao." },
    { id: "Từ vựng", icon: <GraduationCap className="text-emerald-500" />, desc: "Từ vựng theo chủ đề có hình ảnh minh họa và phát âm chuẩn." },
    { id: "Tiếng Anh Chuyên Ngành", icon: <Target className="text-indigo-500" />, desc: "Khách sạn, Du lịch, Kế toán, Xây dựng, Kiến trúc, Luật, Thể thao..." },
    { id: "Luyện thi (TOEIC, IELTS, TOEFL)", icon: <Target className="text-rose-500" />, desc: "Các bài thi thử, đọc hiểu và trắc nghiệm thực tế." },
    { id: "Tin tức - Sự kiện", icon: <Newspaper className="text-amber-500" />, desc: "Học qua tin tức thời sự Reuters, BBC, CNN, Yle." },
    { id: "Học tiếng Anh qua bài hát", icon: <Music className="text-purple-500" />, desc: "Học qua video âm nhạc, điền từ và hát Karaoke." },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <section className="rounded-3xl border-4 border-primary/30 bg-gradient-to-br from-primary/15 to-accent/10 p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">Welcome back!</p>
            <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">
              {data?.profile?.display_name ?? "Learner"} 🦉
            </h1>
            <p className="mt-2 text-muted-foreground">
              {stats?.current_streak ? (
                <>You&apos;re on a <span className="font-extrabold text-flame">{stats.current_streak}-day streak</span> — keep it going!</>
              ) : (
                "Complete a lesson today to start your streak!"
              )}
            </p>
          </div>
          <div className="hidden text-6xl md:block animate-flame">🔥</div>
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <span className="text-3xl">📚</span> Lộ trình & Kiến thức
          </h2>
          <p className="text-muted-foreground mt-1">Khám phá và thực hành các bài học theo danh mục được thiết kế sẵn.</p>
        </div>

        <div className="space-y-4">
          {categories.map((cat) => {
            const lessons = categorizedLessons[cat.id as keyof typeof categorizedLessons] || [];
            const isExpanded = expandedCategory === cat.id;

            return (
              <div key={cat.id} className={`glass-panel border-2 transition-all duration-300 overflow-hidden rounded-3xl ${isExpanded ? "border-primary/50 shadow-xl" : "border-border shadow-sm hover:border-primary/30"}`}>
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                  className="w-full flex items-center justify-between p-6 text-left bg-background/50 hover:bg-muted/30 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl shadow-inner border border-border/50">
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-foreground">{cat.id}</h3>
                      <p className="text-sm text-muted-foreground font-medium mt-0.5">{cat.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full hidden sm:block">
                      {lessons.length} bài học
                    </span>
                    <ChevronDown size={20} className={`text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-6 pt-0 bg-background/50 border-t border-border/50">
                    {lessons.length > 0 ? (
                      <div className="grid gap-4 mt-4 md:grid-cols-2">
                        {lessons.map((lesson, idx) => {
                          const done = completed.has(`custom:${lesson.id}`);
                          
                          // Free vs VIP logic
                          let isFree = false;
                          if (cat.id === "Học tiếng Anh qua bài hát") isFree = true;
                          else if (cat.id === "Văn phạm" || cat.id === "Từ vựng") {
                            isFree = idx === 0 || /A1|A2|Cơ bản/i.test(lesson.title) || /A1|A2|Cơ bản/i.test(lesson.subtitle);
                          } else {
                            isFree = idx === 0; // First lesson is free as sample
                          }

                          const isLocked = !isVIP && !isFree;

                          return (
                            <Link
                              key={lesson.id}
                              to={isLocked ? "#" : "/lesson/$courseId/$lessonId"}
                              params={isLocked ? {} as any : { courseId: "custom", lessonId: lesson.id }}
                              onClick={(e) => {
                                if (isLocked) {
                                  e.preventDefault();
                                  setShowSubscriptionModal(true);
                                }
                              }}
                              className={`relative group flex items-center gap-4 p-4 rounded-2xl border-2 transition shadow-sm ${done ? "border-primary/50 bg-primary/5" : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"} ${isLocked ? "opacity-75" : ""}`}
                            >
                              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl shadow-inner ${done ? "bg-primary text-primary-foreground" : isLocked ? "bg-muted border border-border" : "bg-muted border border-border"}`}>
                                {done ? <Check size={24} strokeWidth={3} /> : isLocked ? <Lock size={20} className="text-muted-foreground" /> : "📝"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-extrabold truncate transition ${done ? "text-primary" : "text-foreground group-hover:text-primary"} flex items-center gap-2`}>
                                  {lesson.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate">
                                  {lesson.subtitle || "Bài tập"}
                                </p>
                              </div>
                              <div className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-extrabold text-primary shrink-0">
                                +10💎
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-4 p-8 text-center rounded-2xl border border-dashed border-border bg-muted/20">
                        <p className="text-sm font-bold text-muted-foreground">Hiện tại chưa có bài học nào trong thư mục này.</p>
                        <p className="text-xs text-muted-foreground mt-1">Hãy vào Admin để tạo thêm bài học nhé!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
    </div>
  );
}
