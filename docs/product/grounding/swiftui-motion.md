# SwiftUI Motion Guidance for Grounding Styles

**Objective**
Deliver four calming breathing patterns in SwiftUI without ever resembling progress/loading indicators. All primitives should be fluid, rounded, and interruptible.

---

## Shared Motion System
- **Container**: `RoundedRectangle(cornerRadius: 32, style: .continuous)` or capsule variants. Never hard corners.
- **Timeline**: 30-second base loop (Standard pace). Structure: inhale → micro-stillness → exhale → micro-stillness. Ratios differ per style.
- **Easing**: Use cubic bezier (`.timingCurve(0.45, 0, 0.2, 1)`) for inhale, `.timingCurve(0.2, 0, 0.45, 1)` for exhale. Avoid linear easing.
- **State Machine**: `ObservableObject` driving a `Phase` enum (`.inhale`, `.holdIn`, `.exhale`, `.holdOut`). Enables Reduce Motion overrides (skip scaling, use opacity shifts only).
- **Accessibility Hooks**:
  - `Reduce Motion` → swap scale/position changes for subtle opacity/blur pulses.
  - `Reduce Brightness Shifts` → clamp gradient delta to ±5% luminance.
  - Haptics (if enabled) → light taps on phase boundaries via `UIImpactFeedbackGenerator(style: .soft)`.
  - Sound (if enabled) → single, low-volume pad swell synced to inhales.

---

## Style Recipes

### 1. Steady (Default)
- **Visual**: Full-screen backdrop with 24px margin, `RoundedRectangle` filled with dual-tone gradient.
- **Motion**: Scale from 0.94 → 1.0 over 5s (inhale), hold 0.5s, scale 1.0 → 0.92 over 6s (longer exhale), hold 1s.
- **Secondary cue**: Gradient stops shift ±8° hue during phases.
- **Implementation**: Two `TimelineView(.animation)` layers—one for scale, one for gradient offset—for smoothness.

### 2. Settle
- **Visual**: Edge vignette using `RadialGradient` masked to rounded rect.
- **Motion**: Opacity oscillation 0.55 ↔ 0.7 over 8s; no holds (continuous exhale sensation). Slight blur radius modulation (1px ↔ 3px).
- **Notes**: Always keep amplitude low so it feels like lingering exhale.

### 3. Anchor
- **Visual**: Center stays at 100% opacity/scale. Two peripheral `AngularGradient` rings clipped to edges.
- **Motion**: Rings translate inward by 12pt during inhale, retreat during exhale, creating edge-led cues.
- **Micro-motion**: Add 1px noise-based shimmer to edges to keep them alive during holds.
- **Integration**: Lives inside pull-down sheet; ensure sheet responds to drag gestures even while animation runs.

### 4. Companion (Optional)
- **Visual**: Rounded blob (`Circle().morphing`) with abstract face (two dots + curved line). Default hidden.
- **Motion**: Blob squish: scaleX 0.92 ↔ 1.04, scaleY inverse, synced with breathing to imply inhaling chest.
- **Expression**: Eyes drift 2pt up on inhale, down on exhale. Keep mouth arc subtle.
- **Accessibility**: If Reduce Motion active, keep facial micro-motions but disable blob scaling.

---

## Entry & Exit
- **Entry**: 250ms fade-in + scale from 0.97. Use `.spring(response: 0.4, dampingFraction: 0.78)` so it feels like joining a living surface, not a pop.
- **Exit**: Fade-out over 180ms with scale to 1.02 (micro exhale) before removal. Allow interruption at any phase.

---

## State Handling
- Maintain `GroundingSession` model containing style, pace, sensory settings.
- Animations restart fresh when user changes style mid-session (no abrupt jumps—crossfade to new view over 400ms).
- For Tier 1 pre-entry, auto-dismiss after 30s unless user stays (tap to extend). Tier 3 uses 45–60s; show soft progress hint by subtly slowing the exhale near completion instead of rendering a counter.

---

## Testing Checklist
- Verify animations remain under 60 FPS on iPhone 12 mini hardware.
- Confirm Reduce Motion and Reduce Brightness toggles take effect instantly.
- Ensure gesture priorities: pull-down sheet (Tier 2) should hand back scroll once dismissed.
- Snapshot tests: capture each style’s keyframe at 25%, 50%, 75% loop positions to prevent regression in rounding/gradients.
