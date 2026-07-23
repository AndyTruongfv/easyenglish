import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { type Course, type Lesson } from "@/data/courses";
import { getCustomCourses, saveCustomCourse, deleteCustomCourse } from "@/lib/custom_courses";
import { Plus, Edit2, Trash2, BookOpen, Layers, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  component: AdminCourses,
});

function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isEditing, setIsEditing] = useState<Course | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [managingLessonsCourse, setManagingLessonsCourse] = useState<Course | null>(null);

  // Form state course
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📚");
  const [color, setColor] = useState("primary");

  // Form state lesson
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonSubtitle, setLessonSubtitle] = useState("");
  const [lessonIcon, setLessonIcon] = useState("📝");
  const [lessonType, setLessonType] = useState<Lesson["type"]>("mix");

  useEffect(() => {
    setCourses(getCustomCourses());
  }, []);

  const handleSaveCourse = () => {
    if (!title.trim()) return;
    
    const newCourse: Course = {
      id: isEditing ? isEditing.id : `custom-course-${Date.now()}`,
      title,
      description,
      emoji,
      color,
      lessons: isEditing ? isEditing.lessons : [],
    };
    
    saveCustomCourse(newCourse);
    setCourses(getCustomCourses());
    resetCourseForm();
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm("Chắc chắn muốn xóa khóa học này?")) {
      deleteCustomCourse(id);
      setCourses(getCustomCourses());
    }
  };

  const resetCourseForm = () => {
    setIsEditing(null);
    setIsCreating(false);
    setTitle("");
    setDescription("");
    setEmoji("📚");
    setColor("primary");
  };

  const startEditCourse = (c: Course) => {
    setIsEditing(c);
    setIsCreating(true);
    setTitle(c.title);
    setDescription(c.description);
    setEmoji(c.emoji);
    setColor(c.color || "primary");
  };

  const handleAddLesson = () => {
    if (!managingLessonsCourse || !lessonTitle.trim()) return;
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: lessonTitle,
      subtitle: lessonSubtitle,
      icon: lessonIcon,
      type: lessonType,
      flashcards: [],
      quiz: [],
    };
    const updatedCourse = {
      ...managingLessonsCourse,
      lessons: [...managingLessonsCourse.lessons, newLesson]
    };
    saveCustomCourse(updatedCourse);
    setManagingLessonsCourse(updatedCourse);
    setCourses(getCustomCourses());
    setLessonTitle("");
    setLessonSubtitle("");
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!managingLessonsCourse || !confirm("Xóa bài học này?")) return;
    const updatedCourse = {
      ...managingLessonsCourse,
      lessons: managingLessonsCourse.lessons.filter(l => l.id !== lessonId)
    };
    saveCustomCourse(updatedCourse);
    setManagingLessonsCourse(updatedCourse);
    setCourses(getCustomCourses());
  };

  if (managingLessonsCourse) {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-secondary/5 flex items-center gap-4">
          <button onClick={() => setManagingLessonsCourse(null)} className="p-2 hover:bg-black/5 rounded-full transition">
            <ArrowLeft />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold flex items-center gap-2">
              Quản lý Bài học: {managingLessonsCourse.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Thêm bài học mới vào khóa học này. (Nội dung chi tiết có thể được tạo bằng tab Tạo Bài Học AI)
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 glass-panel p-6 rounded-3xl border border-border shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-lg">Thêm Bài học</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Tên Bài</label>
                <input value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm font-semibold" placeholder="VD: Unit 1" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Phụ đề</label>
                <input value={lessonSubtitle} onChange={e => setLessonSubtitle(e.target.value)} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm font-semibold" placeholder="VD: Hello World" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Biểu tượng</label>
                <input value={lessonIcon} onChange={e => setLessonIcon(e.target.value)} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm font-semibold" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Loại Bài</label>
                <select value={lessonType} onChange={e => setLessonType(e.target.value as any)} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm font-semibold">
                  <option value="mix">Mix (Flashcards + Quiz)</option>
                  <option value="flashcards+quiz">Flashcards & Quiz</option>
                  <option value="quiz">Quiz</option>
                  <option value="legacy-cloze">Bài Đọc Điền Từ</option>
                </select>
              </div>
              <button onClick={handleAddLesson} className="w-full btn-chunky bg-primary text-primary-foreground py-2 text-sm">
                Thêm Bài Học
              </button>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-lg px-2">Danh sách Bài học ({managingLessonsCourse.lessons.length})</h3>
            {managingLessonsCourse.lessons.map(lesson => (
              <div key={lesson.id} className="bg-card border border-border p-4 rounded-2xl flex justify-between items-center shadow-sm">
                <div className="flex gap-3 items-center">
                  <div className="text-2xl w-10 h-10 flex items-center justify-center bg-muted rounded-xl border border-border">{lesson.icon}</div>
                  <div>
                    <h4 className="font-extrabold">{lesson.title}</h4>
                    <p className="text-xs text-muted-foreground font-semibold">{lesson.subtitle} • {lesson.type}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteLesson(lesson.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-xl transition">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {managingLessonsCourse.lessons.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 border border-border rounded-2xl border-dashed">
                Chưa có bài học nào trong khóa này.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-secondary/5 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            📚 Quản Lý Khóa Học
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tạo, chỉnh sửa và quản lý các khóa học tùy chỉnh.
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-chunky bg-primary text-primary-foreground px-4 py-2 flex items-center gap-2"
          >
            <Plus size={18} /> Tạo Khóa Học
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="glass-panel p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="text-lg font-bold">{isEditing ? "Chỉnh sửa Khóa học" : "Tạo Khóa học mới"}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Tiêu đề</label>
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 font-semibold"
                placeholder="VD: Ngữ pháp siêu tốc"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Mô tả</label>
              <input 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 font-semibold"
                placeholder="VD: Nắm vững ngữ pháp cơ bản..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Biểu tượng (Emoji)</label>
              <input 
                value={emoji} 
                onChange={(e) => setEmoji(e.target.value)} 
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Màu sắc</label>
              <select 
                value={color} 
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 font-semibold"
              >
                <option value="primary">Primary (Vàng)</option>
                <option value="blue-500">Blue</option>
                <option value="emerald-500">Emerald</option>
                <option value="rose-500">Rose</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button onClick={resetCourseForm} className="btn-chunky bg-muted text-muted-foreground px-4 py-2">Hủy</button>
            <button onClick={handleSaveCourse} className="btn-chunky bg-primary text-primary-foreground px-4 py-2">
              Lưu Khóa Học
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((c) => (
            <div key={c.id} className="glass-panel p-5 rounded-2xl border border-border/80 flex flex-col justify-between space-y-4 hover:border-primary/50 transition shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                    {c.emoji}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-foreground">{c.title}</h4>
                    <span className="text-xs text-muted-foreground font-semibold">{c.description}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEditCourse(c)} className="text-muted-foreground hover:text-primary p-1 transition" title="Sửa thông tin"><Edit2 size={16} /></button>
                  <button onClick={() => handleDeleteCourse(c.id)} className="text-muted-foreground hover:text-destructive p-1 transition" title="Xóa khóa học"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/40 text-sm">
                <span className="text-muted-foreground font-bold flex items-center gap-1">
                  <Layers size={14} /> {c.lessons.length} Bài học
                </span>
                <button onClick={() => setManagingLessonsCourse(c)} className="font-bold text-primary hover:underline flex items-center gap-1">
                  Quản lý Bài học <BookOpen size={14} />
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="md:col-span-2 text-center py-12 bg-card rounded-2xl border border-border text-muted-foreground">
              <p className="font-semibold">Chưa có khóa học tùy chỉnh nào.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
