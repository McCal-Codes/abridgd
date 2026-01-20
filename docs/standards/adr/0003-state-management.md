# ADR 0003: State Management (React Context API)

Last Updated: 2026-01-16

**Date**: 2026-01-15
**Status**: Accepted
**Author**: Engineering Lead

## Context

The Abridged app has three main pieces of state:
1. **User Profile**: Preferences (font size, theme, language)
2. **Saved Articles**: Bookmarked articles (persisted locally)
3. **Settings**: Sources, digest frequency, notification prefs

We needed a state management solution that is:
1. Simple (low cognitive load for new contributors)
2. Type-safe (TypeScript-first)
3. Persistent (survives app restart)
4. Efficient (re-renders only affected components)

## Decision

**Use React Context API with custom hooks for state management.**

Specifically:
- Create a context for each major piece of state (`ProfileContext`, `SavedArticlesContext`, `SettingsContext`)
- Use `useReducer` for complex state transitions (optional; start with `useState`)
- Persist state to `AsyncStorage` on write
- Wrap the app in context providers
- Export custom hooks (`useProfile`, `useSavedArticles`, `useSettings`) for component consumption

**Rationale:**
- React Context is built-in to React; no external dependencies.
- Context + hooks is idiomatic React; team is familiar with it.
- No need for Redux/MobX boilerplate for a small app.
- Persistence via `AsyncStorage` is straightforward.
- TypeScript integration is clean (no type generation overhead).

## Consequences

**Positive:**
- Minimal boilerplate; easy to understand and modify.
- Team is already using hooks; no new mental model.
- Type-safe via TypeScript; catches errors at build time.
- Each context is isolated; easier to test.

**Negative:**
- Context can cause unnecessary re-renders if not carefully memoized.
  - *Mitigated by: Use `React.memo` and `useMemo` in child components; consider context splitting.*
- As the app grows, may become unwieldy (large monolithic context provider).
  - *Migration path: Can upgrade to Redux/Zustand later without refactoring all components.*

## Alternatives considered

1. **Redux**
   - Rejected: Overkill for current state complexity; too much boilerplate for team size.

2. **Zustand**
   - Rejected: Lightweight alternative, but team is more familiar with React Context.

3. **Jotai / Recoil**
   - Rejected: Adds dependency and learning curve; not needed for current scale.

4. **Local component state + prop drilling**
   - Rejected: Works for small trees, but article + settings sharing is cumbersome.

## Migration criteria (upgrade to Redux/Zustand if)

- State tree grows beyond 500 lines of context code.
- More than 3 new contexts are created.
- Performance profiling shows context-induced re-renders are >10% of update time.
- Team requests a more structured state management tool.

## Implementation notes

- Each context is in `src/context/<Name>Context.tsx`.
- Hook names follow the pattern `use<Name>`.
- Persistence logic is in the context (write to `AsyncStorage` on state change).
- See `src/context/ProfileContext.tsx` for the reference implementation.
- Error boundaries should wrap context providers (see `src/components/ErrorBoundary.tsx`).

## Future considerations

- Consider `useCallback` / `useMemo` to prevent unnecessary re-renders.
- If performance becomes an issue, split contexts by concern (e.g., separate `ProfileUIContext` from `ProfileDataContext`).
- Add Redux DevTools middleware if we upgrade (for time-travel debugging).
