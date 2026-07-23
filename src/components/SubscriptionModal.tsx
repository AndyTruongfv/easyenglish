import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check } from "lucide-react";

export function SubscriptionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-xl rounded-[2rem] border-primary/20 bg-gradient-to-br from-background to-primary/5 p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center mb-2">
            Nâng cấp tài khoản <span className="text-primary uppercase">VIP</span>
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground font-medium">
            Mở khóa toàn bộ kho bài giảng và tính năng theo dõi tiến độ để tối ưu hóa hiệu quả học tập.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="rounded-2xl border-2 border-border p-5 text-center bg-card shadow-sm">
            <h3 className="text-xl font-bold mb-1">Gói Tháng</h3>
            <p className="text-3xl font-extrabold text-primary mb-4">50K<span className="text-sm text-muted-foreground font-medium">/tháng</span></p>
            <button className="w-full btn-chunky bg-secondary text-secondary-foreground active:btn-chunky-active py-2">
              Đăng ký ngay
            </button>
          </div>
          <div className="rounded-2xl border-2 border-primary p-5 text-center bg-primary/5 shadow-md relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">Tiết kiệm 16%</div>
            <h3 className="text-xl font-bold mb-1">Gói Năm</h3>
            <p className="text-3xl font-extrabold text-primary mb-4">500K<span className="text-sm text-muted-foreground font-medium">/năm</span></p>
            <button className="w-full btn-chunky bg-primary text-primary-foreground active:btn-chunky-active py-2">
              Đăng ký ngay
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0"><Check size={14} strokeWidth={3}/></div>
            <p className="text-sm font-medium">Truy cập toàn bộ bài luyện thi TOEIC, IELTS, TOEFL.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0"><Check size={14} strokeWidth={3}/></div>
            <p className="text-sm font-medium">Hệ thống theo dõi tiến trình và sửa lỗi chi tiết.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0"><Check size={14} strokeWidth={3}/></div>
            <p className="text-sm font-medium">Không giới hạn tạo bài tập cá nhân hóa từ AI.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
