import { createReadStream } from "fs";

export async function countSuccessfulVotes(filePath: string) {
  const stream = createReadStream(filePath, { encoding: "utf8" });
  let count = 0;

  return new Promise((resolve, reject) => {
    let buffer = "";

    stream.on("data", (chunk) => {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.includes("Success vote with index:")) {
          count++;
        }
      }
    });

    stream.on("end", () => {
      if (buffer.trim() && buffer.includes("Success vote with index:")) {
        count++;
      }
      resolve(count);
    });

    stream.on("error", reject);
  });
}
