export function parseArgs(): { start: number; end: number } {
  const args = process.argv.slice(2);

  const startArg = args.find((a) => a.startsWith("--start="));
  const endArg = args.find((a) => a.startsWith("--end="));

  const start = startArg ? parseInt(startArg.split("=")[1], 10) : -1;
  const end = endArg ? parseInt(endArg.split("=")[1], 10) : -1;

  return { start, end };
}
