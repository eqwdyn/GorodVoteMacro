import * as fs from "fs/promises";

export async function readFileAsync(path: string): Promise<string[]> {
  try {
    const data = await fs.readFile(path, "utf-8");
    return data
      .split(/\r?\n/) // разбиваем по строкам
      .map((line) => line.trim())
      .filter((line) => line.length > 0); // убираем пустые
  } catch (err) {
    console.error("Ошибка чтения файла:", err);
    throw err;
  }
}
