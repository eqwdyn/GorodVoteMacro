import { exit } from "node:process";
import { countSuccessfulVotes } from "../utils/countSuccessfulVotes.js";

async function main() {
  const votesCount = await countSuccessfulVotes("./logs/success.log");
  console.log("Votes Count: ", votesCount);
}

await main();
exit(0);
