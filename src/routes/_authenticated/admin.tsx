import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { getMyDashboard } from "@/lib/gamification.functions";
import { LayoutDashboard, BookOpen, Users, Newspaper } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const dashData = await getMyDashboard();
    const isDev = import.meta.env.DEV;
    if (!isDev && (dashData.profile as any)?.role !== "admin") {
      throw redirect({ to: "/courses" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center gap-3 mb-8 border-b border-border pb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
          <LayoutDashboard size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Quản lý nội dung, bài học, tin tức và người dùng
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <Link
            to="/admin/courses"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all [&.active]:bg-primary [&.active]:text-primary-foreground [&.active]:shadow-md [&.active]:shadow-primary/20 [&.active]:scale-[1.02]"
          >
            <BookOpen size={20} />
            Khóa học & Bài học
          </Link>
          <Link
            to="/admin/news"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all [&.active]:bg-primary [&.active]:text-primary-foreground [&.active]:shadow-md [&.active]:shadow-primary/20 [&.active]:scale-[1.02]"
          >
            <Newspaper size={20} />
            Tin Tức & AI Auto
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all [&.active]:bg-primary [&.active]:text-primary-foreground [&.active]:shadow-md [&.active]:shadow-primary/20 [&.active]:scale-[1.02]"
          >
            <Users size={20} />
            Quản Lý User
          </Link>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[600px] p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
