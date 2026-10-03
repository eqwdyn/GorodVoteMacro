import * as fs from "fs";
import * as path from "path";

export class Logger {
  private readonly filePath: string;

  constructor(fileName: string = "app.log", logDir: string = "./logs") {
    // Создаём папку, если её нет
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    this.filePath = path.join(logDir, fileName);
  }

  private formatDate(): string {
    const now = new Date();
    // Формат: ГГГГ-ММ-ДД ЧЧ:ММ:СС
    return now.toISOString().replace("T", " ").replace(".000Z", "");
  }

  public log(message: string): void {
    const line = `${this.formatDate()}, ${message}\n`;

    // appendFileSync дописывает строку в конец файла (асинхронно по сути, но синхронно в коде)
    fs.appendFileSync(this.filePath, line, "utf8");

    // Дублируем в консоль, чтобы видеть сразу
    console.log(line.trim());
  }

  public info(message: string): void {
    this.log(`INFO: ${message}`);
  }

  public error(message: string, err?: Error): void {
    const errorMessage = err ? `${message} | ${err.message}` : message;
    this.log(`ERROR: ${errorMessage}`);
  }

  public warn(message: string): void {
    this.log(`WARN: ${message}`);
  }
}
