// Reads convo.md from the repo root and writes app/_data/convo.json.
// Run with: npm run parse
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const TURN_HEADING = /^####\s+(You|ChatGPT):\s*$/;

function parse(raw) {
  const lines = raw.split("\n");
  let topic = "Conversation";
  const turns = [];
  let current = null;
  let body = [];

  const flush = () => {
    if (current) {
      current.text = body.join("\n").replace(/^\n+|\n+$/g, "");
      turns.push(current);
    }
    current = null;
    body = [];
  };

  for (const line of lines) {
    const heading = line.match(TURN_HEADING);
    if (heading) {
      flush();
      current = { speaker: heading[1], text: "" };
      continue;
    }
    if (current) {
      body.push(line);
      continue;
    }
    if (line.startsWith("# ")) {
      topic = line.slice(2).trim();
    }
  }
  flush();

  return { topic, turns };
}

const raw = await readFile(path.join(root, "convo.md"), "utf8");
const convo = parse(raw);

const outDir = path.join(root, "app", "_data");
const outFile = path.join(outDir, "convo.json");
await mkdir(outDir, { recursive: true });
await writeFile(outFile, JSON.stringify(convo, null, 2) + "\n", "utf8");

console.log(
  `wrote ${outFile} — topic: ${convo.topic}, turns: ${convo.turns.length}`,
);
