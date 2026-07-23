import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lesson } from "@/data/courses";
import { getCustomLessons } from "@/lib/custom_lessons";
import { BookOpen, Target, Newspaper, Music, GraduationCap, ChevronDown, Lock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Easy English with Andy — Learn English the fun way" },
      { name: "description", content: "Master Grammar, Vocabulary, TOEIC, IELTS, News, and Songs." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [customLessons, setCustomLessons] = useState<Lesson[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Học tiếng Anh qua bài hát");

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
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 text-2xl font-extrabold text-primary">
          <span className="text-3xl">🦉</span>
          <span className="hidden sm:inline-block">Easy English</span>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <div className="relative group z-50">
            <button className="flex items-center gap-1 font-bold text-foreground hover:text-primary transition cursor-pointer">
              Khóa học <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="glass-panel p-2 flex flex-col shadow-2xl rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl">
                <button onClick={() => setExpandedCategory("Văn phạm")} className="px-3 py-2 text-sm font-bold hover:bg-muted/30 rounded-md transition text-left text-foreground">Văn phạm</button>
                <button onClick={() => setExpandedCategory("Từ vựng")} className="px-3 py-2 text-sm font-bold hover:bg-muted/30 rounded-md transition text-left text-foreground">Từ vựng</button>
                <button onClick={() => setExpandedCategory("Tiếng Anh Chuyên Ngành")} className="px-3 py-2 text-sm font-bold hover:bg-muted/30 rounded-md transition text-left text-foreground">Tiếng Anh Chuyên Ngành</button>
                <button onClick={() => setExpandedCategory("Học tiếng Anh qua bài hát")} className="px-3 py-2 text-sm font-bold hover:bg-muted/30 rounded-md transition text-left text-foreground">Học qua bài hát</button>
              </div>
            </div>
          </div>

          <div className="relative group z-50">
            <button className="flex items-center gap-1 font-bold text-foreground hover:text-primary transition cursor-pointer">
              Luyện thi <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="glass-panel p-2 flex flex-col shadow-2xl rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl">
                <button onClick={() => setExpandedCategory("Luyện thi (TOEIC, IELTS, TOEFL)")} className="px-3 py-2 text-sm font-bold hover:bg-muted/30 rounded-md transition text-left text-foreground">TOEIC</button>
                <button onClick={() => setExpandedCategory("Luyện thi (TOEIC, IELTS, TOEFL)")} className="px-3 py-2 text-sm font-bold hover:bg-muted/30 rounded-md transition text-left text-foreground">IELTS / TOEFL</button>
              </div>
            </div>
          </div>

          <a href="#bảng-giá" className="font-bold text-foreground hover:text-primary transition">Bảng giá</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/auth" className="hidden sm:block rounded-2xl px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10 transition">
            Đăng nhập
          </Link>
          <Link to="/auth" search={{ mode: "signup" }} className="btn-chunky bg-primary text-primary-foreground active:btn-chunky-active text-sm px-4 py-2">
            Học thử miễn phí
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24 text-center">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl max-w-4xl mx-auto">
          Học Tiếng Anh dễ dàng. <br className="hidden md:block"/>
          <span className="text-primary bg-primary/10 px-4 rounded-3xl mt-2 inline-block">Hiệu quả & Thú vị.</span>
        </h1>
        <p className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground font-medium">
          Hệ thống bài học đa dạng từ Văn Phạm, Từ Vựng đến Luyện thi TOEIC, IELTS. 
          Theo dõi tiến độ học tập sát sao, nhận huy hiệu và tham gia thử thách mỗi ngày!
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/auth" search={{ mode: "signup" }} className="btn-chunky bg-primary text-primary-foreground active:btn-chunky-active text-lg px-8 py-3">
            Bắt đầu học ngay — Miễn phí
          </Link>
        </div>
        
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground font-extrabold">
          <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-2xl"><span className="text-2xl animate-flame">🔥</span> Chuỗi học tập</div>
          <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-2xl"><span className="text-2xl animate-gem">💎</span> Tích lũy kim cương</div>
          <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-2xl"><span className="text-2xl">📈</span> Theo dõi tiến độ</div>
        </div>
      </section>

      {/* Curriculum / Learning Tracks */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-foreground mb-3">Lộ trình & Kiến thức</h2>
          <p className="text-muted-foreground font-medium max-w-xl mx-auto">
            Nhấn vào từng danh mục dưới đây để khám phá các bài học. Đăng ký thành viên để làm bài tập và lưu lại tiến trình học của bạn!
          </p>
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
                    <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {lessons.length} bài học
                    </span>
                    <ChevronDown size={20} className={`text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-6 pt-0 bg-background/50 border-t border-border/50">
                    {lessons.length > 0 ? (
                      <div className="grid gap-3 mt-4 md:grid-cols-2">
                        {lessons.map((lesson) => (
                          <Link
                            key={lesson.id}
                            to="/lesson/$courseId/$lessonId"
                            params={{ courseId: "custom", lessonId: lesson.id }}
                            className="group flex flex-col p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition shadow-sm relative overflow-hidden"
                          >
                            <div className="absolute top-3 right-3 text-muted-foreground opacity-50 group-hover:text-primary group-hover:opacity-100 transition">
                              <Lock size={14} />
                            </div>
                            <h4 className="font-extrabold text-foreground group-hover:text-primary transition line-clamp-1 pr-6">{lesson.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1 font-medium flex items-center gap-1.5">
                              {cat.id === "Học tiếng Anh qua bài hát" && <Music size={12}/>}
                              {cat.id === "Từ vựng" && <GraduationCap size={12}/>}
                              Thực hành & Bài tập
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 p-8 text-center rounded-2xl border border-dashed border-border bg-muted/20">
                        <p className="text-sm font-bold text-muted-foreground">Hiện tại chưa có bài học nào trong thư mục này.</p>
                        <p className="text-xs text-muted-foreground mt-1">Nội dung sẽ sớm được cập nhật!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <div className="glass-panel p-10 rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/10 shadow-2xl">
          <h2 className="text-3xl font-extrabold mb-4">Sẵn sàng để bắt đầu?</h2>
          <p className="text-muted-foreground font-medium mb-8 max-w-xl mx-auto">
            Trở thành thành viên để mở khóa toàn bộ bài tập thực hành, theo dõi tiến độ học tập và nhận đánh giá điểm yếu để cải thiện mỗi ngày.
          </p>
          <Link to="/auth" search={{ mode: "signup" }} className="btn-chunky bg-primary text-primary-foreground active:btn-chunky-active px-8 py-3 text-lg inline-flex items-center gap-2">
            Đăng ký thành viên ngay
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground font-medium">
        &copy; {new Date().getFullYear()} Easy English with Andy. All rights reserved.
      </footer>
    </div>
  );
}

