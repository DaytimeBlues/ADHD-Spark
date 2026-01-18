export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const calculateStreak = (
  lastUseDate: Date | null,
  currentStreak: number,
): number => {
  if (!lastUseDate) return 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastUse = new Date(lastUseDate);
  lastUse.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (today.getTime() - lastUse.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return currentStreak;
  if (diffDays === 1) return currentStreak + 1;
  return 1;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getDayName = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};
