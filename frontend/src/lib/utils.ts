// Date formatting
export const formatDate = (date: Date) => {
  return date.toLocaleDateString();
};

// Mood emoji mapping
export const moodEmojis: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  neutral: "😐",
};
