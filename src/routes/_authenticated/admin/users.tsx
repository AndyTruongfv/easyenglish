import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { getAllUsersProgress } from "@/lib/gamification.functions";
import { getCustomSubscriptions, saveCustomSubscription, type CustomSubscription } from "@/lib/custom_subscriptions";
import { Loader2, Trophy, ShieldAlert, KeyRound, Check, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const fetchUsersProgress = useServerFn(getAllUsersProgress);
  const { data: usersProgress, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin_users_progress"],
    queryFn: () => fetchUsersProgress(),
  });

  const [subscriptions, setSubscriptions] = useState<CustomSubscription[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form State
  const [tier, setTier] = useState<CustomSubscription["tier"]>("Free");
  const [paymentStatus, setPaymentStatus] = useState<CustomSubscription["paymentStatus"]>("Pending");
  const [expirationDate, setExpirationDate] = useState("");
  const [unlockedModules, setUnlockedModules] = useState<string[]>([]);

  useEffect(() => {
    setSubscriptions(getCustomSubscriptions());
  }, []);

  const openGrantModal = (profile: any) => {
    setSelectedUser(profile);
    const sub = subscriptions.find(s => s.userId === profile.id);
    if (sub) {
      setTier(sub.tier);
      setPaymentStatus(sub.paymentStatus);
      setExpirationDate(sub.expirationDate || "");
      setUnlockedModules(sub.unlockedModules || []);
    } else {
      setTier("Free");
      setPaymentStatus("Pending");
      setExpirationDate("");
      setUnlockedModules([]);
    }
  };

  const handleSaveGrant = () => {
    if (!selectedUser) return;
    const newSub: CustomSubscription = {
      userId: selectedUser.id,
      tier,
      paymentStatus,
      expirationDate: expirationDate || null,
      unlockedModules,
    };
    saveCustomSubscription(newSub);
    setSubscriptions(getCustomSubscriptions());
    setSelectedUser(null);
  };

  const toggleModule = (mod: string) => {
    setUnlockedModules(prev => prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-secondary/5">
        <h2 className="text-2xl font-extrabold flex items-center gap-2">
          👨‍🎓 Quản Lý Học Viên & Quyền Truy Cập
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi tiến độ và cấp quyền truy cập thủ công cho học viên (Gói tháng, giờ, VIP).
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {isLoadingUsers ? (
          <div className="py-12 flex flex-col justify-center items-center gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading users data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-4 font-extrabold text-sm text-muted-foreground uppercase tracking-wider">Học Viên</th>
                  <th className="px-6 py-4 font-extrabold text-sm text-muted-foreground uppercase tracking-wider text-center">Gói / Tier</th>
                  <th className="px-6 py-4 font-extrabold text-sm text-muted-foreground uppercase tracking-wider text-center">Trạng Thái TT</th>
                  <th className="px-6 py-4 font-extrabold text-sm text-muted-foreground uppercase tracking-wider text-center">Ngày Hết Hạn</th>
                  <th className="px-6 py-4 font-extrabold text-sm text-muted-foreground uppercase tracking-wider text-center">Module Mở Khóa</th>
                  <th className="px-6 py-4 font-extrabold text-sm text-muted-foreground uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersProgress?.profiles.map((profile) => {
                  const sub = subscriptions.find(s => s.userId === profile.id);
                  const isSysAdmin = (profile as any).role === "admin";
                  const displayTier = isSysAdmin ? "Super Admin" : (sub?.tier || "Free");
                  
                  return (
                    <tr key={profile.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs shrink-0">
                            {profile.display_name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <div>{profile.display_name || "Chưa Cập Nhật"}</div>
                            <div className="text-xs text-muted-foreground font-normal">{(profile as any).email || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          displayTier === "Super Admin" ? "bg-red-500/10 text-red-500 border border-red-500/20" : 
                          displayTier === "VIP" ? "bg-primary/20 text-primary border border-primary/40" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {displayTier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isSysAdmin ? <span className="text-muted-foreground">—</span> : (
                          <span className={`text-xs font-bold ${
                            sub?.paymentStatus === "Paid" ? "text-green-500" :
                            sub?.paymentStatus === "Expired" ? "text-red-500" : "text-amber-500"
                          }`}>
                            {sub?.paymentStatus || "Pending"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-muted-foreground">
                        {isSysAdmin ? "Vô thời hạn" : (sub?.expirationDate || "Không giới hạn")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isSysAdmin ? (
                          <span className="text-xs font-bold text-primary">TẤT CẢ</span>
                        ) : (
                          <div className="flex flex-wrap justify-center gap-1">
                            {sub?.unlockedModules?.length ? sub.unlockedModules.map(m => (
                              <span key={m} className="px-1.5 py-0.5 bg-secondary/20 text-secondary border border-secondary/30 rounded text-[10px] font-bold">
                                {m}
                              </span>
                            )) : <span className="text-xs text-muted-foreground">—</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openGrantModal(profile)}
                          className="btn-chunky bg-card text-foreground border border-border px-3 py-1.5 text-xs flex items-center justify-center gap-1 hover:bg-primary/10 hover:text-primary transition-colors ml-auto"
                        >
                          <KeyRound size={14} /> Cấp Quyền
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {(!usersProgress?.profiles || usersProgress.profiles.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-bold bg-muted/10">
                      Chưa có dữ liệu học viên.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GRANT ACCESS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold flex items-center gap-2">
                <ShieldAlert className="text-primary" /> Cấp Quyền Thủ Công
              </h3>
              <button onClick={() => setSelectedUser(null)} className="p-1 rounded-full hover:bg-muted"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-xl">
                <p className="text-sm font-bold">Học viên: <span className="text-primary">{selectedUser.display_name}</span></p>
                <p className="text-xs text-muted-foreground">{(selectedUser as any).email}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Tier / Gói Đăng Ký</label>
                <select value={tier} onChange={e => setTier(e.target.value as any)} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-semibold">
                  <option value="Free">Free (Miễn phí)</option>
                  <option value="Hourly">Hourly Pay (Theo giờ)</option>
                  <option value="Monthly">Monthly (50K/tháng)</option>
                  <option value="Yearly">Yearly (500K/năm)</option>
                  <option value="VIP">VIP (Toàn quyền)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Trạng Thái TT</label>
                  <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as any)} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-semibold">
                    <option value="Pending">Pending (Chờ)</option>
                    <option value="Paid">Paid (Đã TT)</option>
                    <option value="Expired">Expired (Hết hạn)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Ngày hết hạn (Tuỳ chọn)</label>
                  <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-semibold" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Mở khóa Module Đặc Biệt</label>
                <div className="grid grid-cols-2 gap-2">
                  {["TOEIC", "IELTS", "Grammar", "Phonics", "News"].map(mod => (
                    <button
                      key={mod}
                      onClick={() => toggleModule(mod)}
                      className={`px-3 py-2 rounded-xl border text-sm font-bold flex items-center justify-between transition-all ${unlockedModules.includes(mod) ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"}`}
                    >
                      {mod}
                      {unlockedModules.includes(mod) && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setSelectedUser(null)} className="w-1/3 btn-chunky bg-muted text-muted-foreground py-2 text-sm">Hủy</button>
              <button onClick={handleSaveGrant} className="w-2/3 btn-chunky bg-primary text-primary-foreground py-2 text-sm flex items-center justify-center gap-2">
                <KeyRound size={16} /> Lưu Quyền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
