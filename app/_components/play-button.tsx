"use client";

import { useState, useEffect, useCallback } from "react";

type Turn =
  | { speaker: "You"; text: string }
  | { speaker: "ChatGPT"; html: string; text?: string };

interface PlayButtonProps {
  turns: Turn[];
}

export function PlayButton({ turns }: PlayButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const stripHtml = (html: string) => {
    if (typeof window === "undefined") return html;
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentIndex(-1);
  }, []);

  const play = useCallback(() => {
    if (turns.length === 0) return;
    
    setIsPlaying(true);
    let index = 0;

    const speakNext = () => {
      if (index >= turns.length) {
        setIsPlaying(false);
        setCurrentIndex(-1);
        return;
      }

      setCurrentIndex(index);
      const turn = turns[index];
      const textToSpeak = turn.speaker === "You" ? turn.text : stripHtml(turn.html);
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      const preferredVoices = voices.filter(v => v.lang.startsWith("en"));
      
      if (turn.speaker === "ChatGPT") {
        const femaleVoice = preferredVoices.find(v => 
          v.name.toLowerCase().includes("female") || 
          v.name.toLowerCase().includes("samantha") || 
          v.name.toLowerCase().includes("victoria") ||
          v.name.toLowerCase().includes("google us english")
        );
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.pitch = 1.05;
        utterance.rate = 1.0;
      } else {
        const maleVoice = preferredVoices.find(v => 
          v.name.toLowerCase().includes("male") || 
          v.name.toLowerCase().includes("daniel") || 
          v.name.toLowerCase().includes("alex") ||
          v.name.toLowerCase().includes("google uk english male")
        );
        if (maleVoice) utterance.voice = maleVoice;
        utterance.pitch = 0.95;
        utterance.rate = 1.0;
      }

      utterance.onend = () => {
        index++;
        speakNext();
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentIndex(-1);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }, [turns, voices]);

  const togglePlay = () => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  };

  if (voices.length === 0) {
    return (
      <button disabled className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-500">
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Loading voices...
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={togglePlay}
        className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 shadow-lg ${
          isPlaying
            ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
            : "bg-white text-zinc-950 hover:bg-zinc-200"
        }`}
      >
        {isPlaying ? (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" />
            </svg>
            Stop
          </>
        ) : (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play Conversation
          </>
        )}
      </button>
      {isPlaying && currentIndex !== -1 && (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-zinc-300">
            Speaking: {turns[currentIndex].speaker}
          </span>
          <span className="text-[10px] text-zinc-500">
            Turn {currentIndex + 1} of {turns.length}
          </span>
        </div>
      )}
    </div>
  );
}

