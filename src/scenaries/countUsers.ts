import { exit } from "node:process";
import { readFile } from "node:fs/promises";
import { User } from "../types/user.interface.js";

async function main() {
  const rawUsers = await readFile("./src/stores/users.json", "utf-8");
  const users = JSON.parse(rawUsers) as User[];
  console.log("Users count: ", users.length);
}

await main();
exit(0);
