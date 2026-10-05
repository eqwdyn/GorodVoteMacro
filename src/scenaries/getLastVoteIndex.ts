import { exit } from "node:process";
import { getLastIndexFromLog } from "../utils/getLastIndexFromLog.js";

async function main() {
  const lastSuccessIndex = getLastIndexFromLog("success.log");
  const lastErrorIndex = getLastIndexFromLog("error.log");
  const lastIndex = Math.max(lastErrorIndex, lastSuccessIndex);
  console.log("Last index: ", lastIndex);
}

await main();
exit(0);
