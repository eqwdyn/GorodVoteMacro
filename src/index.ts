import { exit } from "process";
import { proccessChromium } from "./chromiumVariation.js";
import { register } from "./apiVariation.js";
import { Logger } from "./utils/logger.js";
import { generateNumbers } from "./utils/generateNumbers.js";
import { readFile } from "fs/promises";
import { getLastIndexFromLog } from "./utils/getLastIndexFromLog.js";

const SuccessLogger = new Logger("success.log");
const ErrorLogger = new Logger("error.log");

const lastSuccessIndex = getLastIndexFromLog("success.log");
const lastErrorIndex = getLastIndexFromLog("error.log");
const lastIndex = Math.max(lastErrorIndex, lastSuccessIndex);
console.log("Last index: ", lastIndex);

interface User {
  login: string;
  password: string;
  email: string;
  name: string;
  lastname: string;
  phone: string;
}

const rawUsers = await readFile("./src/stores/users.json", "utf-8");
const initUsers = JSON.parse(rawUsers) as User[];

async function main() {
  let i = lastIndex + 1;
  let votesCount = initUsers.length;
  let successVotes = 0;
  let errorVotes = 0;

  const users = initUsers.map((user) => {
    const day = generateNumbers(1, 28);
    const month = generateNumbers(1, 12);
    const year = generateNumbers(1982, 2004);

    const delayMinutes = generateNumbers(5, 30);
    const delaySeconds = generateNumbers(1, 60);

    return { ...user, day, month, year, delayMinutes, delaySeconds };
  });

  const totalDelay = users.reduce(
    (prev, cur) => prev + (cur.delayMinutes * 60 + cur.delaySeconds),
    0,
  );

  const totalDelayHours = Math.floor(totalDelay / 3600);
  const totalDelayMinutes = Math.floor((totalDelay % 3600) / 60);
  const totalDelaySeconds = totalDelay % 60;

  const paddedMinutes = totalDelayMinutes.toString().padStart(2, "0");
  const paddedSeconds = totalDelaySeconds.toString().padStart(2, "0");
  let timeString;
  if (totalDelayHours > 0) {
    const paddedH = totalDelayHours.toString().padStart(2, "0");
    timeString = `${paddedH}H:${paddedMinutes}M:${paddedSeconds}S`;
  } else {
    timeString = `${paddedMinutes}M:${paddedSeconds}S`;
  }

  console.log(`Macrose work time will be: F(n) + ${timeString}`);

  while (votesCount !== 0) {
    const user = users[i];
    console.log("User: ", JSON.stringify(user, null, 2));

    try {
      await register(user);
      await proccessChromium(user);

      SuccessLogger.log(
        `Success vote with index: ${i} \n  User: ${JSON.stringify(user, null, 2)}`,
      );
      votesCount--;
      successVotes++;

      const paddedSeconds = user.delaySeconds.toString().padStart(2, "0");
      console.log(`TIME DELAY: ${user.delayMinutes}:${paddedSeconds}`);

      await new Promise((r) =>
        setTimeout(r, user.delayMinutes * 60 * 1000 + user.delaySeconds * 1000),
      );
    } catch (e) {
      ErrorLogger.error(
        `Error while vote with index: ${i} error: ${e} \n  User: ${JSON.stringify(user, null, 2)}`,
      );
      errorVotes++;
    }

    i++;
  }

  console.log(
    `Macros have done! \nTotal votes: ${successVotes + errorVotes} \nSuccess votes: ${successVotes} \nError votes: ${errorVotes}`,
  );
}

await main();
exit(0);
