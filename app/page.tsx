"use client";

import { useState } from "react";
import convo from "./_data/convo-html.json";
import { Turn } from "./_components/turn";
import { PlayButton } from "./_components/play-button";

type TurnType =
  | { speaker: "You"; text: string }
  | { speaker: "ChatGPT"; html: string };
type Convo = { topic: string; turns: TurnType[] };

const { turns } = convo as Convo;
const assistantTurns = turns.filter((t) => t.speaker === "ChatGPT").length;

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-2xl px-4 pt-16 pb-8 sm:pt-24">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-linear-to-r from-indigo-500 to-fuchsia-500" />
            A conversation
          </div>
          <h1 className="mt-3 bg-linear-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-4xl font-semibold leading-tight tracking-tight text-transparent sm:text-5xl">
            What If the Tank Wakes Up Tomorrow?
          </h1>
          <p className="mt-4 max-w-prose text-sm text-zinc-400">
            {turns.length} turns · {assistantTurns} from ChatGPT · between a human and a model.
          </p>
        </div>
      </header>

      <div className="sticky top-0 z-50 w-full border-y border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div className="text-sm">
            <span className="hidden text-zinc-500 sm:inline">Original: </span>
            <a
              href="https://chatgpt.com/share/6a32db88-d084-83ec-940f-86c51f45dbfc"
              className="text-white hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://chatgpt.com/share/6a32...dbc51f45dbfc
            </a>
          </div>
          <div className="flex-shrink-0">
            <PlayButton
              turns={turns}
              onIndexChange={setCurrentIndex}
              onPlayingChange={setIsPlaying}
            />
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 pb-32">
        <div className="flex flex-col gap-8 sm:gap-10">
          {turns.map((turn, i) => (
            <div id={`turn-${i}`} key={`${turn.speaker}-${i}`} className="scroll-mt-32 transition-opacity duration-500">
              <Turn 
                turn={turn} 
                isActive={!isPlaying || currentIndex === i} 
              />
            </div>
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
