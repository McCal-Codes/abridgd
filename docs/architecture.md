# Architecture

## Overview
Abridged is built as a **TypeScript Expo (React Native)** application. It prioritizes native performance, strict typing, and a modular component structure.

## Tech Stack
*   **Framework:** React Native (via Expo SDK 50+)
*   **Language:** TypeScript
*   **Navigation:** React Navigation (Native Stack + Bottom Tabs)
*   **State Management:** React Context + Local State (initially). No Redux/Zustand until complexity demands it.
*   **Styling:** StyleSheet API with a central theme system (Tokens).

## Navigation Structure
The app uses a nested navigation strategy:
1.  **RootNavigator (Stack):** Handles the top-level modals and full-screen transitions (e.g., Opening an Article).
2.  **TabNavigator (Bottom Tabs):** The main interface for browsing categories.

## Data Flow
*   **Current:** Data is mocked in `src/data/mockArticles.ts` and consumed directly by screens.
*   **Future:** An `ArticleService` will abstract fetching from local storage or an API.

## Design System
We use a token-based design system located in `src/theme/`.
*   **Colors:** Semantic naming (primary, surface, text) rather than descriptive (blue, white, black).
*   **Typography:** Centralized scale for font sizes and weights to ensure consistency.
*   **Spacing:** 8pt grid system.

## Why Expo?
*   **Speed:** Fast iteration with Expo Go.
*   **Maintenance:** Managed workflow reduces native build complexity.
*   **Updates:** OTA updates (EAS Update) are seamless for news apps.
