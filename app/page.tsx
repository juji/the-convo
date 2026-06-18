import convo from "./_data/convo-html.json";
import { Turn } from "./_components/turn";
import { PlayButton } from "./_components/play-button";

type Turn =
  | { speaker: "You"; text: string }
  | { speaker: "ChatGPT"; html: string };
type Convo = { topic: string; turns: Turn[] };

const { turns } = convo as Convo;
const assistantTurns = turns.filter((t) => t.speaker === "ChatGPT").length;

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-2xl px-4 pt-16 pb-10 sm:pt-24">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-linear-to-r from-indigo-500 to-fuchsia-500" />
              A conversation
            </div>
            <h1 className="mt-3 bg-linear-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-4xl font-semibold leading-tight tracking-tight text-transparent sm:text-5xl">
              What If the Tank Wakes Up Tomorrow?
            </h1>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4">
            <p className="max-w-prose text-sm text-zinc-400">
              {turns.length} turns · {assistantTurns} from ChatGPT · between a
              human and a model.
            </p>
            <div className="text-sm">
              <span className="text-zinc-400">Original: </span>
              <a href="https://chatgpt.com/share/6a32db88-d084-83ec-940f-86c51f45dbfc" className="text-white hover:underline" target="_blank" rel="noopener noreferrer">
                https://chatgpt.com/share/6a32...dbc51f45dbfc
              </a>
            </div>
          </div>
          <div className="flex-shrink-0">
            <PlayButton turns={turns} />
          </div>
        </div>

        <div className="mt-8 h-px w-full bg-linear-to-r from-transparent via-white/15 to-transparent" />
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-32">
        <div className="flex flex-col gap-8 sm:gap-10">
          {turns.map((turn, i) => (
            <Turn key={`${turn.speaker}-${i}`} turn={turn} />
          ))}
        </div>

        <div className="mt-16 flex items-center justify-center gap-2 text-xs text-zinc-600">
          <span className="inline-block h-px w-12 bg-zinc-800" />
          end of conversation
          <span className="inline-block h-px w-12 bg-zinc-800" />
        </div>
      </main>
    </div>
  );
}
