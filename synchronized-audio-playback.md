# Plan: High-Quality Synchronized Audio Playback (Karaoke Style)

## Objective
Transition from browser-native SpeechSynthesis to pre-recorded high-quality audio files (User recordings + ElevenLabs) with synchronized word-level highlighting and "crawling" scrolling.

## Strategy

### 1. Data Structure Enhancement
We need to evolve the `convo.json` to include references to audio assets and their corresponding timing metadata.

**Proposed Turn Schema:**
```typescript
type WordAlignment = {
  word: string;
  start: number; // seconds
  end: number;   // seconds
};

type Turn = {
  speaker: "You" | "ChatGPT";
  text: string;
  html?: string;
  audioPath: string; // path to .mp3
  alignments?: WordAlignment[]; // Required for ChatGPT "light up" effect
};
```

### 2. Playback Engine (`PlayButton` Refactor)
The `PlayButton` will shift from controlling `window.speechSynthesis` to managing an HTML5 `Audio` object.

- **Hybrid Logic:**
    - For **"You"** turns: Play audio and immediately scroll the bubble into view.
    - For **"ChatGPT"** turns: Play audio and start a "Sync Loop" (using `requestAnimationFrame`) to compare `audio.currentTime` against the `alignments` array.
- **State Broadcast:** The `PlayButton` will emit the current `charIndex` or `wordIndex` to the parent `Home` component, which passes it down to the `Turn` components.

### 3. "Light Up" Effect (`Turn` Component Enhancement)
The `Turn` component needs to visually highlight text as it is being spoken.

- **Tokenization:** ChatGPT's HTML/Text must be wrapped in `<span>` tags at the word or character level.
- **Active State:** A `currentIndex` prop will determine which `<span>` gets the "active" (lit up) class.
- **Styling:** Use a bright white color or a subtle glow for the "lit" text, while keeping the rest at a lower opacity.

### 4. Smooth Crawling Scroll
Instead of a single jump, we will implement a continuous scroll.

- **Formula:** `scrollPosition = turnTop + (progressPercentage * turnHeight)`.
- **Implementation:** During the `requestAnimationFrame` loop, we calculate the percentage of the audio played and adjust the `scrollTop` of the page accordingly.

## Implementation Steps

### Phase 1: Preparation (Manual)
1. **Record "You" Parts:** Record `.mp3` files for your turns.
2. **Generate ElevenLabs Audio:** Use the ElevenLabs API with the `with-timestamps` flag to get both the audio and the JSON alignment data.
3. **Asset Organization:** Place files in `/public/audio/`.

### Phase 2: Code Refactoring
1. Update `TurnType` in `page.tsx` and `turn.tsx`.
2. Refactor `PlayButton.tsx` to use `new Audio()`.
3. Implement the `SyncLoop` in `PlayButton` to emit timing events.
4. Modify `Turn.tsx` to support "Karaoke" highlighting (likely requiring a small utility to wrap text in spans).

### Phase 3: Verification
- Test synchronization on mobile and desktop.
- Ensure audio cleanup occurs if the user stops or navigates away.

## Considerations
- **ElevenLabs Cost:** Every text change requires a new API call.
- **HTML vs Text Sync:** Highlighting HTML content (with tags) is trickier than plain text; we'll need to map timestamps to the correct positions within the HTML string.
