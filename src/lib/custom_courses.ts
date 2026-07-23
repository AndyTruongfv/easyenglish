import { type Course } from "@/data/courses";

const STORAGE_KEY = "easy_english_custom_courses";

export function getCustomCourses(): Course[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load custom courses", e);
    return [];
  }
}

export function saveCustomCourse(course: Course): Course[] {
  const current = getCustomCourses();
  const existingIdx = current.findIndex((c) => c.id === course.id);
  let updated: Course[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = course;
  } else {
    updated = [course, ...current];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteCustomCourse(courseId: string): Course[] {
  const current = getCustomCourses();
  const updated = current.filter((c) => c.id !== courseId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
