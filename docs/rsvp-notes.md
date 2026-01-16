# RSVP Implementation Notes

Last Updated: 2026-01-16

## Concept
RSVP (Rapid Serial Visual Presentation) is a method of displaying information where text is displayed word-by-word at a fixed focal point.

## UX Constraints
1.  **Pacing:** It cannot be linear. Longer words need more time. Punctuation (periods, commas) needs significant pauses.
2.  **Context:** Users lose context easily. We must provide a way to "rewind" or see the surrounding sentence.
3.  **Fatigue:** High WPM (Words Per Minute) is tiring. Sessions should be short.

## Technical Considerations
*   **Engine:** `setTimeout` or `requestAnimationFrame`. React state updates might be too slow/jittery at high speeds (600+ WPM). Consider a `ref` based approach for the text rendering or a native module if JS thread is blocked.
*   **Attentional Blink:** The phenomenon where the brain "misses" the second of two targets presented in close succession. We may need to color-highlight key entities (Names, Places) to anchor attention.
*   **Controls:**
    *   Tap to Pause/Play
    *   Scrub bar to move position
    *   WPM slider

## Future Roadmap
*   **v1:** Simple linear word display.
*   **v2:** "Smart Pacing" algorithm (slows down for complex words).
*   **v3:** Bionic reading integration (bolding start of words).

## Onboarding & Tutorial Strategy
Users unfamiliar with RSVP often feel overwhelmed. The "Abridged Mode" tutorial must:
1.  **Forced Slow Start:** Begin at ~200 WPM (conversational speaking speed) regardless of user confidence.
2.  **Focus Training:** Use visual guides (reticles or color highlights) to train the eye to stay fixed.
3.  **Progressive Overload:** unlock higher speeds only after completing a short article segment.
4.  **Confidence Check:** Ask "Did you catch that?" after the first paragraph. If no, slow down.
