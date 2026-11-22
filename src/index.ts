import { exit } from "process";
import { proccessChromium } from "./core/chromiumScript.js";
import { register } from "./core/register.js";
import { Logger } from "./utils/logger.js";
import { generateNumbers } from "./utils/generateNumbers.js";
import { readFile } from "fs/promises";
import { getLastIndexFromLog } from "./utils/getLastIndexFromLog.js";
import { isNightTime } from "./utils/isNightTime.js";
import { macrosWorkTime } from "./utils/macrosWorkTime.js";
import { User } from "./types/user.interface.js";
import { parseArgs } from "./utils/parseArgs.js";

const SuccessLogger = new Logger("success.log");
const ErrorLogger = new Logger("error.log");

const lastSuccessIndex = getLastIndexFromLog("success.log");
const lastErrorIndex = getLastIndexFromLog("error.log");
const lastIndex = Math.max(lastErrorIndex, lastSuccessIndex);
console.log("Last index: ", lastIndex);

const rawUsers = await readFile("./src/stores/users.json", "utf-8");
const initUsers = JSON.parse(rawUsers) as User[];

const { start: startArg, end: endArg, debug: debugArg } = parseArgs();

const startIndex = startArg !== -1 ? startArg : lastIndex + 1;
const endIndex = endArg !== -1 ? endArg : initUsers.length;

console.log(`Start index: ${startIndex}, End index: ${endIndex}`);
if (startIndex >= endIndex) {
  console.log("Нет пользователей для обработки (start >= end). Завершение.");
  exit(1);
}

if (startIndex < 0 || startIndex > initUsers.length) {
  console.log(
    `Некорректный start index. Допустимый диапазон: 1..${initUsers.length}`,
  );
  exit(1);
}
async function proccessResult(user: any, successVotes: number, i: number) {
  SuccessLogger.log(
    `Success vote with index: ${i} \n  User: ${JSON.stringify(user, null, 2)}`,
  );
  successVotes++;

  const paddedSeconds = user.delaySeconds.toString().padStart(2, "0");
  console.log(`TIME DELAY: ${user.delayMinutes}:${paddedSeconds}`);

  if (!debugArg) {
    await new Promise((r) =>
      setTimeout(r, user.delayMinutes * 60 * 1000 + user.delaySeconds * 1000),
    );
  }
}

async function main() {
  let i = startIndex;
  let successVotes = 0;
  let errorVotes = 0;

  let isNight = isNightTime();
  const maxDelayMinutes = isNight ? 5 : 15;
  console.log("Time mode: ", isNight ? "Night" : "Day");

  const users = initUsers.slice(startIndex, endIndex).map((user) => {
    const day = generateNumbers(1, 28);
    const month = generateNumbers(1, 12);
    const year = generateNumbers(1982, 2004);

    const delayMinutes = generateNumbers(5, maxDelayMinutes);
    const delaySeconds = generateNumbers(1, 60);

    return { ...user, day, month, year, delayMinutes, delaySeconds };
  });

  const totalDelay = users.reduce(
    (prev, cur) => prev + (cur.delayMinutes * 60 + cur.delaySeconds),
    0,
  );
  const timeString = macrosWorkTime(totalDelay);
  console.log(`Macrose work time will be: F(n) + ${timeString}`);

  while (i < endIndex) {
    const userIndexInSlice = i - startIndex;
    const user = users[userIndexInSlice];

    if (!user) break;

    console.log("User: ", JSON.stringify(user, null, 2));

    if (isNightTime() !== isNight) {
      isNight = !isNight;
      user.delayMinutes = generateNumbers(5, maxDelayMinutes);
    }

    try {
      await register(user);
    } catch (e) {
      console.log(
        "Will retry. Error to register user: ",
        JSON.stringify(user, null, 2),
      );
      try {
        await register(user);
      } catch (e) {
        ErrorLogger.error(
          `Error to register user: ${JSON.stringify(user, null, 2)}`,
        );
        continue; // Пропускаем
      }
    }

    try {
      await new Promise((r) => setTimeout(r, 5000));
      await proccessChromium({ ...user, debugMode: debugArg });
      await proccessResult(user, successVotes, i);
    } catch (e: any) {
      try {
        console.log(
          `Error while vote with index: ${i} error: ${e.message} \n  User: ${JSON.stringify(user, null, 2)}`,
        );

        await new Promise((r) => setTimeout(r, 5000));
        await proccessChromium({ ...user, debugMode: debugArg });
        await proccessResult(user, successVotes, i);
      } catch (e: any) {
        ErrorLogger.error(
          `Error while vote with index: ${i} error: ${e.message} \n  User: ${JSON.stringify(user, null, 2)}`,
        );
        errorVotes++;
      }
    }

    i++;
  }

  console.log(
    `Macros have done! \nTotal votes: ${successVotes + errorVotes} \nSuccess votes: ${successVotes} \nError votes: ${errorVotes}`,
  );
}

await main();
exit(0);
