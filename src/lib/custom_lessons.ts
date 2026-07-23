import { type Lesson } from "@/data/courses";

const STORAGE_KEY = "easy_english_custom_lessons";

export function getCustomLessons(): Lesson[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load custom lessons", e);
    return [];
  }
}

export function saveCustomLesson(lesson: Lesson): Lesson[] {
  const current = getCustomLessons();
  const existingIdx = current.findIndex((l) => l.id === lesson.id);
  let updated: Lesson[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = lesson;
  } else {
    updated = [lesson, ...current];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteCustomLesson(lessonId: string): Lesson[] {
  const current = getCustomLessons();
  const updated = current.filter((l) => l.id !== lessonId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
