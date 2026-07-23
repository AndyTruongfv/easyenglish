import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { type Lesson } from "@/data/courses";
import { saveCustomLesson, getCustomLessons, deleteCustomLesson } from "@/lib/custom_lessons";
import { getAllUsersProgress } from "@/lib/gamification.functions";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LegacyClozeView } from "@/routes/_authenticated/lesson.$courseId.$lessonId";
import {
  Sparkles,
  Music,
  Plus,
  Trash2,
  Play,
  Search,
  CheckCircle2,
  FileText,
  Wand2,
  RefreshCw,
  BookOpen,
  ArrowRight,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import {
  generateVocabularyAZ,
  generateTOEICContent,
  generateIELTSContent,
  generateGrammarLesson,
  generateNewsLesson,
  generateSongLesson,
} from "@/lib/gemini";
import { getMyDashboard } from "@/lib/gamification.functions";
import { SubscriptionModal } from "@/components/SubscriptionModal";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

type AudioResult = {
  trackId: number;
  trackName: string;
  artistName: string;
  previewUrl: string;
  artworkUrl100: string;
};

import { PRESET_TRENDS, TOP_CHARTS } from "../../lib/songs";

const SUBJECT_CATEGORIES = [
  { id: "grammar", title: "1. Văn phạm", subtitle: "Văn phạm", icon: "📘", color: "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { id: "vocab", title: "2. Từ vựng", subtitle: "Từ vựng", icon: "🔤", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { id: "esp", title: "3. Chuyên Ngành", subtitle: "Tiếng Anh Chuyên Ngành (ESP)", icon: "💼", color: "border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  { id: "toeic", title: "4. TOEIC", subtitle: "TOEIC", icon: "🎯", color: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { id: "ielts", title: "5. IELTS / TOEFL", subtitle: "IELTS & TOEFL", icon: "🎓", color: "border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { id: "news", title: "6. Tin tức - Sự kiện", subtitle: "Tin tức - Tin thời sự nóng hổi", icon: "📰", color: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  { id: "song", title: "7. Học qua bài hát", subtitle: "Bài hát", icon: "🎵", color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
];

const ESP_SUGGESTIONS = [
  { kw: "Hospitality & Hotel Management Vocabulary", level: "Intermediate", label: "🏨 Khách sạn (Hotel)" },
  { kw: "Tourism & Travel Industry Vocabulary", level: "Pre-Intermediate", label: "✈️ Du lịch (Tourism)" },
  { kw: "Accounting & Finance Vocabulary", level: "Intermediate (B2)", label: "📊 Kế toán (Accounting)" },
  { kw: "Construction & Engineering Vocabulary", level: "Intermediate", label: "🏗️ Xây dựng (Construction)" },
  { kw: "Architecture & Design Vocabulary", level: "Intermediate", label: "🏛️ Kiến trúc (Architecture)" },
  { kw: "Legal English & Court Vocabulary", level: "Advanced (C1)", label: "⚖️ Luật (Law)" },
  { kw: "Sports & Athletics Vocabulary", level: "Pre-Intermediate", label: "⚽ Thể thao (Sports)" },
];

const TOEIC_SUGGESTIONS = [
  { kw: "Part 5: Business Emails & Inquiries", level: "TOEIC 650+ Target", label: "📧 Part 5: Business Emails" },
  { kw: "Part 6: Financial Reports", level: "TOEIC 750+ Target", label: "📊 Part 6: Financial Reports" },
  { kw: "Corporate Management & Hiring", level: "TOEIC 800+ Target", label: "🏢 Management & Hiring" },
  { kw: "Business Travel & Flight Delays", level: "TOEIC 650+ Target", label: "✈️ Business Travel" },
  { kw: "Invoicing & Payment Terms", level: "TOEIC 750+ Target", label: "💳 Invoicing & Payments" },
  { kw: "Client Negotiations & Contracts", level: "TOEIC 900+ Target", label: "🤝 Client Contracts" },
];

const IELTS_SUGGESTIONS = [
  { kw: "Band 7.5 Academic Reading: Climate Change & Energy", level: "IELTS Band 7.0+ Target", label: "🌍 Climate Change (Band 7.5)" },
  { kw: "Band 8.0 AI & Future of Work", level: "IELTS Band 7.0+ Target", label: "🤖 AI & Future Work (Band 8.0)" },
  { kw: "Band 7.0 Archaeology & Ancient Civilizations", level: "IELTS Band 7.0+ Target", label: "🏛️ Archaeology (Band 7.0)" },
  { kw: "Band 8.5 Cognitive Psychology & Memory", level: "IELTS Band 7.0+ Target", label: "🧠 Memory & Brain (Band 8.5)" },
  { kw: "Band 8.0 Astrophysics & Space Exploration", level: "IELTS Band 8.0 Target", label: "🌌 Astrophysics (Band 8.0)" },
  { kw: "Band 7.5 Biodiversity & Conservation", level: "IELTS Band 7.0+ Target", label: "🌿 Biodiversity (Band 7.5)" },
];

const VOCAB_SUGGESTIONS = [
  // 🧑 Human Body & Health
  { kw: "Body Parts: Head, Trunk, Limbs with IPA phonetics", level: "Elementary", label: "🧑 Body (Cơ Thể)" },
  { kw: "Internal Organs: Heart, Lungs, Liver, Kidney Vocabulary", level: "Pre-Intermediate", label: "🫀 Internal Organs (Nội Tạng)" },
  { kw: "Physical Therapy: Modalities, Exercises, Rehabilitation", level: "Intermediate", label: "🦴 Vật lý trị liệu (Physical Therapy)" },
  { kw: "Massage Therapy: Techniques, Anatomy, Wellness", level: "Intermediate", label: "💆 Massage (Massage)" },
  { kw: "Chiropractic: Vertebrae, Spine, Joints, Nerves", level: "Intermediate", label: "🩻 Chiropractic (Nắn chỉnh xương khớp)" },
  { kw: "Facial Reflexology (Diện chẩn): Acupoints, Meridians, Reflexology charts, Internal organs", level: "Intermediate", label: "✨ Diện chẩn (Facial Reflexology)" },
  { kw: "Illnesses & Common Symptoms (Các Bệnh Thường Gặp)", level: "Pre-Intermediate", label: "🤒 Illnesses (Bệnh Tật)" },
  { kw: "Injury & First Aid Vocabulary: Cuts, Fractures, Burns", level: "Pre-Intermediate", label: "🩹 Injury & First Aid (Chấn Thương)" },
  { kw: "Emotions & Feelings Vocabulary: Happy, Sad, Anxious, Proud", level: "Elementary", label: "😊 Emotions & Feelings (Cảm Xúc)" },
  { kw: "At the Hospital: Doctor, Nurse, Ward, Emergency Vocabulary", level: "Intermediate", label: "🏥 Hospital (Bệnh Viện)" },

  // 👨‍👩‍👧 People & Home
  { kw: "Family Members & Relationships Vocabulary", level: "Elementary", label: "👨‍👩‍👧 My Family (Gia Đình)" },
  { kw: "My House: Rooms, Furniture & Objects in Each Room", level: "Pre-Intermediate", label: "🏠 My House (Ngôi Nhà)" },
  { kw: "My Garden: Plants, Flowers, Trees & Garden Vocabulary", level: "Pre-Intermediate", label: "🌿 My Garden (Khu Vườn)" },

  // 👗 Fashion & Clothing
  { kw: "Clothes Vocabulary: Tops, Bottoms, Dresses, Accessories", level: "Elementary", label: "👗 Clothes (Quần Áo)" },
  { kw: "Men's Wear: Suits, Ties, Shirts, Trousers, Footwear", level: "Elementary", label: "👔 Men's Wear (Đồ Nam)" },
  { kw: "Women's Wear: Dresses, Blouses, Skirts, Heels, Bags", level: "Elementary", label: "👒 Women's Wear (Đồ Nữ)" },
  { kw: "Kids' Wear: Children's Clothing Vocabulary & School Uniforms", level: "Elementary", label: "🧒 Kids' Wear (Đồ Trẻ Em)" },
  { kw: "Hair Vocabulary: Hairstyles, Haircut Terms, Salon", level: "Elementary", label: "💇 Hair (Kiểu Tóc)" },

  // 🛒 Shopping & Services
  { kw: "At the Bank: Account, Loan, Transfer, ATM Vocabulary", level: "Intermediate", label: "🏦 Bank (Ngân Hàng)" },
  { kw: "Communications: Phone, Email, Social Media, Post Office", level: "Pre-Intermediate", label: "📱 Communications (Truyền Thông)" },
  { kw: "At the Hotel: Check-in, Room Service, Amenities Vocabulary", level: "Intermediate", label: "🏨 Hotel (Khách Sạn)" },
  { kw: "Shopping Center: Stores, Escalator, Checkout Vocabulary", level: "Elementary", label: "🛍️ Shopping Center (Trung Tâm Mua Sắm)" },
  { kw: "Department Store: Floors, Sections, Staff, Products", level: "Elementary", label: "🏬 Department Store (Siêu Thị)" },
  { kw: "At the Pharmacy: Medicine, Prescription, Vitamins Vocabulary", level: "Pre-Intermediate", label: "💊 Pharmacy (Nhà Thuốc)" },
  { kw: "The Florist's: Flowers, Bouquets, Plants & Flower Shop Terms", level: "Elementary", label: "💐 The Florist's (Cửa Hàng Hoa)" },
  { kw: "Confectioner: Sweets, Chocolate, Candy Shop Vocabulary", level: "Elementary", label: "🍬 Confectioner (Tiệm Kẹo Bánh)" },

  // 🍽️ Food & Drink
  { kw: "Meat Vocabulary: Beef, Pork, Chicken, Lamb & Butcher Terms", level: "Elementary", label: "🥩 Meat (Thịt)" },
  { kw: "Fish & Seafood Vocabulary: Salmon, Shrimp, Crab, Tuna", level: "Elementary", label: "🐟 Fish & Seafood (Hải Sản)" },
  { kw: "Vegetables Vocabulary: Root, Leafy, Cruciferous, Allium", level: "Elementary", label: "🥦 Vegetables (Rau Củ)" },
  { kw: "Fruit Vocabulary: Tropical, Berries, Citrus, Stone Fruits", level: "Elementary", label: "🍓 Fruit (Trái Cây)" },
  { kw: "Grains & Cereals: Rice, Wheat, Oats, Barley, Quinoa", level: "Pre-Intermediate", label: "🌾 Grains (Ngũ Cốc)" },
  { kw: "Herbs & Spices: Basil, Coriander, Turmeric, Pepper, Ginger", level: "Pre-Intermediate", label: "🌿 Herbs & Spices (Rau Thơm & Gia Vị)" },
  { kw: "Bottled & Canned Foods: Vocabulary for Packaged Goods", level: "Elementary", label: "🫙 Bottled Foods (Đồ Đóng Hộp)" },
  { kw: "Dairy Produce: Milk, Cheese, Butter, Yoghurt, Cream", level: "Elementary", label: "🧀 Dairy Produce (Sản Phẩm Sữa)" },
  { kw: "Bread & Flour Products: Baguette, Sourdough, Rye, Pastries", level: "Elementary", label: "🍞 Bread & Flour (Bánh Mì & Bột)" },
  { kw: "Cakes & Desserts: Tiramisu, Cheesecake, Pudding, Soufflé", level: "Pre-Intermediate", label: "🎂 Cakes & Desserts (Bánh Ngọt)" },
  { kw: "Delicatessen: Gourmet Cold Cuts, Fine Foods Vocabulary", level: "Intermediate", label: "🥓 Delicatessen (Đặc Sản Cao Cấp)" },
  { kw: "Drinks Vocabulary: Juice, Coffee, Tea, Cocktails, Wine", level: "Elementary", label: "🥤 Drinks (Đồ Uống)" },
  { kw: "At the Restaurant: Ordering, Menu, Service Vocabulary", level: "Pre-Intermediate", label: "🍽️ Restaurant (Nhà Hàng)" },
  { kw: "Dishes from Around the World: Names, Origins, Ingredients", level: "Pre-Intermediate", label: "🌍 Dishes (Các Món Ăn Thế Giới)" },
  { kw: "Cooking Techniques: Sauté, Braise, Marinate, Poach, Grill", level: "Intermediate", label: "👨‍🍳 Cooking Techniques (Kỹ Thuật Nấu)" },

  // 💼 Work & Technology
  { kw: "Office Vocabulary: Desk, Printer, Meeting, Stationery", level: "Pre-Intermediate", label: "🖥️ Office (Văn Phòng)" },
  { kw: "Computer & Tech Vocabulary: Hardware, Software, Network, Cloud", level: "Intermediate", label: "💻 Computer (Máy Tính)" },
  { kw: "Technology & Digital Life: AI, Apps, Internet Safety", level: "Intermediate (B2)", label: "📱 Technology & AI" },

  // ⚖️ Law, Economics, History
  { kw: "Law & Legal Vocabulary: Court, Rights, Crime & Justice", level: "Intermediate (B2)", label: "⚖️ Law (Pháp Luật)" },
  { kw: "Economics & Finance: Supply, Demand, GDP, Inflation", level: "Intermediate (B2)", label: "📊 Economics (Kinh Tế)" },
  { kw: "Banking & Loans Vocabulary for Daily Life", level: "Pre-Intermediate", label: "🏦 Banking & Loans" },
  { kw: "World History: Key Events, Periods & Figures", level: "Intermediate (B2)", label: "📜 History (Lịch Sử)" },
  { kw: "Ancient Civilizations: Egypt, Rome, Greece Vocabulary", level: "Nâng cao (C1-C2)", label: "🏛️ Ancient Civilizations" },

  // 🚗 Transport & Travel
  { kw: "Transportation & Travel Vocabulary", level: "Pre-Intermediate", label: "🚗 Transport & Travel" },
  { kw: "Airport & Flight Procedures Vocabulary", level: "Intermediate", label: "✈️ Airport & Flying" },

  // 🔬 Science & Environment
  { kw: "Science & Environment: Climate, Energy, Research Vocab", level: "Nâng cao (C1-C2)", label: "🔬 Science & Environment" },
];

const NEWS_OUTLETS = [
  { id: "Reuters", label: "🌐 Reuters (Hãng tin Quốc tế)" },
  { id: "BBC News", label: "🇬🇧 BBC News (Anh Quốc)" },
  { id: "CNN", label: "🇺🇸 CNN (Mỹ)" },
  { id: "CNBC", label: "📈 CNBC (Thị trường & Kinh tế)" },
  { id: "Yle", label: "🇫🇮 Yle (Phần Lan)" },
  { id: "TechCrunch", label: "💻 TechCrunch (Công nghệ & AI)" },
  { id: "The Guardian", label: "🗞️ The Guardian (Vương Quốc Anh)" },
  { id: "The Economist", label: "📊 The Economist (Tài chính)" },
  { id: "VnExpress International", label: "🇻🇳 VnExpress International (Việt Nam)" },
  { id: "Tuoi Tre News", label: "🇻🇳 Tuoi Tre News (Việt Nam)" },
  { id: "Vietnam News", label: "🇻🇳 Vietnam News (Việt Nam)" },
  { id: "Thanh Nien News", label: "🇻🇳 Thanh Nien News (Việt Nam)" },
];

function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"creator" | "manage" | "users">("creator");
  const [selectedSubject, setSelectedSubject] = useState<string>("song");

  const fetchUsersProgress = useServerFn(getAllUsersProgress);
  const { data: usersProgress, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin_users_progress"],
    queryFn: () => fetchUsersProgress(),
    enabled: activeTab === "users",
  });

  const fetchDash = useServerFn(getMyDashboard);
  const { data: dashData } = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchDash() });
  const isVIP = dashData?.profile?.is_vip === true;
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("Song Cloze / Lesson");
  const [rawContent, setRawContent] = useState("");
  const [parsedHtmlText, setParsedHtmlText] = useState("");
  const [extractedAnswers, setExtractedAnswers] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [karaokeUrl, setKaraokeUrl] = useState("");

  // Category Specific Co-Pilot State
  const [categoryKeyword, setCategoryKeyword] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("Intermediate (B1-B2)");
  const [newsSource, setNewsSource] = useState("Reuters / BBC News");
  const [newsAuthor, setNewsAuthor] = useState("By Sarah Jenkins, Senior Editor");

  // AI Generation State
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiSubSkill, setAiSubSkill] = useState("reading");

  // Search & Audio State
  const [searchResults, setSearchResults] = useState<AudioResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Helper to parse {answer} tags into indexed {0}, {1} placeholders & answer array
  const parseCurlyContent = (text: string) => {
    const answers: string[] = [];
    const parsed = text.replace(/\{([^}]+)\}/g, (_, ans) => {
      const idx = answers.length;
      answers.push(ans.trim());
      return `{${idx}}`;
    });
    return { parsedHtmlText: parsed, extractedAnswers: answers };
  };

  // ── REAL GEMINI AI GENERATOR ──────────────────────────────────────────────
  const handleGeminiAIGenerate = async () => {
    if (!isVIP && selectedSubject !== "song") {
      setShowSubscriptionModal(true);
      return;
    }

    const kw = categoryKeyword.trim() || "General English";
    setIsAIGenerating(true);
    toast.info("🤖 Gemini AI đang soạn bài...", { duration: 3000 });

    try {
      let aiHtml = "";

      if (selectedSubject === "vocab") {
        setTitle(`Từ Vựng A-Z: ${kw}`);
        setSubtitle("Từ vựng");
        aiHtml = await generateVocabularyAZ(kw, difficultyLevel);

      } else if (selectedSubject === "esp") {
        setTitle(`Tiếng Anh Chuyên Ngành: ${kw}`);
        setSubtitle("Tiếng Anh Chuyên Ngành (ESP)");
        aiHtml = await generateVocabularyAZ(kw, difficultyLevel); // ESP can use vocab generator

      } else if (selectedSubject === "grammar") {
        setTitle(`Ngữ Pháp: ${kw}`);
        setSubtitle("Văn phạm");
        aiHtml = await generateGrammarLesson(kw);

      } else if (selectedSubject === "toeic") {
        setTitle(`TOEIC ${aiSubSkill.toUpperCase()}: ${kw}`);
        setSubtitle("TOEIC");
        aiHtml = await generateTOEICContent(kw, aiSubSkill, difficultyLevel);

      } else if (selectedSubject === "ielts") {
        setTitle(`IELTS / TOEFL ${aiSubSkill.toUpperCase()}: ${kw}`);
        setSubtitle("IELTS, TOEFL");
        aiHtml = await generateIELTSContent(kw, aiSubSkill, difficultyLevel);

      } else if (selectedSubject === "news") {
        setTitle(`Tin Tức: ${kw}`);
        setSubtitle("Tin tức");
        aiHtml = await generateNewsLesson(kw, newsSource, difficultyLevel);

      } else if (selectedSubject === "song") {
        const parts = kw.split(" - ");
        const songTitle = parts[0] || kw;
        const artist = parts[1] || "Unknown Artist";
        setTitle(`🎵 ${songTitle} — ${artist}`);
        setSubtitle("Bài hát");
        aiHtml = await generateSongLesson(songTitle, artist);
      }

      if (aiHtml) {
        const { parsedHtmlText: ph, extractedAnswers: ea } = parseCurlyContent(aiHtml);
        setRawContent(aiHtml);
        setParsedHtmlText(ph);
        setExtractedAnswers(ea);
        toast.success(`✅ AI đã soạn xong! ${ea.length} từ cần điền vào bài.`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định";
      toast.error(`❌ Gemini AI lỗi: ${msg}`);
      // Fallback to static template
      handleAICoPilotGenerate();
      
      // Inject the error directly into the editor so the user (and developer) can see it!
      setTimeout(() => {
        setRawContent(prev => 
          `<div style="color:red; font-weight:bold; padding:10px; border:2px solid red; margin-bottom:15px;">
            ⚠️ GEMINI API ERROR:<br/>
            ${msg}<br/><br/>
            (Vì API lỗi nên hệ thống đã tạm hiển thị bài mẫu bên dưới. Vui lòng chụp màn hình lỗi màu đỏ này gửi cho lập trình viên!)
          </div>` + prev
        );
      }, 100);
    } finally {
      setIsAIGenerating(false);
    }
  };

  // Category Co-Pilot AI Generator (static templates — fallback)
  const handleAICoPilotGenerate = () => {
    const kw = categoryKeyword.trim() || "Thì Hiện Tại Đơn";
    let templateText = "";
    
    if (selectedSubject === "grammar") {
      setTitle(`Ngữ Pháp: ${kw}`);
      setSubtitle("Văn phạm");
      const isCond2 = /conditional\s*type\s*2|câu\s*điều\s*kiện\s*loại\s*2|type\s*2|loại\s*2/i.test(kw);
      const isPassive = /passive|bị\s*động/i.test(kw);

      if (isCond2) {
        templateText = `<h3>📘 Công Thức & Sơ Đồ Ngữ Pháp: Câu Điều Kiện Loại 2 (Conditional Type 2)</h3>
<div style="background: rgba(59,130,246,0.1); border: 2px dashed #3b82f6; padding: 14px; border-radius: 14px; font-weight: bold; margin-bottom: 14px; line-height: 1.6;">
⚡ SƠ ĐỒ CẤU TRÚC: <span style="color: #2563eb; font-size: 15px;">[ If + S + V-past (were), S + would / could / might + V-bare ]</span><br/>
👉 <b>Cách dùng:</b> Diễn tả giả định <b>không có thật ở hiện tại</b> hoặc trái ngược với thực tế.<br/>
⚠️ <b>Lưu ý:</b> Động từ "to be" ở mệnh đề If luôn dùng <b>WERE</b> cho tất cả các ngôi (I, he, she, it...).
</div>

<h4>💡 Ví Dụ Minh Họa (Illustrative Examples):</h4>
• If I {had} a lot of money, I {would buy} a luxury sports car.<br/>
• If she {were} here right now, she {would solve} this problem.<br/>
• If they {lived} in Paris, they {could speak} French fluently.<br/><br/>

<h4>📝 Bài Tập Thực Hành Ôn Tập Ngay Tại Lớp:</h4>
1. If I {won} the lottery, I {would travel} around the world.<br/>
2. If he {knew} her phone number, he {would call} her immediately.<br/>
3. If we {were} rich, we {would buy} a big villa near the beach.<br/>
4. If she {studied} harder, she {would pass} the exam easily.`;
      } else if (isPassive) {
        templateText = `<h3>📘 Công Thức & Sơ Đồ Ngữ Pháp: Câu Bị Động (Passive Voice)</h3>
<div style="background: rgba(59,130,246,0.1); border: 2px dashed #3b82f6; padding: 14px; border-radius: 14px; font-weight: bold; margin-bottom: 14px; line-height: 1.6;">
⚡ SƠ ĐỒ CẤU TRÚC: <span style="color: #2563eb; font-size: 15px;">[ Subject + Be + V-past participle (V3/ed) + (by Object) ]</span><br/>
👉 <b>Cách dùng:</b> Nhấn mạnh vào đối tượng chịu tác động của hành động.
</div>

<h4>💡 Ví Dụ Minh Họa (Illustrative Examples):</h4>
• The new bridge {was built} by engineers last year.<br/>
• English {is spoken} all over the world.<br/><br/>

<h4>📝 Bài Tập Thực Hành Ôn Tập Ngay Tại Lớp:</h4>
1. The report {was submitted} by the manager yesterday.<br/>
2. Millions of emails {are sent} every minute.<br/>
3. The novel {was written} by a famous author.`;
      } else {
        templateText = `<h3>📘 Công Thức & Sơ Đồ Ngữ Pháp: ${kw}</h3>
<div style="background: rgba(59,130,246,0.1); border: 2px dashed #3b82f6; padding: 14px; border-radius: 14px; font-weight: bold; text-align: center; margin-bottom: 14px;">
⚡ SƠ ĐỒ CẤU TRÚC: [ Subject + Verb + Object ]<br/>
👉 Dùng để áp dụng cấu trúc ngữ pháp ${kw} trong giao tiếp & viết luận.
</div>

<h4>💡 Ví Dụ Minh Họa (Illustrative Examples):</h4>
• She {works} at an international company.<br/>
• They always {achieve} great results.<br/><br/>

<h4>📝 Bài Tập Thực Hành Ôn Tập Ngay Tại Lớp:</h4>
1. She always {goes} to work early.<br/>
2. My brother {likes} learning English.<br/>
3. They {live} in New York.`;
      }
    } else if (selectedSubject === "vocab") {
      setTitle(`Từ Vựng: ${kw}`);
      setSubtitle("Từ vựng");
      const isFurniture = /furniture|đồ\s*đạc|nhà|house|room|living|bedroom|kitchen/i.test(kw);

      if (isFurniture) {
        templateText = `<h3>🏡 Bảng Từ Vựng Minh Họa: Đồ Đạc Trong Nhà (House Furniture & Rooms)</h3>
<div style="background: rgba(16,185,129,0.08); border: 2px solid #10b981; padding: 16px; border-radius: 16px; margin-bottom: 16px;">
  <p style="font-weight: bold; color: #059669; font-size: 15px; margin-bottom: 8px;">
    🛋️ 1. Phòng Khách (Living Room)
  </p>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 14px;">
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
      🛋️ <b>Sofa</b> <span style="color: #2563eb;">/ˈsəʊ.fə/</span> 🔊<br/>
      <i>(Ghế sofa dài phòng khách)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
      📺 <b>Television</b> <span style="color: #2563eb;">/ˈtel.ɪ.vɪʒ.ən/</span> 🔊<br/>
      <i>(Tivi chiếu phim)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
      ☕ <b>Coffee Table</b> <span style="color: #2563eb;">/ˈkɒf.i ˈteɪ.bl̩/</span> 🔊<br/>
      <i>(Bàn trà uống nước)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
      🪑 <b>Armchair</b> <span style="color: #2563eb;">/ˈɑːm.tʃeə/</span> 🔊<br/>
      <i>(Ghế bành thư giãn)</i>
    </div>
  </div>

  <p style="font-weight: bold; color: #059669; font-size: 15px; margin-bottom: 8px;">
    🍽️ 2. Phòng Ăn & Nhà Bếp (Kitchen & Dining Room)
  </p>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 14px;">
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
      🧊 <b>Refrigerator</b> <span style="color: #2563eb;">/rɪˈfrɪdʒ.ə.reɪ.tə/</span> 🔊<br/>
      <i>(Tủ lạnh giữ tươi thực phẩm)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
      🍽️ <b>Dining Table</b> <span style="color: #2563eb;">/ˈdaɪ.nɪŋ ˈteɪ.bl̩/</span> 🔊<br/>
      <i>(Bàn ăn gia đình)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
      ♨️ <b>Microwave</b> <span style="color: #2563eb;">/ˈmaɪ.krə.weɪv/</span> 🔊<br/>
      <i>(Lò vi sóng hâm nóng đồ ăn)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
      🗄️ <b>Cupboard</b> <span style="color: #2563eb;">/ˈkʌb.əd/</span> 🔊<br/>
      <i>(Tủ đựng bát đĩa bếp)</i>
    </div>
  </div>

  <p style="font-weight: bold; color: #059669; font-size: 15px; margin-bottom: 8px;">
    🛏️ 3. Phòng Ngủ (Bedroom Furniture)
  </p>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 14px;">
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
      👗 <b>Wardrobe</b> <span style="color: #2563eb;">/ˈwɔː.drəʊb/</span> 🔊<br/>
      <i>(Tủ treo quần áo)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
      🛏️ <b>Bedside Table</b> <span style="color: #2563eb;">/ˈbed.saɪd ˈteɪ.bl̩/</span> 🔊<br/>
      <i>(Bàn nhỏ đầu giường)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
      🪞 <b>Dressing Table</b> <span style="color: #2563eb;">/ˈdres.ɪŋ ˈteɪ.bl̩/</span> 🔊<br/>
      <i>(Bàn trang điểm)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
      🛌 <b>Mattress</b> <span style="color: #2563eb;">/ˈmæt.rəs/</span> 🔊<br/>
      <i>(Nệm/Đệm lò xơ nằm ngủ)</i>
    </div>
  </div>

  <p style="font-weight: bold; color: #059669; font-size: 15px; margin-bottom: 8px;">
    🛁 4. Phòng Tắm & Toilet (Bathroom & Toilet)
  </p>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
      𚰽 <b>Washbasin</b> <span style="color: #2563eb;">/ˈwɒʃ.beɪ.sən/</span> 🔊<br/>
      <i>(Bồn rửa mặt)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
      🛁 <b>Bathtub</b> <span style="color: #2563eb;">/ˈbɑːθ.tʌb/</span> 🔊<br/>
      <i>(Bồn tắm thư giãn)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
      🪞 <b>Mirror</b> <span style="color: #2563eb;">/ˈmɪr.ə/</span> 🔊<br/>
      <i>(Gương soi treo tường)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
      🚿 <b>Shower</b> <span style="color: #2563eb;">/ˈʃaʊ.ə/</span> 🔊<br/>
      <i>(Vòi hoa sen)</i>
    </div>
  </div>
</div>

<h4>📝 Bài Tập Áp Dụng Từ Vựng Thực Tế:</h4>
1. We keep our fresh milk and fruits inside the {refrigerator}.<br/>
2. She hangs all her coats and dresses in the wooden {wardrobe}.<br/>
3. They sat together on the comfortable {sofa} in the living room to watch TV.<br/>
4. Wash your hands at the {washbasin} before having dinner.`;
      } else {
        const isLaw = /law|legal|court|crime|justice|pháp\s*luật/i.test(kw);
        const isEcon = /econom|finance|gdp|inflation|stock|market|banking|investment/i.test(kw);
        const isHistory = /history|civilization|ancient|historical|lịch\s*sử/i.test(kw);
        const isIllness = /illness|disease|symptom|hospital|doctor|medical|bệnh/i.test(kw);
        const isPersonality = /emotion|feeling|personality|describing|character|mood|adjective|cảm\s*xúc|tính\s*cách/i.test(kw);

        // Helper: TTS button HTML (works via inline onclick in dangerouslySetInnerHTML)
        const tts = (word: string) =>
          `<button onclick="window.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance('${word}');u.lang='en-US';window.speechSynthesis.speak(u);" style="background:rgba(37,99,235,0.12);border:1px solid rgba(37,99,235,0.3);color:#2563eb;border-radius:6px;padding:1px 7px;font-size:11px;cursor:pointer;margin-left:4px;font-weight:bold;" title="Nghe phát âm ${word}">🔊</button>`;

        if (isPersonality) {
          templateText = `<h3 style="font-size:18px;font-weight:900;margin-bottom:10px;">😊 Bảng Từ Vựng A-Z: ${kw}</h3>
<div style="font-family:'Trebuchet MS',sans-serif;font-size:14px;background:rgba(16,185,129,0.06);border:2px solid #10b981;border-radius:16px;padding:16px;margin-bottom:12px;">
<p style="font-size:13px;font-weight:bold;color:#059669;margin-bottom:10px;letter-spacing:1px;">
  <a href="#pA" style="color:#059669;text-decoration:none;">A</a> !
  <a href="#pB" style="color:#059669;text-decoration:none;">B</a> !
  <a href="#pC" style="color:#059669;text-decoration:none;">C</a> !
  <a href="#pD" style="color:#059669;text-decoration:none;">D</a> !
  <a href="#pE" style="color:#059669;text-decoration:none;">E</a> !
  <a href="#pF" style="color:#059669;text-decoration:none;">F</a> !
  <a href="#pG" style="color:#059669;text-decoration:none;">G</a> !
  <a href="#pH" style="color:#059669;text-decoration:none;">H</a> !
  <a href="#pI" style="color:#059669;text-decoration:none;">I</a> !
  <a href="#pJ" style="color:#059669;text-decoration:none;">J</a> !
  <a href="#pK" style="color:#059669;text-decoration:none;">K</a> !
  <a href="#pL" style="color:#059669;text-decoration:none;">L</a> !
  <a href="#pM" style="color:#059669;text-decoration:none;">M</a> !
  <a href="#pN" style="color:#059669;text-decoration:none;">N</a> !
  <a href="#pO" style="color:#059669;text-decoration:none;">O</a> !
  <a href="#pP" style="color:#059669;text-decoration:none;">P</a> !
  <a href="#pQ" style="color:#059669;text-decoration:none;">Q</a> !
  <a href="#pR" style="color:#059669;text-decoration:none;">R</a> !
  <a href="#pS" style="color:#059669;text-decoration:none;">S</a> !
  <a href="#pT" style="color:#059669;text-decoration:none;">T</a> !
  <a href="#pU" style="color:#059669;text-decoration:none;">U</a> !
  <a href="#pV" style="color:#059669;text-decoration:none;">V</a> !
  <a href="#pW" style="color:#059669;text-decoration:none;">W</a> !
  <a href="#pZ" style="color:#059669;text-decoration:none;">Z</a>
</p>

<a name="pA"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">A</p>
<b>above-board</b> ${tts("above-board")} <span style="color:#cc3366;">/əˌbʌv ˈbɔːd/</span>: <span style="color:#0369a1;">thẳng thắn, không giấu giếm</span><br/>
<b>active</b> ${tts("active")} <span style="color:#cc3366;">/ˈæk.tɪv/</span>: <span style="color:#0369a1;">tích cực, nhanh nhẹn, lanh lợi</span><br/>
<b>adaptable</b> ${tts("adaptable")} <span style="color:#cc3366;">/əˈdæp.tə.bəl/</span>: <span style="color:#0369a1;">có thể thích nghi, có thể thích ứng</span><br/>
<b>adorable</b> ${tts("adorable")} <span style="color:#cc3366;">/əˈdɔː.rə.bəl/</span>: <span style="color:#0369a1;">đáng yêu, đáng quý mến</span><br/>
<b>affectionate</b> ${tts("affectionate")} <span style="color:#cc3366;">/əˈfek.ʃən.ɪt/</span>: <span style="color:#0369a1;">thân mật, trìu mến</span><br/>
<b>aggressive</b> ${tts("aggressive")} <span style="color:#cc3366;">/əˈɡres.ɪv/</span>: <span style="color:#0369a1;">hung hăng / tháo vát, xông xáo</span><br/>
<b>alert</b> ${tts("alert")} <span style="color:#cc3366;">/əˈlɜːt/</span>: <span style="color:#0369a1;">cảnh giác, lanh lợi, tỉnh táo</span><br/>
<b>ambitious</b> ${tts("ambitious")} <span style="color:#cc3366;">/æmˈbɪʃ.əs/</span>: <span style="color:#0369a1;">có tham vọng, đầy hoài bão</span><br/>
<b>amused</b> ${tts("amused")} <span style="color:#cc3366;">/əˈmjuːzd/</span>: <span style="color:#0369a1;">thích thú, vui, buồn cười</span><br/>
<b>angry</b> ${tts("angry")} <span style="color:#cc3366;">/ˈæŋ.ɡri/</span>: <span style="color:#0369a1;">giận dữ, tức giận, cáu</span><br/>
<b>arrogant</b> ${tts("arrogant")} <span style="color:#cc3366;">/ˈær.ə.ɡənt/</span>: <span style="color:#0369a1;">kiêu căng, kiêu ngạo, ngạo mạn</span><br/>
<b>ashamed</b> ${tts("ashamed")} <span style="color:#cc3366;">/əˈʃeɪmd/</span>: <span style="color:#0369a1;">xấu hổ, hổ thẹn, ngượng</span><br/>

<a name="pB"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">B</p>
<b>bad-tempered</b> ${tts("bad tempered")} <span style="color:#cc3366;">/ˌbæd ˈtem.pəd/</span>: <span style="color:#0369a1;">hay cáu, xấu tính, dễ nổi nóng</span><br/>
<b>bossy</b> ${tts("bossy")} <span style="color:#cc3366;">/ˈbɒs.i/</span>: <span style="color:#0369a1;">hống hách, hách dịch</span><br/>
<b>brave</b> ${tts("brave")} <span style="color:#cc3366;">/breɪv/</span>: <span style="color:#0369a1;">gan dạ, dũng cảm, can đảm</span><br/>
<b>bright</b> ${tts("bright")} <span style="color:#cc3366;">/braɪt/</span>: <span style="color:#0369a1;">sáng dạ, thông minh, nhanh trí</span><br/>

<a name="pC"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">C</p>
<b>calm</b> ${tts("calm")} <span style="color:#cc3366;">/kɑːm/</span>: <span style="color:#0369a1;">bình tĩnh, điềm tĩnh</span><br/>
<b>capable</b> ${tts("capable")} <span style="color:#cc3366;">/ˈkeɪ.pə.bəl/</span>: <span style="color:#0369a1;">có năng lực, thạo, giỏi, có khả năng</span><br/>
<b>careful</b> ${tts("careful")} <span style="color:#cc3366;">/ˈkeə.fəl/</span>: <span style="color:#0369a1;">cẩn thận, thận trọng, biết giữ gìn</span><br/>
<b>careless</b> ${tts("careless")} <span style="color:#cc3366;">/ˈkeə.ləs/</span>: <span style="color:#0369a1;">bất cẩn, sơ suất, lơ đễnh, cẩu thả</span><br/>
<b>charming</b> ${tts("charming")} <span style="color:#cc3366;">/ˈtʃɑː.mɪŋ/</span>: <span style="color:#0369a1;">đẹp, duyên dáng, yêu kiều</span><br/>
<b>cheerful</b> ${tts("cheerful")} <span style="color:#cc3366;">/ˈtʃɪə.fəl/</span>: <span style="color:#0369a1;">vui mừng, hớn hở, tươi cười, phấn khởi</span><br/>
<b>clever</b> ${tts("clever")} <span style="color:#cc3366;">/ˈklev.ər/</span>: <span style="color:#0369a1;">thông minh, lanh lợi</span><br/>
<b>confident</b> ${tts("confident")} <span style="color:#cc3366;">/ˈkɒn.fɪ.dənt/</span>: <span style="color:#0369a1;">tự tin, tin tưởng</span><br/>
<b>considerate</b> ${tts("considerate")} <span style="color:#cc3366;">/kənˈsɪd.ər.ɪt/</span>: <span style="color:#0369a1;">thận trọng, chu đáo, ý tứ</span><br/>
<b>creative</b> ${tts("creative")} <span style="color:#cc3366;">/kriˈeɪ.tɪv/</span>: <span style="color:#0369a1;">sáng tạo</span><br/>
<b>curious</b> ${tts("curious")} <span style="color:#cc3366;">/ˈkjʊə.ri.əs/</span>: <span style="color:#0369a1;">tò mò, hiếu kỳ / ham biết, muốn tìm hiểu</span><br/>
<b>cynical</b> ${tts("cynical")} <span style="color:#cc3366;">/ˈsɪn.ɪ.kəl/</span>: <span style="color:#0369a1;">hay hoài nghi, hay chỉ trích cay độc</span><br/>

<a name="pD"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">D</p>
<b>daring</b> ${tts("daring")} <span style="color:#cc3366;">/ˈdeər.ɪŋ/</span>: <span style="color:#0369a1;">táo bạo, cả gan, liều lĩnh</span><br/>
<b>decisive</b> ${tts("decisive")} <span style="color:#cc3366;">/dɪˈsaɪ.sɪv/</span>: <span style="color:#0369a1;">kiên quyết, quả quyết, dứt khoát</span><br/>
<b>depressed</b> ${tts("depressed")} <span style="color:#cc3366;">/dɪˈprest/</span>: <span style="color:#0369a1;">chán nản, thất vọng, phiền muộn</span><br/>
<b>determined</b> ${tts("determined")} <span style="color:#cc3366;">/dɪˈtɜː.mɪnd/</span>: <span style="color:#0369a1;">nhất quyết, kiên quyết, quả quyết</span><br/>
<b>diligent</b> ${tts("diligent")} <span style="color:#cc3366;">/ˈdɪl.ɪ.dʒənt/</span>: <span style="color:#0369a1;">siêng năng, cần cù, mẫn cán</span><br/>
<b>dynamic</b> ${tts("dynamic")} <span style="color:#cc3366;">/daɪˈnæm.ɪk/</span>: <span style="color:#0369a1;">năng động, năng nổ, sôi nổi</span><br/>

<a name="pE"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">E</p>
<b>eager</b> ${tts("eager")} <span style="color:#cc3366;">/ˈiː.ɡər/</span>: <span style="color:#0369a1;">háo hức, thiết tha, hăm hở</span><br/>
<b>efficient</b> ${tts("efficient")} <span style="color:#cc3366;">/ɪˈfɪʃ.ənt/</span>: <span style="color:#0369a1;">có năng lực, có khả năng</span><br/>
<b>elegant</b> ${tts("elegant")} <span style="color:#cc3366;">/ˈel.ɪ.ɡənt/</span>: <span style="color:#0369a1;">thanh lịch, tao nhã</span><br/>
<b>energetic</b> ${tts("energetic")} <span style="color:#cc3366;">/ˌen.əˈdʒet.ɪk/</span>: <span style="color:#0369a1;">đầy nghị lực, mạnh mẽ, đầy năng lượng</span><br/>
<b>enthusiastic</b> ${tts("enthusiastic")} <span style="color:#cc3366;">/ɪnˌθjuː.ziˈæs.tɪk/</span>: <span style="color:#0369a1;">hăng hái, say mê, nhiệt tình</span><br/>
<b>easy-going</b> ${tts("easygoing")} <span style="color:#cc3366;">/ˌiː.ziˈɡəʊ.ɪŋ/</span>: <span style="color:#0369a1;">dễ tính</span><br/>
<b>excited</b> ${tts("excited")} <span style="color:#cc3366;">/ɪkˈsaɪ.tɪd/</span>: <span style="color:#0369a1;">sôi nổi, hào hứng, bị kích động</span><br/>
<b>extroverted</b> ${tts("extroverted")} <span style="color:#cc3366;">/ˈek.strə.vɜːt.ɪd/</span>: <span style="color:#0369a1;">hướng ngoại</span><br/>

<a name="pF"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">F</p>
<b>fair</b> ${tts("fair")} <span style="color:#cc3366;">/feər/</span>: <span style="color:#0369a1;">công bằng, ngay thẳng, không gian lận</span><br/>
<b>faithful</b> ${tts("faithful")} <span style="color:#cc3366;">/ˈfeɪθ.fəl/</span>: <span style="color:#0369a1;">trung thành, chung thủy, trung thực</span><br/>
<b>friendly</b> ${tts("friendly")} <span style="color:#cc3366;">/ˈfrend.li/</span>: <span style="color:#0369a1;">thân thiện, thân mật, giao hữu</span><br/>
<b>furious</b> ${tts("furious")} <span style="color:#cc3366;">/ˈfjʊər.i.əs/</span>: <span style="color:#0369a1;">giận dữ, điên tiết</span><br/>

<a name="pG"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">G</p>
<b>generous</b> ${tts("generous")} <span style="color:#cc3366;">/ˈdʒen.ər.əs/</span>: <span style="color:#0369a1;">rộng lượng, hào phóng, khoan hồng</span><br/>
<b>gentle</b> ${tts("gentle")} <span style="color:#cc3366;">/ˈdʒen.tl/</span>: <span style="color:#0369a1;">hiền lành, dịu dàng, nhẹ nhàng, hòa nhã</span><br/>
<b>greedy</b> ${tts("greedy")} <span style="color:#cc3366;">/ˈɡriː.di/</span>: <span style="color:#0369a1;">tham lam</span><br/>

<a name="pH"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">H</p>
<b>happy</b> ${tts("happy")} <span style="color:#cc3366;">/ˈhæp.i/</span>: <span style="color:#0369a1;">vui sướng, hạnh phúc, sung sướng</span><br/>
<b>helpful</b> ${tts("helpful")} <span style="color:#cc3366;">/ˈhelp.fəl/</span>: <span style="color:#0369a1;">có ích, giúp ích, hữu ích</span><br/>
<b>honest</b> ${tts("honest")} <span style="color:#cc3366;">/ˈɒn.ɪst/</span>: <span style="color:#0369a1;">thật thà, lương thiện, chân thật</span><br/>
<b>humble</b> ${tts("humble")} <span style="color:#cc3366;">/ˈhʌm.bəl/</span>: <span style="color:#0369a1;">khiêm tốn, nhún nhường</span><br/>
<b>humorous</b> ${tts("humorous")} <span style="color:#cc3366;">/ˈhjuː.mər.əs/</span>: <span style="color:#0369a1;">khôi hài, hài hước, hóm hỉnh</span><br/>

<a name="pI"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">I</p>
<b>imaginative</b> ${tts("imaginative")} <span style="color:#cc3366;">/ɪˈmædʒ.ɪ.nə.tɪv/</span>: <span style="color:#0369a1;">giàu trí tưởng tượng</span><br/>
<b>industrious</b> ${tts("industrious")} <span style="color:#cc3366;">/ɪnˈdʌs.tri.əs/</span>: <span style="color:#0369a1;">cần cù, siêng năng</span><br/>
<b>intelligent</b> ${tts("intelligent")} <span style="color:#cc3366;">/ɪnˈtel.ɪ.dʒənt/</span>: <span style="color:#0369a1;">thông minh, sáng dạ, nhanh trí</span><br/>
<b>introverted</b> ${tts("introverted")} <span style="color:#cc3366;">/ˈɪn.trə.vɜː.tɪd/</span>: <span style="color:#0369a1;">hướng nội, nhút nhát</span><br/>

<a name="pJ"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">J</p>
<b>jealous</b> ${tts("jealous")} <span style="color:#cc3366;">/ˈdʒel.əs/</span>: <span style="color:#0369a1;">ghen tị, ghen ghét, đố kỵ</span><br/>
<b>jolly</b> ${tts("jolly")} <span style="color:#cc3366;">/ˈdʒɒl.i/</span>: <span style="color:#0369a1;">vui vẻ, vui tươi</span><br/>

<a name="pK"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">K</p>
<b>kind</b> ${tts("kind")} <span style="color:#cc3366;">/kaɪnd/</span>: <span style="color:#0369a1;">tử tế, ân cần, có lòng tốt</span><br/>
<b>kind-hearted</b> ${tts("kind-hearted")} <span style="color:#cc3366;">/ˌkaɪnd ˈhɑːt.ɪd/</span>: <span style="color:#0369a1;">tốt bụng</span><br/>
<b>knowledgeable</b> ${tts("knowledgeable")} <span style="color:#cc3366;">/ˈnɒl.ɪdʒ.ə.bəl/</span>: <span style="color:#0369a1;">thành thạo, am tường, am hiểu</span><br/>

<a name="pL"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">L</p>
<b>lazy</b> ${tts("lazy")} <span style="color:#cc3366;">/ˈleɪ.zi/</span>: <span style="color:#0369a1;">lười biếng</span><br/>
<b>lively</b> ${tts("lively")} <span style="color:#cc3366;">/ˈlaɪv.li/</span>: <span style="color:#0369a1;">vui vẻ, hoạt bát, năng nổ, sôi nổi</span><br/>
<b>loyal</b> ${tts("loyal")} <span style="color:#cc3366;">/ˈlɔɪ.əl/</span>: <span style="color:#0369a1;">trung thành, trung nghĩa, chung thủy</span><br/>

<a name="pM"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">M</p>
<b>mature</b> ${tts("mature")} <span style="color:#cc3366;">/məˈtjʊər/</span>: <span style="color:#0369a1;">chín chắn, sung mãn, trưởng thành</span><br/>
<b>merciful</b> ${tts("merciful")} <span style="color:#cc3366;">/ˈmɜː.sɪ.fəl/</span>: <span style="color:#0369a1;">nhân từ, khoan dung</span><br/>
<b>mischievous</b> ${tts("mischievous")} <span style="color:#cc3366;">/ˈmɪs.tʃɪ.vəs/</span>: <span style="color:#0369a1;">tinh nghịch, tinh quái, ranh mãnh</span><br/>

<a name="pN"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">N</p>
<b>naive</b> ${tts("naive")} <span style="color:#cc3366;">/nɑːˈiːv/</span>: <span style="color:#0369a1;">ngây thơ, chất phác</span><br/>
<b>nice</b> ${tts("nice")} <span style="color:#cc3366;">/naɪs/</span>: <span style="color:#0369a1;">xinh đẹp, dễ thương, tốt, đẹp</span><br/>

<a name="pO"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">O</p>
<b>obedient</b> ${tts("obedient")} <span style="color:#cc3366;">/əˈbiː.di.ənt/</span>: <span style="color:#0369a1;">biết nghe lời, ngoan ngoãn, dễ bảo</span><br/>
<b>optimistic</b> ${tts("optimistic")} <span style="color:#cc3366;">/ˌɒp.tɪˈmɪs.tɪk/</span>: <span style="color:#0369a1;">lạc quan</span><br/>
<b>outgoing</b> ${tts("outgoing")} <span style="color:#cc3366;">/ˈaʊt.ɡəʊ.ɪŋ/</span>: <span style="color:#0369a1;">hướng ngoại, thân thiện</span><br/>

<a name="pP"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">P</p>
<b>patient</b> ${tts("patient")} <span style="color:#cc3366;">/ˈpeɪ.ʃənt/</span>: <span style="color:#0369a1;">kiên nhẫn, nhẫn nại, bền chí</span><br/>
<b>pessimistic</b> ${tts("pessimistic")} <span style="color:#cc3366;">/ˌpes.ɪˈmɪs.tɪk/</span>: <span style="color:#0369a1;">bi quan</span><br/>
<b>polite</b> ${tts("polite")} <span style="color:#cc3366;">/pəˈlaɪt/</span>: <span style="color:#0369a1;">lịch sự, có lễ độ, lịch thiệp</span><br/>
<b>proud</b> ${tts("proud")} <span style="color:#cc3366;">/praʊd/</span>: <span style="color:#0369a1;">tự hào, hãnh diện, tự trọng</span><br/>

<a name="pQ"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">Q</p>
<b>quiet</b> ${tts("quiet")} <span style="color:#cc3366;">/ˈkwaɪ.ɪt/</span>: <span style="color:#0369a1;">trầm lặng, ít nói, hòa nhã</span><br/>

<a name="pR"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">R</p>
<b>rational</b> ${tts("rational")} <span style="color:#cc3366;">/ˈræʃ.ən.əl/</span>: <span style="color:#0369a1;">có lý trí, có chừng mực</span><br/>
<b>reliable</b> ${tts("reliable")} <span style="color:#cc3366;">/rɪˈlaɪ.ə.bəl/</span>: <span style="color:#0369a1;">đáng tin cậy, chắc chắn</span><br/>
<b>responsible</b> ${tts("responsible")} <span style="color:#cc3366;">/rɪˈspɒn.sə.bəl/</span>: <span style="color:#0369a1;">có trách nhiệm, đáng tin cậy</span><br/>
<b>romantic</b> ${tts("romantic")} <span style="color:#cc3366;">/rəʊˈmæn.tɪk/</span>: <span style="color:#0369a1;">lãng mạn, mơ mộng</span><br/>

<a name="pS"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">S</p>
<b>selfish</b> ${tts("selfish")} <span style="color:#cc3366;">/ˈsel.fɪʃ/</span>: <span style="color:#0369a1;">ích kỷ</span><br/>
<b>sensitive</b> ${tts("sensitive")} <span style="color:#cc3366;">/ˈsen.sɪ.tɪv/</span>: <span style="color:#0369a1;">nhạy cảm, dễ bị xúc phạm</span><br/>
<b>sincere</b> ${tts("sincere")} <span style="color:#cc3366;">/sɪnˈsɪər/</span>: <span style="color:#0369a1;">thật thà, chân thành, thẳng thắn</span><br/>
<b>sociable</b> ${tts("sociable")} <span style="color:#cc3366;">/ˈsəʊ.ʃə.bəl/</span>: <span style="color:#0369a1;">dễ gần gũi, hòa đồng, thích giao du</span><br/>
<b>stubborn</b> ${tts("stubborn")} <span style="color:#cc3366;">/ˈstʌb.ən/</span>: <span style="color:#0369a1;">bướng bỉnh, ương ngạnh, ngoan cố</span><br/>
<b>sympathetic</b> ${tts("sympathetic")} <span style="color:#cc3366;">/ˌsɪm.pəˈθet.ɪk/</span>: <span style="color:#0369a1;">thông cảm, đồng cảm, đáng mến</span><br/>

<a name="pT"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">T</p>
<b>talented</b> ${tts("talented")} <span style="color:#cc3366;">/ˈtæl.ən.tɪd/</span>: <span style="color:#0369a1;">có tài, có khiếu</span><br/>
<b>thoughtful</b> ${tts("thoughtful")} <span style="color:#cc3366;">/ˈθɔːt.fəl/</span>: <span style="color:#0369a1;">có suy nghĩ, chín chắn / chu đáo, ân cần</span><br/>
<b>trustworthy</b> ${tts("trustworthy")} <span style="color:#cc3366;">/ˈtrʌst.wɜː.ði/</span>: <span style="color:#0369a1;">đáng tin cậy</span><br/>

<a name="pU"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">U</p>
<b>understanding</b> ${tts("understanding")} <span style="color:#cc3366;">/ˌʌn.dəˈstæn.dɪŋ/</span>: <span style="color:#0369a1;">hiểu biết, thông cảm</span><br/>
<b>upbeat</b> ${tts("upbeat")} <span style="color:#cc3366;">/ˈʌp.biːt/</span>: <span style="color:#0369a1;">lạc quan, vui vẻ</span><br/>

<a name="pV"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">V</p>
<b>vigorous</b> ${tts("vigorous")} <span style="color:#cc3366;">/ˈvɪɡ.ər.əs/</span>: <span style="color:#0369a1;">hoạt bát, đầy sinh lực, mạnh khỏe</span><br/>
<b>vivacious</b> ${tts("vivacious")} <span style="color:#cc3366;">/vɪˈveɪ.ʃəs/</span>: <span style="color:#0369a1;">sôi nổi, hoạt bát, lanh lợi</span><br/>

<a name="pW"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">W</p>
<b>warm</b> ${tts("warm")} <span style="color:#cc3366;">/wɔːm/</span>: <span style="color:#0369a1;">nồng nhiệt, nhiệt tình</span><br/>
<b>wise</b> ${tts("wise")} <span style="color:#cc3366;">/waɪz/</span>: <span style="color:#0369a1;">khôn ngoan, sáng suốt / uyên thâm, thông thái</span><br/>
<b>witty</b> ${tts("witty")} <span style="color:#cc3366;">/ˈwɪt.i/</span>: <span style="color:#0369a1;">hóm hỉnh, dí dỏm</span><br/>
<b>worried</b> ${tts("worried")} <span style="color:#cc3366;">/ˈwʌr.id/</span>: <span style="color:#0369a1;">bồn chồn, lo nghĩ, lo lắng</span><br/>

<a name="pZ"></a><p style="font-weight:900;color:#1d4ed8;font-size:15px;border-bottom:2px solid #10b981;padding-bottom:4px;margin:10px 0 6px 0;">Z</p>
<b>zealous</b> ${tts("zealous")} <span style="color:#cc3366;">/ˈzel.əs/</span>: <span style="color:#0369a1;">sốt sắng, hăng hái, có nhiệt tâm, có nhiệt huyết</span><br/>
</div>

<h4>📝 Bài Tập Thực Hành — Điền Từ Đúng Vào Ô Trống:</h4>
1. She is very {kind} and always helps her classmates without being asked.<br/>
2. He remained {calm} during the argument instead of losing his temper.<br/>
3. A {diligent} student studies regularly and never misses deadlines.<br/>
4. Be {confident} in yourself — you have the knowledge and skills to succeed.<br/>
5. Tom is so {stubborn} that he never admits when he is wrong.`;
        } else if (isLaw) {
          templateText = `<h3>⚖️ Từ Vựng Pháp Luật (Law & Legal Vocabulary): ${kw}</h3>
<div style="background: rgba(99,102,241,0.08); border: 2px solid #6366f1; padding: 16px; border-radius: 16px; margin-bottom: 16px;">
  <p style="font-weight: bold; color: #4f46e5; font-size: 15px; margin-bottom: 8px;">⚖️ Court & Justice (Tòa Án & Công Lý)</p>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 14px;">
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(99,102,241,0.3);">
      ⚖️ <b>Defendant</b> <span style="color: #2563eb;">/dɪˈfen.dənt/</span> 🔊<br/><i>(Bị cáo / Người bị kiện)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(99,102,241,0.3);">
      👩‍⚖️ <b>Plaintiff</b> <span style="color: #2563eb;">/ˈpleɪn.tɪf/</span> 🔊<br/><i>(Nguyên đơn / Người khởi kiện)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(99,102,241,0.3);">
      🔨 <b>Verdict</b> <span style="color: #2563eb;">/ˈvɜː.dɪkt/</span> 🔊<br/><i>(Phán quyết của tòa án)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(99,102,241,0.3);">
      📜 <b>Legislation</b> <span style="color: #2563eb;">/ˌledʒ.ɪˈsleɪ.ʃən/</span> 🔊<br/><i>(Pháp chế / Luật pháp thành văn)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(99,102,241,0.3);">
      🚔 <b>Prosecution</b> <span style="color: #2563eb;">/ˌprɒs.ɪˈkjuː.ʃən/</span> 🔊<br/><i>(Bên công tố / Truy tố)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(99,102,241,0.3);">
      🏛️ <b>Jurisdiction</b> <span style="color: #2563eb;">/ˌdʒʊər.ɪsˈdɪk.ʃən/</span> 🔊<br/><i>(Thẩm quyền xét xử)</i>
    </div>
  </div>
</div>
<h4>📝 Bài Tập Điền Từ Pháp Luật:</h4>
1. The {defendant} was found not guilty by the jury after a three-week trial.<br/>
2. The court issued its final {verdict} after reviewing all the evidence.<br/>
3. New {legislation} was passed to protect workers' rights across the country.<br/>
4. The {plaintiff} filed a civil lawsuit against the company for breach of contract.`;
        } else if (isEcon) {
          templateText = `<h3>📊 Từ Vựng Kinh Tế (Economics & Finance): ${kw}</h3>
<div style="background: rgba(245,158,11,0.08); border: 2px solid #f59e0b; padding: 16px; border-radius: 16px; margin-bottom: 16px;">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 14px;">
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(245,158,11,0.3);">
      📈 <b>GDP</b> <span style="color: #2563eb;">/ˌdʒiːdiːˈpiː/</span> 🔊<br/><i>(Gross Domestic Product - Tổng sản phẩm quốc nội)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(245,158,11,0.3);">
      📉 <b>Inflation</b> <span style="color: #2563eb;">/ɪnˈfleɪ.ʃən/</span> 🔊<br/><i>(Lạm phát - Tăng giá hàng hoá)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(245,158,11,0.3);">
      🏦 <b>Interest Rate</b> <span style="color: #2563eb;">/ˈɪn.trəst reɪt/</span> 🔊<br/><i>(Lãi suất ngân hàng)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(245,158,11,0.3);">
      💹 <b>Recession</b> <span style="color: #2563eb;">/rɪˈseʃ.ən/</span> 🔊<br/><i>(Suy thoái kinh tế)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(245,158,11,0.3);">
      🛒 <b>Supply & Demand</b> <span style="color: #2563eb;">/səˈplaɪ ænd dɪˈmɑːnd/</span> 🔊<br/><i>(Cung và cầu - Quy luật thị trường)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(245,158,11,0.3);">
      📋 <b>Budget Deficit</b> <span style="color: #2563eb;">/ˈbʌdʒ.ɪt ˈdef.ɪ.sɪt/</span> 🔊<br/><i>(Thâm hụt ngân sách)</i>
    </div>
  </div>
</div>
<h4>📝 Bài Tập Điền Từ Kinh Tế:</h4>
1. Rising {inflation} has made everyday goods much more expensive for consumers.<br/>
2. The country's {GDP} grew by 6.5% last year due to strong export performance.<br/>
3. The central bank raised {interest rates} to cool down the overheating economy.<br/>
4. During the {recession}, many companies were forced to reduce their workforce.`;
        } else if (isHistory) {
          templateText = `<h3>📜 Từ Vựng Lịch Sử (History & Civilizations): ${kw}</h3>
<div style="background: rgba(139,92,246,0.08); border: 2px solid #8b5cf6; padding: 16px; border-radius: 16px; margin-bottom: 16px;">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(139,92,246,0.3);">
      🏛️ <b>Civilization</b> <span style="color: #2563eb;">/ˌsɪv.ɪ.laɪˈzeɪ.ʃən/</span> 🔊<br/><i>(Nền văn minh)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(139,92,246,0.3);">
      🗡️ <b>Revolution</b> <span style="color: #2563eb;">/ˌrev.əˈluː.ʃən/</span> 🔊<br/><i>(Cuộc cách mạng lịch sử)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(139,92,246,0.3);">
      📖 <b>Dynasty</b> <span style="color: #2563eb;">/ˈdaɪ.nə.sti/</span> 🔊<br/><i>(Triều đại / Vương triều)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(139,92,246,0.3);">
      🌍 <b>Colonization</b> <span style="color: #2563eb;">/ˌkɒl.ə.naɪˈzeɪ.ʃən/</span> 🔊<br/><i>(Sự thực dân hóa)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(139,92,246,0.3);">
      ✌️ <b>Treaty</b> <span style="color: #2563eb;">/ˈtriː.ti/</span> 🔊<br/><i>(Hiệp ước hòa bình)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(139,92,246,0.3);">
      🪙 <b>Artifact</b> <span style="color: #2563eb;">/ˈɑː.tɪ.fækt/</span> 🔊<br/><i>(Cổ vật / Di vật lịch sử)</i>
    </div>
  </div>
</div>
<h4>📝 Bài Tập Điền Từ Lịch Sử:</h4>
1. The French {revolution} of 1789 dramatically changed the political landscape of Europe.<br/>
2. Archaeologists discovered ancient {artifacts} dating back over 3,000 years.<br/>
3. The Roman {civilization} was one of the most influential in human history.<br/>
4. The peace {treaty} was signed by both nations to end decades of conflict.`;
        } else if (isIllness) {
          templateText = `<h3>💊 Từ Vựng Sức Khỏe & Bệnh Tật (Health & Illnesses): ${kw}</h3>
<div style="background: rgba(239,68,68,0.08); border: 2px solid #ef4444; padding: 16px; border-radius: 16px; margin-bottom: 16px;">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(239,68,68,0.3);">
      🤒 <b>Fever</b> <span style="color: #2563eb;">/ˈfiː.vər/</span> 🔊<br/><i>(Sốt cao)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(239,68,68,0.3);">
      😷 <b>Infection</b> <span style="color: #2563eb;">/ɪnˈfek.ʃən/</span> 🔊<br/><i>(Nhiễm trùng / Nhiễm khuẩn)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(239,68,68,0.3);">
      💊 <b>Prescription</b> <span style="color: #2563eb;">/prɪˈskrɪp.ʃən/</span> 🔊<br/><i>(Đơn thuốc của bác sĩ)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(239,68,68,0.3);">
      🩺 <b>Diagnosis</b> <span style="color: #2563eb;">/ˌdaɪ.əɡˈnəʊ.sɪs/</span> 🔊<br/><i>(Chẩn đoán bệnh)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(239,68,68,0.3);">
      🏥 <b>Symptom</b> <span style="color: #2563eb;">/ˈsɪmp.təm/</span> 🔊<br/><i>(Triệu chứng của bệnh)</i>
    </div>
    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 12px; border: 1px solid rgba(239,68,68,0.3);">
      🧬 <b>Chronic</b> <span style="color: #2563eb;">/ˈkrɒn.ɪk/</span> 🔊<br/><i>(Bệnh mãn tính kéo dài)</i>
    </div>
  </div>
</div>
<h4>📝 Bài Tập Điền Từ Y Tế:</h4>
1. The doctor gave her a {prescription} for antibiotics to treat her throat infection.<br/>
2. A high {fever} is a common {symptom} of both influenza and COVID-19.<br/>
3. The {diagnosis} showed the patient had a chronic kidney condition.<br/>
4. Washing hands regularly helps prevent the spread of {infection} in schools.`;
        } else {
          templateText = `<h3>🔤 Sơ Đồ Cụm Từ & Collocations (${kw})</h3>
<div style="background: rgba(16,185,129,0.1); border: 2px dashed #10b981; padding: 12px; border-radius: 12px; font-weight: bold; margin-bottom: 12px;">
🎯 Cấp độ: ${difficultyLevel}<br/>
💡 Từ chìa khóa: <b>${kw}</b> | Collocations: make progress, take action, achieve success
</div>
<h4>📖 Đoạn Văn Áp Dụng Từ Vựng Thực Tế:</h4>
To improve your English, you need to {practice} every single day.<br/>
Setting clear goals will help you {achieve} success faster.<br/>
Don't be afraid to {make} mistakes because they help you learn.`;
        }
      }
    } else if (selectedSubject === "toeic") {
      setTitle(`TOEIC Practice: ${kw}`);
      setSubtitle("TOEIC");
      templateText = `<h3>🎯 Official TOEIC Business Reading Passage: ${kw}</h3>
<div style="background: rgba(245,158,11,0.08); border: 2px dashed #f59e0b; padding: 14px; border-radius: 14px; margin-bottom: 16px; line-height: 1.7; font-size: 14px;">
<p><b>MEMORANDUM</b></p>
<p><b>To:</b> All Department Managers & Regional Staff<br/>
<b>From:</b> Executive Operations Office<br/>
<b>Date:</b> October 24, 2026<br/>
<b>Subject:</b> Implementation of Updated Financial Invoicing Procedures</p>

<p>Please be advised that effective next Monday, all corporate procurement requests must be submitted through our new digital portal. Department supervisors are required to review quarterly expenses prior to authorization.</p>

<p>Furthermore, vendor contracts exceeding $50,000 will undergo mandatory legal review to guarantee compliance with international trade regulations. We appreciate your prompt attention to this matter.</p>
</div>

<h4>📚 Từ Điển Anh-Anh & Anh-Việt Tích Hợp TOEIC:</h4>
<div style="background: rgba(59,130,246,0.08); border: 1.5px solid rgba(59,130,246,0.3); padding: 12px; border-radius: 14px; margin-bottom: 14px; font-size: 13px; line-height: 1.6;">
<b>1. Procurement</b> <span style="color: #3b82f6;">/prəˈkjʊə.mənt/</span> 🔊 | EN: The obtaining of supplies | VI: Sự thu mua, cung ứng thiết bị<br/>
<b>2. Authorization</b> <span style="color: #3b82f6;">/ˌɔː.θər.aɪˈzeɪ.ʃən/</span> 🔊 | EN: Official permission | VI: Sự phê duyệt, cấp phép<br/>
<b>3. Compliance</b> <span style="color: #3b82f6;">/kəmˈplaɪ.əns/</span> 🔊 | EN: Obeying rules or laws | VI: Sự tuân thủ quy định
</div>

<h4>📝 Đề Thi TOEIC Part 5 & 6 Practice:</h4>
1. Department managers must approve all {procurement} orders before sending.<br/>
2. Written {authorization} is required prior to processing payments.<br/>
3. The legal team ensures full {compliance} with international shipping laws.`;
    } else if (selectedSubject === "ielts") {
      setTitle(`IELTS Academic: ${kw}`);
      setSubtitle("IELTS");
      templateText = `<h3>🎓 Full IELTS Academic Reading Passage: ${kw}</h3>
<div style="background: rgba(168,85,247,0.08); border: 2px dashed #a855f7; padding: 16px; border-radius: 16px; margin-bottom: 16px; line-height: 1.8; font-size: 15px;">
<p><b>Paragraph A:</b> Recent scientific investigations into climate dynamics indicate that renewable energy adoption plays an indispensable role in mitigating anthropogenic carbon emissions. Across the globe, governments are enacting ambitious policy frameworks to transition away from fossil fuels, recognizing that sustainable infrastructure represents the cornerstone of future economic stability.</p>

<p><b>Paragraph B:</b> Nevertheless, the rapid deployment of solar and wind technologies presents unique logistical challenges. Engineers emphasize that grid modernization and high-capacity battery storage are mandatory prerequisites to ensure continuous energy supply during peak demand periods without exacerbating environmental degradation.</p>

<p><b>Paragraph C:</b> Ultimately, cross-border research partnerships will be vital to accelerate technological breakthroughs and make clean energy accessible to developing economies, paving the way for a resilient global energy ecosystem.</p>
</div>

<h4>📚 Từ Điển Anh-Anh & Anh-Việt Tích Hợp IELTS (Target Band: ${difficultyLevel}):</h4>
<div style="background: rgba(59,130,246,0.08); border: 1.5px solid rgba(59,130,246,0.3); padding: 12px; border-radius: 14px; margin-bottom: 14px; font-size: 13px; line-height: 1.6;">
<b>1. Mitigating</b> <span style="color: #3b82f6;">/ˈmɪt.ɪ.ɡeɪ.tɪŋ/</span> 🔊 | EN: Making less severe | VI: Giảm nhẹ, xoa dịu<br/>
<b>2. Anthropogenic</b> <span style="color: #3b82f6;">/ˌæn.θrə.pəˈdʒen.ɪk/</span> 🔊 | EN: Caused by human activity | VI: Do con người gây ra<br/>
<b>3. Prerequisites</b> <span style="color: #3b82f6;">/ˌpriːˈrek.wɪ.zɪts/</span> 🔊 | EN: Required conditions | VI: Điều kiện tiên quyết
</div>

<h4>📝 Bài Tập Đọc Hiểu & Điền Từ IELTS Academic:</h4>
1. Renewable energy plays an indispensable role in {mitigating} carbon emissions.<br/>
2. Carbon emissions resulting from human activities are described as {anthropogenic}.<br/>
3. Battery storage and grid modernization serve as mandatory {prerequisites}.`;
    } else if (selectedSubject === "news") {
      setTitle(`Tin Nóng: ${kw}`);
      setSubtitle("Tin tức - Thời sự");
      templateText = `<h3>📰 Bài Báo Thời Sự Nóng Hổi: ${kw}</h3>
<div style="background: rgba(244,63,94,0.1); border: 2px solid #f43f5e; padding: 10px 14px; border-radius: 12px; font-size: 13px; margin-bottom: 14px;">
<b>📌 Nguồn bài báo:</b> ${newsSource}<br/>
<b>✍️ Tác giả bài viết:</b> ${newsAuthor}<br/>
<b>📊 Trình độ độ khó:</b> ${difficultyLevel}<br/>
<i>(Trích dẫn chính thức nhằm tôn trọng bản quyền & tác giả bài viết)</i>
</div>

<h4>📖 Nội Dung Bài Báo Quốc Tế:</h4>
Artificial intelligence technology is advancing rapidly around the globe.<br/>
Scientists have recently made a major {breakthrough} in deep learning models.<br/>
This achievement will {pave the way for} new innovations in healthcare and education.<br/>
Tech industry leaders emphasize that safety regulations are {crucial} to prevent misuse.<br/><br/>

<h4>📚 Từ Điển Anh-Anh & Anh-Việt Tích Hợp (Bilingual Dictionary & IPA):</h4>
<div style="background: rgba(59,130,246,0.08); border: 1.5px solid rgba(59,130,246,0.3); padding: 12px; border-radius: 14px; margin-bottom: 14px; font-size: 13px; line-height: 1.6;">
<b>1. Breakthrough</b> <span style="color: #3b82f6; font-weight: bold;">/ˌbreɪk.θruː/</span> 🔊<br/>
• <i>Anh-Anh:</i> An important discovery or development that helps solve a problem.<br/>
• <i>Anh-Việt:</i> Bước tiến nhảy vọt, phát minh đột phá.<br/>
• <i>Cụm từ đi kèm:</i> Make a major breakthrough.<br/><br/>

<b>2. Pave the way for</b> <span style="color: #3b82f6; font-weight: bold;">/peɪv ðə weɪ fɔːr/</span> 🔊<br/>
• <i>Anh-Anh:</i> To create a situation in which it is easier for something to happen.<br/>
• <i>Anh-Việt:</i> Mở đường cho, tạo tiền đề thuận lợi cho...<br/><br/>

<b>3. Crucial</b> <span style="color: #3b82f6; font-weight: bold;">/ˈkruː.ʃəl/</span> 🔊<br/>
• <i>Anh-Anh:</i> Extremely important or necessary.<br/>
• <i>Anh-Việt:</i> Cực kỳ quan trọng, mang tính quyết định.
</div>

<h4>📝 Bài Tập Củng Cố Từ Mới & Thành Ngữ Thời Sự:</h4>
1. The new medical study represents a major {breakthrough} in cancer treatment.<br/>
2. Renewable energy will {pave the way for} a greener future.<br/>
3. International cooperation is {crucial} for global peace.`;
    }

    if (templateText) {
      setRawContent(templateText);
      const { parsedHtmlText: pText, extractedAnswers: answers } = parseCurlyContent(templateText);
      setParsedHtmlText(pText);
      setExtractedAnswers(answers);
      toast.success(`✨ AI đã tạo bài học "${kw}" thành công kèm Bài tập thực hành!`);
    }
  };

  // Existing Lessons State
  const [customList, setCustomList] = useState<Lesson[]>([]);

  const handleSelectChartItem = (item: { title: string; artist: string; cat: string }) => {
    const matchingPreset = PRESET_TRENDS.find((p) => p.title.toLowerCase().includes(item.title.toLowerCase()) || item.title.toLowerCase().includes(p.title.toLowerCase()));
    if (matchingPreset) {
      handleLoadPreset(matchingPreset);
    } else {
      setTitle(item.title);
      setSubtitle(item.cat);
      setSearchQuery(item.artist);
      setYoutubeUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(item.artist + " official audio")}`);
      setKaraokeUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(item.artist + " karaoke lyrics")}`);
      handleSearchAudioTrack(item.artist);
      setRawContent("");
      setParsedHtmlText("");
      setExtractedAnswers([]);
      toast.info(`Selected "${item.title}". You can click "🪄 Auto-Generate Gaps with AI" to generate lyrics, or paste them manually!`);
    }
  };

  // AI Auto-Generate Gaps Algorithm
  const handleAIGenerateGaps = () => {
    if (!rawContent.trim()) {
      toast.error("Please enter song lyrics or paragraph text first!");
      return;
    }

    if (rawContent.includes("{") && rawContent.includes("}")) {
      const { parsedHtmlText: pText, extractedAnswers: answers } = parseCurlyContent(rawContent);
      setParsedHtmlText(pText);
      setExtractedAnswers(answers);
      toast.success(`✨ AI parsed ${answers.length} gap placeholders!`);
      return;
    }

    const lines = rawContent.split("\n");
    const answersList: string[] = [];
    let gapCounter = 0;

    const formattedLines = lines.map((line) => {
      const words = line.split(" ");
      const processedWords = words.map((w) => {
        const cleanWord = w.replace(/[^a-zA-Z]/g, "");
        if (cleanWord.length >= 3 && (gapCounter % 4 === 1 || gapCounter % 5 === 2)) {
          const gapIndex = answersList.length;
          answersList.push(cleanWord);
          gapCounter++;
          return w.replace(cleanWord, `{${gapIndex}}`);
        }
        gapCounter++;
        return w;
      });
      return processedWords.join(" ");
    });

    const htmlText = formattedLines.join("<br/>");
    setParsedHtmlText(htmlText);
    setExtractedAnswers(answersList);
    toast.success(`✨ AI generated ${answersList.length} gap placeholders!`);
  };

  // Search iTunes Audio
  const handleSearchAudioTrack = async (overrideQuery?: string) => {
    const q = overrideQuery || searchQuery || title;
    if (!q.trim()) {
      toast.error("Enter a song title or artist query to search!");
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=5`);
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
        toast.success(`Found ${data.results.length} audio streams`);
      }
    } catch (e) {
      toast.error("Failed to search audio track");
    } finally {
      setIsSearching(false);
    }
  };

  // Load Preset Trend
  const handleLoadPreset = (preset: (typeof PRESET_TRENDS)[0]) => {
    setTitle(preset.title);
    setSubtitle(preset.category);
    setRawContent(preset.rawText);
    setYoutubeUrl(preset.youtubeUrl || "");
    setKaraokeUrl(preset.karaokeUrl || "");

    // Auto-trigger AI gap generation
    const lines = preset.rawText.split("\n");
    const answersList: string[] = [];
    let gapCounter = 0;

    const formattedLines = lines.map((line) => {
      const words = line.split(" ");
      const processedWords = words.map((w) => {
        const cleanWord = w.replace(/[^a-zA-Z]/g, "");
        if (cleanWord.length >= 3 && (gapCounter % 4 === 1 || gapCounter % 5 === 2)) {
          const gapIndex = answersList.length;
          answersList.push(cleanWord);
          gapCounter++;
          return w.replace(cleanWord, `{${gapIndex}}`);
        }
        gapCounter++;
        return w;
      });
      return processedWords.join(" ");
    });

    const htmlText = formattedLines.join("<br/>");
    setParsedHtmlText(htmlText);
    setExtractedAnswers(answersList);
    toast.success(`Loaded preset "${preset.title}" with video & karaoke links!`);
  };

  const handlePublishLesson = () => {
    if (!title.trim()) {
      toast.error("Lesson Title is required!");
      return;
    }
    if (!parsedHtmlText) {
      toast.error("Please click 'Auto-Generate Gaps with AI' or generate content first!");
      return;
    }


    const newLesson: Lesson = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || "Song Exercise",
      icon: "🎵",
      type: "legacy-cloze",
      legacyCloze: {
        htmlText: parsedHtmlText,
        answers: extractedAnswers,
        audioUrl: audioUrl || undefined,
        youtubeUrl: youtubeUrl || undefined,
        karaokeUrl: karaokeUrl || undefined,
      },
    };

    const updated = saveCustomLesson(newLesson);
    setCustomList(updated);
    toast.success(`🎉 Lesson "${title}" published successfully!`);

    // Reset form
    setTitle("");
    setRawContent("");
    setParsedHtmlText("");
    setExtractedAnswers([]);
    setAudioUrl("");
    setYoutubeUrl("");
    setSearchResults([]);

    toast.success("Đã đăng bài thành công!");
    navigate({ to: "/lesson/$courseId/$lessonId", params: { courseId: "blog-archive", lessonId: newLesson.id } });
  };

  const handleDelete = (id: string) => {
    const updated = deleteCustomLesson(id);
    setCustomList(updated);
    toast.success("Lesson deleted.");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in zoom-in duration-300 pb-16">
      {/* Top Admin Header */}
      <div className="glass-panel p-8 rounded-3xl shadow-xl border border-white/20 relative overflow-hidden bg-gradient-to-r from-primary/10 via-background to-secondary/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-3xl text-primary-foreground shadow-lg">
              <Sparkles size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary px-3 py-1 bg-primary/10 rounded-full">
                  Teacher & Creator Dashboard
                </span>
              </div>
              <h1 className="text-3xl font-extrabold md:text-4xl">Admin Control Panel</h1>
              <p className="text-sm font-semibold text-muted-foreground">
                Create & publish song lyrics fill-in-the-blanks with AI Co-Pilot.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("creator")}
              className={`px-4 py-2 rounded-2xl font-extrabold text-sm transition ${
                activeTab === "creator"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-background border border-border hover:bg-muted"
              }`}
            >
              🪄 AI Creator
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`px-4 py-2 rounded-2xl font-extrabold text-sm transition ${
                activeTab === "manage"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-background border border-border hover:bg-muted"
              }`}
            >
              📚 Manage Lessons ({customList.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-2xl font-extrabold text-sm transition ${
                activeTab === "users"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-background border border-border hover:bg-muted"
              }`}
            >
              🧑‍🎓 Users Progress
            </button>
          </div>
        </div>
      </div>

      {activeTab === "creator" ? (
        <div className="space-y-8">
          {/* 6 Subject Categories Selection Bar */}
          <div className="glass-panel p-6 rounded-3xl border border-primary/30 shadow-xl space-y-3 bg-gradient-to-r from-primary/5 via-background to-secondary/5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-primary uppercase tracking-wider">
                <Sparkles size={18} /> 📁 Chọn Mục Bài Tập Muốn Tạo (Select Subject Area)
              </h3>
              <span className="text-xs text-muted-foreground font-semibold">Chọn 1 trong 6 chuyên mục để AI hỗ trợ soạn bài</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
              {SUBJECT_CATEGORIES.map((cat) => {
                const isActive = selectedSubject === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedSubject(cat.id);
                      setSubtitle(cat.subtitle);
                      toast.success(`Đã chọn mục: ${cat.title}`);
                    }}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "border-primary bg-primary/20 scale-105 shadow-md ring-2 ring-primary/30"
                        : "border-border/60 bg-background/60 hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="font-extrabold text-xs text-foreground line-clamp-1">{cat.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Category-Specific AI Assistant Box */}
          {selectedSubject !== "song" && (
            <div className="glass-panel p-6 rounded-3xl border-2 border-primary/40 bg-gradient-to-r from-primary/10 via-background to-secondary/10 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                <h3 className="font-extrabold text-base flex items-center gap-2 text-primary">
                  <Sparkles size={20} className="animate-pulse" /> Trợ Lý AI Đồng Hành Soạn Bài: {SUBJECT_CATEGORIES.find(c => c.id === selectedSubject)?.title}
                </h3>
                <span className="text-xs text-muted-foreground font-semibold">Nhập từ khóa &amp; trình độ &rarr; AI sẽ tự tạo sơ đồ công thức, ví dụ &amp; bài tập thực hành</span>
              </div>

              {selectedSubject === "news" ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                  <div className="md:col-span-1 space-y-1">
                    <label className="block text-xs font-extrabold uppercase text-muted-foreground">
                      🔑 Từ khóa Tin Nóng
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AI Revolution 2026..."
                      value={categoryKeyword}
                      onChange={(e) => setCategoryKeyword(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-primary/30 bg-background font-bold text-xs outline-none focus:border-primary shadow-inner"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold uppercase text-muted-foreground">
                      📌 Nguồn Báo Uy Tín
                    </label>
                    <select
                      value={newsSource}
                      onChange={(e) => setNewsSource(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-bold outline-none focus:border-primary"
                    >
                      {NEWS_OUTLETS.map((outlet) => (
                        <option key={outlet.id} value={outlet.id}>
                          {outlet.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold uppercase text-muted-foreground">
                      ✍️ Tác Giả Bài Báo
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. By Sarah Jenkins, Chief Editor"
                      value={newsAuthor}
                      onChange={(e) => setNewsAuthor(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold uppercase text-muted-foreground">
                      📊 Trình Độ / Độ Khó
                    </label>
                    <select
                      value={difficultyLevel}
                      onChange={(e) => setDifficultyLevel(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-bold outline-none focus:border-primary"
                    >
                      <option value="Cơ bản (A1-A2)">Basic (A1-A2)</option>
                      <option value="Intermediate (B1-B2)">Intermediate (B1-B2)</option>
                      <option value="Nâng cao (C1-C2)">Advanced (C1-C2)</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-xs font-extrabold uppercase text-muted-foreground">
                      {selectedSubject === "grammar" && "🔑 Từ khóa Văn Phạm (Ví dụ: Thì hiện tại đơn, Passive Voice, Conditional Type 2)..."}
                      {selectedSubject === "vocab" && "🔑 Chủ đề Từ Vựng (Ví dụ: Business Communication, Travel, Phrasal Verbs)..."}
                      {selectedSubject === "esp" && "🔑 Chủ đề Chuyên Ngành (Ví dụ: Astrology, Archeology, Marketing, Medicine)..."}
                      {selectedSubject === "toeic" && "🔑 Chủ đề TOEIC (Ví dụ: Office Emails, Part 5 Grammar, Meetings)..."}
                      {selectedSubject === "ielts" && "🔑 Chủ đề IELTS (Ví dụ: Environment, Academic Reading, Tech)..."}
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập từ khóa cần soạn bài..."
                      value={categoryKeyword}
                      onChange={(e) => setCategoryKeyword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-primary/30 bg-background font-bold text-sm outline-none focus:border-primary shadow-inner"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold uppercase text-muted-foreground">
                      📊 Trình Độ / Band Điểm
                    </label>
                    <select
                      value={difficultyLevel}
                      onChange={(e) => setDifficultyLevel(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-bold outline-none focus:border-primary"
                    >
                      {selectedSubject === "toeic" ? (
                        <>
                          <option value="Starter (200 - 350+)">Starter (200 - 350+)</option>
                          <option value="Developing (400 - 550)">Developing (400 - 550)</option>
                          <option value="Intermediate (Target 650+)">Intermediate (Target 650+)</option>
                          <option value="Master (Target 800+)">Master (Target 800+)</option>
                        </>
                      ) : selectedSubject === "ielts" ? (
                        <>
                          <option value="Foundation (IELTS 3.5-4.5 / TOEFL 30-50)">Foundation (IELTS 3.5-4.5 / TOEFL 30-50)</option>
                          <option value="Intermediate (IELTS 5.0-6.0 / TOEFL 51-75)">Intermediate (IELTS 5.0-6.0 / TOEFL 51-75)</option>
                          <option value="Upper-Intermediate (IELTS 6.5-7.0 / TOEFL 76-90)">Upper-Intermediate (IELTS 6.5-7.0 / TOEFL 76-90)</option>
                          <option value="Advanced (IELTS 7.5+ / TOEFL 95+)">Advanced (IELTS 7.5+ / TOEFL 95+)</option>
                        </>
                      ) : (
                        <>
                          <option value="Cơ bản (A1-A2)">Basic (A1-A2)</option>
                          <option value="Intermediate (B1-B2)">Intermediate (B1-B2)</option>
                          <option value="Nâng cao (C1-C2)">Advanced (C1-C2)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* Quick Suggestion Pills */}
              {selectedSubject === "esp" && (
                <div className="pt-2 border-t border-border/40">
                  <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 block mb-2">
                    💡 Chọn Ngành Nghề (Click để soạn ngay bài học chuyên ngành):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {ESP_SUGGESTIONS.map((item, idx) => (
                      <button key={idx} onClick={() => { setCategoryKeyword(item.kw); setDifficultyLevel(item.level); setTimeout(handleAICoPilotGenerate, 50); }}
                        className="px-2.5 py-1 rounded-lg border border-indigo-400/30 bg-indigo-400/10 text-indigo-800 dark:text-indigo-200 text-[11px] font-bold hover:bg-indigo-400/20 transition">
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedSubject === "vocab" && (
                <div className="pt-2 border-t border-border/40">
                  <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 block mb-2">
                    💡 Kho Chủ Đề Từ Vựng — Click 1 Phát Soạn Ngay (50+ chủ đề theo Blog):
                  </span>
                  <div className="max-h-52 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                    {/* Group: Body & Health */}
                    <div>
                      <p className="text-[10px] font-extrabold uppercase text-muted-foreground mb-1 tracking-wider">🧑 Cơ Thể & Sức Khỏe</p>
                      <div className="flex flex-wrap gap-1">
                        {VOCAB_SUGGESTIONS.slice(0, 6).map((item, idx) => (
                          <button key={idx} onClick={() => { setCategoryKeyword(item.kw); setDifficultyLevel(item.level); setTimeout(handleAICoPilotGenerate, 50); }}
                            className="px-2 py-0.5 rounded-lg border border-red-400/30 bg-red-400/10 text-red-800 dark:text-red-200 text-[11px] font-bold hover:bg-red-400/20 transition">
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Group: People & Home */}
                    <div>
                      <p className="text-[10px] font-extrabold uppercase text-muted-foreground mb-1 tracking-wider">🏠 Con Người & Gia Đình</p>
                      <div className="flex flex-wrap gap-1">
                        {VOCAB_SUGGESTIONS.slice(6, 9).map((item, idx) => (
                          <button key={idx} onClick={() => { setCategoryKeyword(item.kw); setDifficultyLevel(item.level); setTimeout(handleAICoPilotGenerate, 50); }}
                            className="px-2 py-0.5 rounded-lg border border-blue-400/30 bg-blue-400/10 text-blue-800 dark:text-blue-200 text-[11px] font-bold hover:bg-blue-400/20 transition">
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Group: Fashion */}
                    <div>
                      <p className="text-[10px] font-extrabold uppercase text-muted-foreground mb-1 tracking-wider">👗 Thời Trang & Quần Áo</p>
                      <div className="flex flex-wrap gap-1">
                        {VOCAB_SUGGESTIONS.slice(9, 14).map((item, idx) => (
                          <button key={idx} onClick={() => { setCategoryKeyword(item.kw); setDifficultyLevel(item.level); setTimeout(handleAICoPilotGenerate, 50); }}
                            className="px-2 py-0.5 rounded-lg border border-pink-400/30 bg-pink-400/10 text-pink-800 dark:text-pink-200 text-[11px] font-bold hover:bg-pink-400/20 transition">
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Group: Shopping & Services */}
                    <div>
                      <p className="text-[10px] font-extrabold uppercase text-muted-foreground mb-1 tracking-wider">🛒 Mua Sắm & Dịch Vụ</p>
                      <div className="flex flex-wrap gap-1">
                        {VOCAB_SUGGESTIONS.slice(14, 22).map((item, idx) => (
                          <button key={idx} onClick={() => { setCategoryKeyword(item.kw); setDifficultyLevel(item.level); setTimeout(handleAICoPilotGenerate, 50); }}
                            className="px-2 py-0.5 rounded-lg border border-violet-400/30 bg-violet-400/10 text-violet-800 dark:text-violet-200 text-[11px] font-bold hover:bg-violet-400/20 transition">
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Group: Food & Drink */}
                    <div>
                      <p className="text-[10px] font-extrabold uppercase text-muted-foreground mb-1 tracking-wider">🍽️ Ẩm Thực & Đồ Uống</p>
                      <div className="flex flex-wrap gap-1">
                        {VOCAB_SUGGESTIONS.slice(22, 37).map((item, idx) => (
                          <button key={idx} onClick={() => { setCategoryKeyword(item.kw); setDifficultyLevel(item.level); setTimeout(handleAICoPilotGenerate, 50); }}
                            className="px-2 py-0.5 rounded-lg border border-orange-400/30 bg-orange-400/10 text-orange-800 dark:text-orange-200 text-[11px] font-bold hover:bg-orange-400/20 transition">
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Group: Work & Tech */}
                    <div>
                      <p className="text-[10px] font-extrabold uppercase text-muted-foreground mb-1 tracking-wider">💼 Công Việc & Công Nghệ</p>
                      <div className="flex flex-wrap gap-1">
                        {VOCAB_SUGGESTIONS.slice(37, 40).map((item, idx) => (
                          <button key={idx} onClick={() => { setCategoryKeyword(item.kw); setDifficultyLevel(item.level); setTimeout(handleAICoPilotGenerate, 50); }}
                            className="px-2 py-0.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-800 dark:text-cyan-200 text-[11px] font-bold hover:bg-cyan-400/20 transition">
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Group: Law, Economics, History */}
                    <div>
                      <p className="text-[10px] font-extrabold uppercase text-muted-foreground mb-1 tracking-wider">⚖️ Pháp Luật · Kinh Tế · Lịch Sử</p>
                      <div className="flex flex-wrap gap-1">
                        {VOCAB_SUGGESTIONS.slice(40, 47).map((item, idx) => (
                          <button key={idx} onClick={() => { setCategoryKeyword(item.kw); setDifficultyLevel(item.level); setTimeout(handleAICoPilotGenerate, 50); }}
                            className="px-2 py-0.5 rounded-lg border border-indigo-400/30 bg-indigo-400/10 text-indigo-800 dark:text-indigo-200 text-[11px] font-bold hover:bg-indigo-400/20 transition">
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Group: Travel & Science */}
                    <div>
                      <p className="text-[10px] font-extrabold uppercase text-muted-foreground mb-1 tracking-wider">🚗 Du Lịch · 🔬 Khoa Học</p>
                      <div className="flex flex-wrap gap-1">
                        {VOCAB_SUGGESTIONS.slice(47).map((item, idx) => (
                          <button key={idx} onClick={() => { setCategoryKeyword(item.kw); setDifficultyLevel(item.level); setTimeout(handleAICoPilotGenerate, 50); }}
                            className="px-2 py-0.5 rounded-lg border border-teal-400/30 bg-teal-400/10 text-teal-800 dark:text-teal-200 text-[11px] font-bold hover:bg-teal-400/20 transition">
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedSubject === "toeic" && (
                <div className="pt-2 border-t border-border/40">
                  <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 block mb-1.5">
                    💡 Gợi Ý Từ Khóa TOEIC Mới Nhất (Click 1-Phát Soạn Ngay):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {TOEIC_SUGGESTIONS.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCategoryKeyword(item.kw);
                          setDifficultyLevel(item.level);
                          setTimeout(handleAICoPilotGenerate, 50);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 text-xs font-bold hover:bg-amber-500/20 transition"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedSubject === "ielts" && (
                <div className="pt-2 border-t border-border/40">
                  <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400 block mb-1.5">
                    💡 Gợi Ý Từ Khóa IELTS Band Đa Dạng (Click 1-Phát Soạn Ngay):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {IELTS_SUGGESTIONS.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCategoryKeyword(item.kw);
                          setDifficultyLevel(item.level);
                          setTimeout(handleAICoPilotGenerate, 50);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-800 dark:text-purple-200 text-xs font-bold hover:bg-purple-500/20 transition"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedSubject === "grammar" && (
                <div className="pt-2 border-t border-border/40">
                  <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 block mb-1.5">
                    💡 Gợi Ý Chủ Đề Ngữ Pháp Hay Ra Thi (Click 1-Phát Soạn Ngay):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Conditional Type 2 (Câu điều kiện loại 2)",
                      "Passive Voice (Câu bị động)",
                      "Present Perfect (Hiện tại hoàn thành)",
                      "Relative Clauses (Mệnh đề quan hệ)",
                    ].map((gKw, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCategoryKeyword(gKw);
                          setTimeout(handleAICoPilotGenerate, 50);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-200 text-xs font-bold hover:bg-blue-500/20 transition"
                      >
                        ⚡ {gKw}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Skill Selector for TOEIC / IELTS */}
              {(selectedSubject === "toeic" || selectedSubject === "ielts") && (
                <div className="pt-2 border-t border-border/40">
                  <label className="block text-[11px] font-extrabold uppercase text-muted-foreground mb-1.5">
                    🎯 Chọn Kỹ Năng Cần Soạn:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedSubject === "toeic"
                      ? [
                          { id: "reading", label: "📖 Reading (Part 5-7)" },
                          { id: "listening", label: "🎧 Listening (Part 3-4)" },
                          { id: "grammar", label: "📝 Grammar (Part 5-6)" },
                          { id: "writing", label: "✍️ Writing" },
                        ]
                      : [
                          { id: "reading", label: "📖 Academic Reading" },
                          { id: "writing1", label: "📊 Writing Task 1" },
                          { id: "writing2", label: "✍️ Writing Task 2" },
                          { id: "speaking", label: "🗣️ Speaking Part 1-3" },
                        ]
                    ).map((sk) => (
                      <button
                        key={sk.id}
                        onClick={() => setAiSubSkill(sk.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                          aiSubSkill === sk.id
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "border-border/50 bg-background hover:bg-muted"
                        }`}
                      >
                        {sk.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Main AI Generate Buttons ── */}
              <div className="flex gap-2 pt-1">
                {/* Primary: Real Gemini AI */}
                <button
                  onClick={handleGeminiAIGenerate}
                  disabled={isAIGenerating}
                  className="btn-chunky flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm py-3 flex items-center justify-center gap-2 font-extrabold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed hover:from-violet-700 hover:to-indigo-700 transition"
                >
                  {isAIGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Gemini AI Đang Soạn Bài...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> 🤖 Gemini AI Generate (Tự Động Soạn Bài Thật)
                    </>
                  )}
                </button>

                {/* Secondary: Static Template fallback */}
                <button
                  onClick={handleAICoPilotGenerate}
                  className="btn-chunky bg-muted text-muted-foreground text-xs py-3 px-4 flex items-center justify-center gap-1.5 font-bold hover:bg-muted/80 transition rounded-xl"
                  title="Dùng template tĩnh có sẵn (không cần mạng)"
                >
                  📋 Template
                </button>
              </div>
            </div>
          )}

          {/* Top Music Charts & Community Suggestions Bar (Song Category Only) */}
          {selectedSubject === "song" && (
            <div className="glass-panel p-6 rounded-3xl border border-primary/20 space-y-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                <h3 className="font-extrabold text-sm flex items-center gap-2 text-primary uppercase tracking-wider">
                  <Wand2 size={18} /> 🏆 Top Billboard, MTV, Europe & ZingMp3 Hits
                </h3>
                <span className="text-xs text-muted-foreground font-semibold">1-Click to pre-fill song & auto-search track</span>
              </div>

              {/* Category Chart Pills */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-extrabold text-muted-foreground block mb-1">🇺🇸 Billboard Hot 100 Hits:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {TOP_CHARTS.billboard.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectChartItem(item)}
                        className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 font-extrabold hover:bg-red-500/20 transition flex items-center gap-1 hover:scale-105"
                      >
                        🎵 {item.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-extrabold text-muted-foreground block mb-1">📺 MTV & Europe Chart Top:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {TOP_CHARTS.mtv.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectChartItem(item)}
                        className="px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-extrabold hover:bg-blue-500/20 transition flex items-center gap-1 hover:scale-105"
                      >
                        🎧 {item.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-extrabold text-muted-foreground block mb-1">🇻🇳 ZingMp3 US-UK Trending:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {TOP_CHARTS.zing.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectChartItem(item)}
                        className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-extrabold hover:bg-emerald-500/20 transition flex items-center gap-1 hover:scale-105"
                      >
                        🔥 {item.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-extrabold text-muted-foreground block mb-1">🎸 US-UK Evergreen Classics:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {TOP_CHARTS.classics.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectChartItem(item)}
                        className="px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-extrabold hover:bg-purple-500/20 transition flex items-center gap-1 hover:scale-105"
                      >
                        📻 {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Presets with Full Lyrics */}
              <div className="pt-3 border-t border-border/50">
                <span className="font-extrabold text-xs text-primary block mb-2">✨ 1-Click Presets with 100% Full Lyrics:</span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TRENDS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLoadPreset(preset)}
                      className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-extrabold text-primary shadow-sm transition hover:bg-primary/20 hover:scale-105"
                    >
                      <span>✨</span>
                      <span>{preset.title}</span>
                      <span className="text-[10px] opacity-75 font-normal">({preset.category})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Creator Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Column */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl">
              {/* Prominent Universal Global Song Search Bar (Song Category Only) */}
              {selectedSubject === "song" && (
                <div className="p-4 rounded-2xl border-2 border-primary/40 bg-gradient-to-r from-primary/10 via-background to-secondary/10 shadow-md space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Search size={16} /> 🔍 Universal Global Song Search Engine
                  </label>
                  <p className="text-[11px] text-muted-foreground font-semibold">
                    Type any song title or artist to search & auto-fill audio, video, lyrics & karaoke links!
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. A Thousand Years, Blinding Lights, Hotel California, Taylor Swift..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSelectChartItem({ title: searchQuery, artist: searchQuery, cat: "Global Custom Song" });
                        }
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-primary/30 bg-background font-bold text-sm outline-none focus:border-primary shadow-inner"
                    />
                    <button
                      onClick={() => handleSelectChartItem({ title: searchQuery, artist: searchQuery, cat: "Global Custom Song" })}
                      className="btn-chunky bg-primary text-primary-foreground text-xs px-4 py-2.5 flex items-center gap-1.5 font-extrabold shrink-0"
                    >
                      {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                      Search & Load
                    </button>
                  </div>
                </div>
              )}

              <h3 className="text-xl font-extrabold flex items-center gap-2 pt-2">
                <FileText className="text-primary" size={24} /> Lesson Details & Content
              </h3>

              {/* Title & Subtitle */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-muted-foreground mb-1">
                    Lesson / Song Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Close to You - The Carpenters"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background font-bold text-base outline-none focus:border-primary shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-muted-foreground mb-1">
                    Category / Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. US-UK Classics, Grammar, Pop Hits"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-border bg-background font-semibold text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Manual Image Injection */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase text-muted-foreground">
                  🖼️ Manual Image Link (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="manualImageInput"
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-2 rounded-xl border border-border bg-background font-semibold text-sm outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById("manualImageInput") as HTMLInputElement;
                      if (input && input.value) {
                        const imgTag = `<img src="${input.value}" style="max-width:100%; max-height:400px; border-radius:12px; margin: 15px auto; display:block; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);" />\n<br/>\n`;
                        setRawContent(imgTag + rawContent);
                        input.value = "";
                        toast.success("Image added to the top of the content!");
                      }
                    }}
                    className="btn-chunky bg-emerald-600 text-white text-xs px-4 py-2 flex items-center gap-1 font-extrabold"
                  >
                    Insert Image
                  </button>
                </div>
              </div>

              {/* Lyrics / Text Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold uppercase text-muted-foreground">
                    Song Lyrics or Paragraph Text *
                  </label>
                  <button
                    onClick={handleAIGenerateGaps}
                    className="flex items-center gap-1.5 text-xs font-extrabold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-lg transition"
                  >
                    <Sparkles size={14} /> 🪄 Auto-Generate Gaps with AI
                  </button>
                </div>
                <textarea
                  rows={8}
                  placeholder="Paste song lyrics or text paragraph here..."
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-background font-mono text-sm leading-relaxed outline-none focus:border-primary shadow-inner"
                />
              </div>

              {/* Audio Track Lock & Search (Song Category Only) */}
              {selectedSubject === "song" && (
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <label className="block text-xs font-extrabold uppercase text-primary flex items-center gap-1.5">
                    <Music size={16} /> Locked Audio Track / Video Link (Optional)
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search iTunes Audio by Artist + Song..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-border bg-background text-xs font-semibold outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => handleSearchAudioTrack()}
                      className="btn-chunky bg-primary text-primary-foreground text-xs px-3 py-2 flex items-center gap-1"
                    >
                      {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                      Search
                    </button>
                  </div>

                  {/* Search Results List */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 pt-2">
                      <span className="text-[11px] font-bold text-muted-foreground">Select Exact Track:</span>
                      {searchResults.map((track) => (
                        <div
                          key={track.trackId}
                          className={`flex items-center justify-between p-2 rounded-xl border transition text-xs ${
                            audioUrl === track.previewUrl
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-border bg-background/60"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={track.artworkUrl100} className="h-8 w-8 rounded-lg object-cover" />
                            <div className="min-w-0">
                              <div className="font-extrabold truncate">{track.trackName}</div>
                              <div className="text-[10px] text-muted-foreground truncate">{track.artistName}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setAudioUrl(track.previewUrl);
                              toast.success(`Locked track: ${track.trackName} by ${track.artistName}`);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              audioUrl === track.previewUrl
                                ? "bg-emerald-600 text-white"
                                : "bg-muted hover:bg-primary/20 text-foreground"
                            }`}
                          >
                            {audioUrl === track.previewUrl ? "✓ Locked" : "Lock Audio"}
                          </button>
                        </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">YouTube Song Video URL (Full Song):</label>
                    <input
                      type="text"
                      placeholder="e.g. https://www.youtube.com/watch?v=ic8j13U_FS8"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 font-mono outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">🎤 Sing-Along Karaoke Video Link (Optional):</label>
                    <input
                      type="text"
                      placeholder="e.g. https://www.youtube.com/watch?v=sU149-jYgRs"
                      value={karaokeUrl}
                      onChange={(e) => setKaraokeUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 font-mono outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">Direct MP3 Audio URL (Optional):</label>
                    <input
                    placeholder="e.g. https://example.com/song.mp3"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 font-mono outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}

              {/* Publish Action Button */}
              <button
                onClick={handlePublishLesson}
                className="btn-chunky w-full bg-emerald-600 hover:bg-emerald-700 text-white text-base py-3.5 flex items-center justify-center gap-2 shadow-xl"
              >
                <CheckCircle2 size={20} /> Publish & Launch Lesson
              </button>
            </div>

            {/* Live Interactive Preview Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold flex items-center gap-2">
                  <Play className="text-primary" size={24} /> Live Student Preview
                </h3>
                <span className="text-xs text-muted-foreground font-bold">
                  {extractedAnswers.length} gaps generated
                </span>
              </div>

              {parsedHtmlText ? (
                <div className="glass-panel p-6 rounded-3xl border border-primary/30 shadow-2xl min-h-[500px]">
                  <LegacyClozeView
                    data={{
                      htmlText: parsedHtmlText,
                      answers: extractedAnswers,
                      audioUrl: audioUrl || undefined,
                      youtubeUrl: youtubeUrl || undefined,
                      karaokeUrl: karaokeUrl || undefined,
                    }}
                    lessonTitle={title || "Untitled Song"}
                    onFinish={(score) => {
                      toast.success(`Preview finished with score ${score}!`);
                    }}
                  />
                </div>
              ) : (
                <div className="glass-panel p-12 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-3xl">
                    🪄
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-foreground">No Live Preview Yet</h4>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1">
                      Type lyrics on the left and click <strong>"🪄 Auto-Generate Gaps with AI"</strong> to view live preview here!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === "manage" ? (
        /* Manage Lessons Tab */
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold flex items-center gap-2">
              <BookOpen className="text-primary" size={24} /> Published Admin Lessons ({customList.length})
            </h3>
            <button
              onClick={() => setActiveTab("creator")}
              className="btn-chunky bg-primary text-primary-foreground text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Plus size={16} /> Create New Lesson
            </button>
          </div>

          {customList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customList.map((lesson) => (
                <div
                  key={lesson.id}
                  className="glass-panel p-5 rounded-2xl border border-border/80 flex flex-col justify-between space-y-4 hover:border-primary/50 transition shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xl">
                        {lesson.icon || "🎵"}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-foreground">{lesson.title}</h4>
                        <span className="text-xs text-muted-foreground font-semibold">{lesson.subtitle}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(lesson.id)}
                      className="text-muted-foreground hover:text-destructive p-1 transition"
                      title="Delete lesson"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Active in Blog Archive
                    </span>

                    <button
                      onClick={() => navigate({ to: "/lesson/$courseId/$lessonId", params: { courseId: "blog-archive", lessonId: lesson.id } })}
                      className="flex items-center gap-1 font-extrabold text-primary hover:underline"
                    >
                      Launch Lesson <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground space-y-3">
              <div className="text-3xl">📦</div>
              <p className="font-semibold text-sm">No admin lessons published yet. Create your first lesson using the AI Creator tab!</p>
            </div>
          )}
        </div>
      ) : (
        /* Users Progress Tab */
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-secondary/5">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <GraduationCap className="text-primary" /> Tiến độ học tập
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Theo dõi quá trình học tập, điểm kinh nghiệm (XP) và kim cương của tất cả người dùng.
            </p>
          </div>
          
          {isLoadingUsers ? (
            <div className="py-12 flex flex-col justify-center items-center gap-4">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-muted-foreground font-bold">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground font-extrabold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Học sinh</th>
                    <th className="px-6 py-4">Tham gia</th>
                    <th className="px-6 py-4 text-center">Chuỗi ngày (Streak)</th>
                    <th className="px-6 py-4 text-center">Kinh nghiệm (XP)</th>
                    <th className="px-6 py-4 text-center">Kim cương 💎</th>
                    <th className="px-6 py-4 text-center">Bài đã học</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {usersProgress?.profiles.map((profile) => {
                    const stat = usersProgress.stats.find(s => s.user_id === profile.id);
                    const completed = usersProgress.completions.filter(c => c.user_id === profile.id).length;
                    
                    return (
                      <tr key={profile.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-extrabold text-lg border-2 border-primary/30 shadow-inner">
                              {profile.equipped_badge ? profile.equipped_badge.replace('badge_', '').charAt(0).toUpperCase() : (profile.display_name?.[0]?.toUpperCase() ?? "🐜")}
                            </div>
                            <div>
                              <div className="font-extrabold text-foreground">{profile.display_name || "Unknown User"}</div>
                              <div className="text-xs font-semibold text-muted-foreground">ID: {profile.id.substring(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-flame/10 text-flame px-3 py-1 rounded-full font-extrabold border border-flame/20">
                            🔥 {stat?.current_streak ?? 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-extrabold text-blue-600 dark:text-blue-400">
                          {stat?.xp ?? 0} XP
                        </td>
                        <td className="px-6 py-4 text-center font-extrabold text-gem">
                          {stat?.gems ?? 0}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-extrabold border border-primary/20">
                            {completed} bài
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {(!usersProgress?.profiles || usersProgress.profiles.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-bold bg-muted/10">
                        Chưa có học sinh nào đăng ký.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
    </div>
  );
}
