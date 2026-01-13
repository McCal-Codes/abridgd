# Abridged

A focused, calm, and distraction-free news reader for Pittsburgh.

![Abridged App Concept](https://via.placeholder.com/800x400?text=Abridged+App+Concept)

## Overview

Abridged is a mobile application built with React Native and Expo that aims to rethink how local news is consumed. Instead of infinite feeds and gamified engagement, Abridged offers a finite, daily edition of curated stories.

It features two distinct reading modes:
1.  **Classic Mode:** A clean, typography-focused reading experience.
2.  **Abridged Mode (Coming Soon):** An RSVP (Rapid Serial Visual Presentation) reader for high-speed information ingestion.

## Tech Stack

*   **Framework:** React Native (Expo SDK 50)
*   **Language:** TypeScript
*   **Navigation:** React Navigation
*   **State:** Local State (Context API planned)
*   **Backend:** Mocked Data (currently)

## Getting Started

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npx expo start
    ```
4.  Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Project Structure

*   `src/`: Main source code.
    *   `src/App.tsx`: Main application component.
*   `src/screens/`: Feature screens (Home, Section, Article).
*   `src/components/`: Reusable UI components.
*   `src/navigation/`: Navigation configuration.
*   `src/theme/`: Design tokens (Colors, Typography).
*   `src/data/`: Mock data sources.
*   `scripts/`: Active maintenance and testing scripts.
*   `_archive/`: Deprecated scripts and experiments.
*   `docs/`: Project documentation and architecture decisions.

## Documentation

*   [Vision](./docs/vision.md)
*   [Architecture](./docs/architecture.md)
*   [Roadmap](./docs/roadmap.md)
*   [RSVP Research](./docs/rsvp-notes.md)
