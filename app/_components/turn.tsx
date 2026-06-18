import { Avatar } from "./avatar";

type TurnType =
  | { speaker: "You"; text: string }
  | { speaker: "ChatGPT"; html: string };

type TurnProps = {
  turn: TurnType;
};

export function Turn({ turn }: TurnProps) {
  if (turn.speaker === "ChatGPT") {
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
            // sanitized at build time; content comes from the local convo.md
            dangerouslySetInnerHTML={{ __html: turn.html }}
          />
        </div>
      </article>
    );
  }

  return (
    <article className="flex justify-end gap-3 sm:gap-4">
      <div className="flex max-w-[80%] flex-col items-end sm:max-w-md">
        <div className="mb-1 text-xs font-medium text-zinc-400">You</div>
        <div className="whitespace-pre-wrap rounded-2xl rounded-br-md border border-white/5 bg-zinc-800/60 px-4 py-2.5 text-base leading-relaxed text-zinc-100 shadow-sm">
          {turn.text}
        </div>
      </div>
      <div className="pt-1">
        <Avatar speaker="You" />
      </div>
    </article>
  );
}
