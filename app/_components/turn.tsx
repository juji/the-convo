import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { Avatar } from "./avatar";

type Speaker = "You" | "ChatGPT";
type TurnType = { speaker: Speaker; text: string };

marked.setOptions({
  gfm: true,
  breaks: false,
});

type TurnProps = {
  turn: TurnType;
};

function renderAssistantHtml(md: string): string {
  const raw = marked.parse(md, { async: false }) as string;
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
  });
}

export function Turn({ turn }: TurnProps) {
  const isAssistant = turn.speaker === "ChatGPT";

  if (isAssistant) {
    const html = renderAssistantHtml(turn.text);
    return (
      <article className="flex gap-3 sm:gap-4">
        <div className="pt-1">
          <Avatar speaker="ChatGPT" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-xs font-medium text-zinc-400">
            ChatGPT
          </div>
          <div
            className="prose-chat"
            // sanitized above; content comes from the local convo.md
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </article>
    );
  }

  return (
    <article className="flex justify-end gap-3 sm:gap-4">
      <div className="flex max-w-[80%] flex-col items-end sm:max-w-md">
        <div className="mb-1 text-xs font-medium text-zinc-400">You</div>
        <div className="whitespace-pre-wrap rounded-2xl rounded-br-md border border-white/5 bg-zinc-800/60 px-4 py-2.5 text-[0.95rem] leading-relaxed text-zinc-100 shadow-sm">
          {turn.text}
        </div>
      </div>
      <div className="pt-1">
        <Avatar speaker="You" />
      </div>
    </article>
  );
}
