type Speaker = "You" | "ChatGPT";

type AvatarProps = {
  speaker: Speaker;
  size?: number;
};

export function Avatar({ speaker, size = 32 }: AvatarProps) {
  const isAssistant = speaker === "ChatGPT";
  const letter = isAssistant ? "C" : "Y";
  const className = isAssistant
    ? "rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-[0_0_18px_-4px_rgba(217,70,239,0.6)]"
    : "rounded-full bg-zinc-700 text-zinc-100 border border-white/10";
  return (
    <div
      className={`flex items-center justify-center font-semibold tracking-tight pt-[2px] leading-none select-none ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
      aria-hidden
    >
      {letter}
    </div>
  );
}
