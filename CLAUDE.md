# Project Overview
Mobile-first React web application for building *Fatherfog 0e* TTRPG characters.

# Tech Stack & UI
- **Framework:** React with TypeScript (Vite)
- **UI Library:** Material UI (MUI) — prioritize responsive, mobile-friendly touch targets (minimum 44x44px) and MUI `Stepper` components for the creation flow.
- **State & Persistence:** Local client-side state with clean serialization for character export/save.

# Architecture & Code Boundaries
- **Strict Separation of Concerns:** Isolate all pure *Fatherfog 0e* rules math, dice/RNG utilities (including duplicate-filtering table rolls), stat derivations, and skill prerequisite trees inside `src/domain/`.
- **Zero UI in Domain:** Files inside `src/domain/` must contain pure TypeScript functions and types only—never import React, MUI, or DOM APIs there.
- **Presentation Layer:** Keep UI components in `src/components/` thin; they should render state and dispatch domain actions rather than embedding game rules logic.

# Workflow & Conventions
- Prefer small, testable pure functions with unit tests for rules calculations.
- Ask before installing additional third-party dependencies beyond React, MUI, and standard Vite tooling.
