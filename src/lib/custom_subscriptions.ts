export type CustomSubscription = {
  userId: string;
  tier: "Free" | "Monthly" | "Yearly" | "Hourly" | "VIP";
  paymentStatus: "Paid" | "Pending" | "Expired";
  expirationDate: string | null;
  unlockedModules: string[];
};

const STORAGE_KEY = "easy_english_custom_subscriptions";

export function getCustomSubscriptions(): CustomSubscription[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load custom subscriptions", e);
    return [];
  }
}

export function saveCustomSubscription(sub: CustomSubscription): CustomSubscription[] {
  const current = getCustomSubscriptions();
  const existingIdx = current.findIndex((s) => s.userId === sub.userId);
  let updated: CustomSubscription[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = sub;
  } else {
    updated = [sub, ...current];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function getSubscriptionForUser(userId: string): CustomSubscription | null {
  const current = getCustomSubscriptions();
  return current.find((s) => s.userId === userId) || null;
}
