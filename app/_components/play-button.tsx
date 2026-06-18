"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Turn =
  | { speaker: "You"; text: string }
  | { speaker: "ChatGPT"; html: string; text?: string };

interface PlayButtonProps {
  turns: Turn[];
  onIndexChange?: (index: number) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
}

export function PlayButton({ turns, onIndexChange, onPlayingChange }: PlayButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPlayingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  useEffect(() => {
    onIndexChange?.(currentIndex);
    if (currentIndex !== -1) {
      const el = document.getElementById(`turn-${currentIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [currentIndex, onIndexChange]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      window.speechSynthesis.cancel();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const stripHtml = (html: string) => {
    if (typeof window === "undefined") return html;
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    window.speechSynthesis.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(false);
    setCurrentIndex(-1);
  }, []);

  const play = useCallback(() => {
    if (turns.length === 0 || voices.length === 0) return;
    
    // Cancel any existing speech just in case
    window.speechSynthesis.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);

    isPlayingRef.current = true;
    setIsPlaying(true);
    let index = 0;

    const englishVoices = voices.filter(v => v.lang.startsWith("en"));
    
    const chatgptVoice = englishVoices.find(v => 
      /female|samantha|victoria|zira|jessica|monica|siri|google us english|en-us-x-sfg#female/i.test(v.name)
    ) || englishVoices[0];

    const youVoice = englishVoices.find(v => 
      (/male|daniel|alex|david|guy|sergei|google uk english male|en-gb-x-rjs#male/i.test(v.name)) && v !== chatgptVoice
    ) || (englishVoices.length > 1 ? englishVoices.find(v => v !== chatgptVoice) : englishVoices[0]);

    const speakNext = () => {
      if (!isPlayingRef.current || index >= turns.length) {
        setIsPlaying(false);
        setCurrentIndex(-1);
        isPlayingRef.current = false;
        return;
      }

      const turn = turns[index];
      const textToSpeak = turn.speaker === "You" ? turn.text : (turn.text || stripHtml(turn.html));
      
      // Skip empty turns
      if (!textToSpeak.trim()) {
        index++;
        speakNext();
        return;
      }

      setCurrentIndex(index);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utteranceRef.current = utterance;
      
      if (turn.speaker === "ChatGPT") {
        if (chatgptVoice) utterance.voice = chatgptVoice;
        utterance.pitch = 1.05;
        utterance.rate = 1.05;
      } else {
        if (youVoice) utterance.voice = youVoice;
        utterance.pitch = 0.9;
        utterance.rate = 1.0;
      }

      utterance.onend = () => {
        if (!isPlayingRef.current) return;
        index++;
        timerRef.current = setTimeout(speakNext, 500);
      };

      utterance.onerror = (event) => {
        if (event.error === "interrupted" || event.error === "canceled") return;
        console.error("SpeechSynthesis error:", event);
        setIsPlaying(false);
        setCurrentIndex(-1);
        isPlayingRef.current = false;
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

