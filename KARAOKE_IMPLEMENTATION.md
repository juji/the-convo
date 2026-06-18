# Karaoke Effect Implementation Plan

## Goal
Text should "turn on" (highlight) as it's being read, and stay highlighted after being read.

## Current State
- Plays each turn with SpeechSynthesis
- Highlights the entire turn container (scale + opacity)
- Does NOT highlight individual words/paragraphs within the text

## Approach: Paragraph-level highlighting

### Why Paragraph Level?
- Simpler than word-level: no need to track word boundaries
- Preserves HTML formatting beautifully
- Each paragraph/block turns on when its utterance starts
- Works with semantic elements: `<p>`, `<li>`, `<th>`, `<td>`, `<blockquote>`

### Implementation Steps

#### 1. Add `text` field to convo-html.json turns
For ChatGPT turns, add stripped text alongside HTML:
```json
{
  "speaker": "ChatGPT",
  "html": "<p>...</p>",
  "text": "Plain text for speech synthesis timing"
}
```

#### 2. Modify PlayButton to emit paragraph bounds
- Track current paragraph index within current turn
- On utterance `onboundary` events, calculate which paragraph we're in
- Emit `onParagraphChange(turnIndex, paragraphIndex)` to parent

#### 3. Create HTML highlighting utility
```typescript
// Takes HTML and paragraph index, returns HTML with spans around each paragraph
// <p>First para</p><p>Second para</p> + index=1
// becomes: <p class="lit">First para</p><p class="lit">Second para</p>
```

#### 4. Modify Turn component
- Accept `litParagraphIndex` prop
- Render HTML with inline styles for lit paragraphs
- Use CSS transition for smooth color change

#### 5. Modify page.tsx
- Track `litParagraphIndex` state per turn
- Pass cumulative word/paragraph index to each Turn
- Past turns: all paragraphs lit
- Current turn: paragraphs up to current lit
- Future turns: no paragraphs lit

### Key Insight
The `onboundary` event in SpeechSynthesis fires at character/word boundaries. We can:
1. Strip HTML to get plain text
2. Map charIndex to text position  
3. Track which paragraph that character falls in
4. Highlight that paragraph and all before it

### Algorithm for HTML paragraph mapping
1. Parse HTML into array of text blocks (ignoring tags)
2. Build a map of character positions to block indices
3. When `onboundary` fires, find which block we're in
4. Inject `<span class="lit">` wrappers into original HTML at block boundaries

### CSS for lit effect
```css
.lit { color: white; transition: color 150ms; }
.not-lit { color: rgb(161 161 170); } /* zinc-400 */
```

## Files to Modify
1. `app/_components/play-button.tsx` - Add boundary tracking + onParagraphChange callback
2. `app/_components/turn.tsx` - Accept highlighted HTML and render with lit state
3. `app/page.tsx` - Track and propagate paragraph illumination state
4. `app/_data/convo-html.json` - Add `text` field for timing reference