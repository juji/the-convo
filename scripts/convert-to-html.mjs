import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

marked.setOptions({ gfm: true, breaks: false });

const inFile = path.join(root, "app", "_data", "convo.json");
const outFile = path.join(root, "app", "_data", "convo-html.json");

const convo = JSON.parse(await readFile(inFile, "utf8"));

const turns = convo.turns.map((t) => {
  if (t.speaker !== "ChatGPT") return t;
  const raw = marked.parse(t.text, { async: false });
  const html = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
  return { speaker: t.speaker, html };
});

const out = { topic: convo.topic, turns };
await writeFile(outFile, JSON.stringify(out, null, 2) + "\n", "utf8");

console.log(
  `wrote ${outFile} — topic: ${out.topic}, turns: ${out.turns.length}`,
);
