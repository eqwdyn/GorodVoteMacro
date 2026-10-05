export function isNightTime(): boolean {
  const now = new Date();
  const currentHour = now.getHours();

  return currentHour >= 23 || currentHour < 5;
}
