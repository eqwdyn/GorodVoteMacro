export function macrosWorkTime(totalDelayInSeconds: number): string {
  const totalDelayHours = Math.floor(totalDelayInSeconds / 3600);
  const totalDelayMinutes = Math.floor((totalDelayInSeconds % 3600) / 60);
  const totalDelaySeconds = totalDelayInSeconds % 60;

  const paddedMinutes = totalDelayMinutes.toString().padStart(2, "0");
  const paddedSeconds = totalDelaySeconds.toString().padStart(2, "0");
  let timeString;
  if (totalDelayHours > 0) {
    const paddedH = totalDelayHours.toString().padStart(2, "0");
    timeString = `${paddedH}H:${paddedMinutes}M:${paddedSeconds}S`;
  } else {
    timeString = `${paddedMinutes}M:${paddedSeconds}S`;
  }

  return timeString;
}
