# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nirgali is a frontend application for managing deviation messages, cancellations, and extra journeys in the Entur public transportation system. Backend: [enlil](https://github.com/entur/enlil). Sister app (similar architecture): [enki](https://github.com/entur/enki).

## Development Commands

```bash
npm start                  # Dev server on port 3001 (copies config-dev.json to public/config.json)
npm run build              # TypeScript check + Vite production build to build/
npm test                   # Vitest in watch mode
npx vitest run             # Single test run
npx vitest run src/path    # Run specific test file
npm run test:coverage      # Coverage report
npm run format             # Prettier format all files
npm run check              # Prettier check without writing
npx tsc --noEmit           # Type check without emitting
```

Prettier is configured with `singleQuote: true`. Husky pre-commit hooks auto-format staged files.

## Architecture

### Provider Hierarchy (src/index.tsx)
ConfigContext → ThemeProvider → CssBaseline → LocalizationProvider → Redux Provider → AuthProvider → App

### State Management
- **Redux Toolkit** with typed hooks (`useAppDispatch`, `useAppSelector` in `src/store/hooks.ts`)
- Slices in `src/reducers/`: organizations, messages, cancellations, extrajourneys, notification
- Organization selection and permissions are in Redux (`organizationsSlice`)
- Feature data hooks (`useMessages`, `useCancellations`, `useExtrajourneys`) still fetch via local state and the API module directly — not yet wired through Redux thunks

### UI & Styling
- **MUI (Material-UI)** for all components — no CSS/SCSS files, no inline styles
- All styling via MUI `sx` prop and theme component overrides
- Entur-branded MUI theme in `src/theme/theme.ts` (matches enki's theme)
- Key MUI patterns: `Table`/`TableContainer` for data, `Autocomplete` for searchable selects, `Chip` for status indicators, `DateTimePicker`/`DatePicker` for dates, `Alert` for warnings

### API Layer (src/api/api.ts)
Factory function `api(config, auth)` returns an object with methods for three APIs:
- **Journey Planner API** (public, no auth): authorities, lines, departures, service journeys, operators
- **Stop Places API** (REST): stop places, topographic places
- **Deviation Messages API** (authenticated): messages, cancellations, extra journeys, user context

GraphQL queries are inline `gql` template literals. The `ET-Client-Name` header is `"entur - deviation-messages"`.

### Authentication & Authorization
- OIDC via `react-oidc-context` / `oidc-client-ts`
- Runtime config loaded from `/config.json` (API endpoints + OIDC settings)
- Role-based: permissions for MESSAGES, CANCELLATIONS, EXTRAJOURNEYS
- Admin users see all features; others get codespace-specific permissions
- `useOrganizations` hook fetches user context and filters authorities

### Feature Areas
Three tab-based features at `/meldinger`, `/kanselleringer`, `/ekstraavganger`. Each has Overview (list), Register (create), and Edit (update) components. Business logic is extracted into helper files (`messageHelpers.ts`, `mapEstimatedCall.ts`, `mapExtraJourney.ts`, `validate.ts`).

### Routing
React Router v7. Routes in `src/components/app/AppRouter.tsx`. Default redirects to `/meldinger`. Tabs conditionally rendered based on user permissions.

### Organization & Multi-tenancy
Organization format: `codespace:Authority:name` (e.g., `NSB:Authority:NSB`). The codespace prefix is used for API calls and permission checks.

### Testing
Vitest + jsdom + React Testing Library. Custom `render()` in `src/util/test-utils.tsx` wraps components with Redux Provider, ThemeProvider, ConfigContext, and optionally MemoryRouter.

## Tech Stack
React 19, TypeScript (strict), Vite, MUI 7, Redux Toolkit, Apollo Client, React Router v7, Vitest, `@internationalized/date` for date handling.
