import * as fs from "fs";
import * as path from "path";

export function getLastIndexFromLog(
  logFileName: string,
  logDir: string = "./logs",
): number {
  const filePath = path.join(logDir, logFileName);

  if (!fs.existsSync(filePath)) {
    return 0;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  const regex = /index:\s*(\d+)/i;

  // Идём с конца — первая найденная строка с индексом
  // и есть последняя по времени
  for (let i = lines.length - 1; i >= 0; i--) {
    const match = lines[i].match(regex);
    if (match && match[1]) {
      return Number(match[1]);
    }
  }

  return 0;
}
