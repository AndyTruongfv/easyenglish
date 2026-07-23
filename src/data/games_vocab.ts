export type GameVocab = {
  id: string;
  english: string;
  vietnamese: string;
  example: string;
  emoji: string;
};

export const GAMES_VOCAB: GameVocab[] = [
  { id: "v1", english: "Abundant", vietnamese: "Dồi dào", example: "There is an abundant supply of water.", emoji: "🌊" },
  { id: "v2", english: "Benevolent", vietnamese: "Nhân từ", example: "He was a benevolent king.", emoji: "👑" },
  { id: "v3", english: "Candid", vietnamese: "Thẳng thắn", example: "To be candid, I don't like it.", emoji: "🗣️" },
  { id: "v4", english: "Diligent", vietnamese: "Siêng năng", example: "She is a diligent student.", emoji: "📚" },
  { id: "v5", english: "Eloquent", vietnamese: "Hùng hồn", example: "An eloquent speech moved the audience.", emoji: "🎤" },
  { id: "v6", english: "Frugal", vietnamese: "Tiết kiệm", example: "A frugal lifestyle saves money.", emoji: "💰" },
  { id: "v7", english: "Gregarious", vietnamese: "Hòa đồng", example: "Dolphins are gregarious animals.", emoji: "🐬" },
  { id: "v8", english: "Humble", vietnamese: "Khiêm tốn", example: "Despite his wealth, he remains humble.", emoji: "🙏" },
  { id: "v9", english: "Inevitable", vietnamese: "Không thể tránh khỏi", example: "Change is inevitable.", emoji: "⏳" },
  { id: "v10", english: "Jovial", vietnamese: "Vui vẻ", example: "He was in a jovial mood.", emoji: "😊" },
  { id: "v11", english: "Lucid", vietnamese: "Rõ ràng", example: "She gave a lucid explanation.", emoji: "💡" },
  { id: "v12", english: "Meticulous", vietnamese: "Tỉ mỉ", example: "He is meticulous about his work.", emoji: "🔍" },
  { id: "v13", english: "Nostalgic", vietnamese: "Hoài niệm", example: "Hearing that song made me nostalgic.", emoji: "📻" },
  { id: "v14", english: "Optimistic", vietnamese: "Lạc quan", example: "We are optimistic about the future.", emoji: "☀️" },
  { id: "v15", english: "Profound", vietnamese: "Sâu sắc", example: "The book has a profound message.", emoji: "📖" },
  { id: "v16", english: "Resilient", vietnamese: "Kiên cường", example: "Children are often very resilient.", emoji: "🌱" },
  { id: "v17", english: "Sincere", vietnamese: "Chân thành", example: "Please accept my sincere apologies.", emoji: "🤝" },
  { id: "v18", english: "Tenacious", vietnamese: "Ngoan cường", example: "A tenacious defender never gives up.", emoji: "🛡️" },
  { id: "v19", english: "Versatile", vietnamese: "Đa năng", example: "This tool is highly versatile.", emoji: "🔧" },
  { id: "v20", english: "Zealous", vietnamese: "Nhiệt tình", example: "He is a zealous supporter of the team.", emoji: "🔥" }
];

export function getRandomVocab(count: number): GameVocab[] {
  const shuffled = [...GAMES_VOCAB].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
