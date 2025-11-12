# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

Nirgali is a frontend application for managing deviation messages, cancellations, and extra journeys in the Entur public transportation system. It has a corresponding backend component: [enlil](https://github.com/entur/enlil).

## Development Commands

### Starting the Development Server
```bash
npm start
```
The dev server runs on port 3001 (configured in vite.config.mts). This command automatically copies the dev config file from `.github/environments/config-dev.json` to `public/config.json`.

### Running Tests
```bash
npm test                # Run tests in watch mode
npm run test:coverage   # Run tests with coverage reports
```

Tests use Vitest with jsdom environment. The test setup file is at `src/setupTests.ts`.

### Building
```bash
npm run build
```
TypeScript compilation is run first, then Vite builds the production bundle to the `build` directory.

### Code Formatting
```bash
npm run format  # Format all code
npm run check   # Check formatting without making changes
```

Prettier is configured with `singleQuote: true`. Husky pre-commit hooks automatically format staged files.

## Architecture

### Authentication & Authorization
- Uses OIDC authentication via `react-oidc-context` and `oidc-client-ts`
- On app load (`src/index.tsx`), fetches `/config.json` containing API endpoints and OIDC configuration
- The `AuthenticatedApp` component handles the authentication flow and redirects unauthenticated users
- Authorization is role-based with permissions for three feature areas: MESSAGES, CANCELLATIONS, and EXTRAJOURNEYS
- User permissions are fetched via `useOrganizations` hook from the deviation-messages API's `userContext` query
- Admin users have access to all features; non-admin users have codespace-specific permissions

### Configuration System
The app uses runtime configuration loaded from `/config.json`:
- `deviation-messages-api`: Backend GraphQL API for messages, cancellations, and extra journeys
- `journey-planner-api`: Entur's journey planner GraphQL API for service journey data
- `stop-places-api`: REST API for stop place and topographic place data
- `oidcConfig`: OIDC authentication settings

Configuration is provided via `ConfigContext` (src/config/ConfigContext.ts) and accessed through `useConfig()` hook.

### API Layer (src/api/api.js)
The API module creates Apollo Client instances and exports functions for:
- **Journey Planner API**: authorities, lines, departures, service journeys, operators
- **Stop Places API**: stop places, topographic places (REST endpoints)
- **Deviation Messages API**: messages, cancellations, extra journeys, user context (requires authentication)

All authenticated endpoints automatically inject the OIDC access token via the Authorization header.

### Component Structure
The app has three main feature areas, each with overview, register, and edit components:

1. **Messages** (`src/components/messages/`): Deviation messages (SIRI-SX situation elements)
2. **Cancellations** (`src/components/cancellations/`): Trip cancellations (SIRI-ET)
3. **Extra Journeys** (`src/components/extrajourneys/`): Additional trips not in the regular schedule (SIRI-ET)

Common components in `src/components/common/` include line picker and stop picker.

### Routing & Navigation
- React Router v7 with tab-based navigation
- Routes defined in `src/components/app/appRouter.tsx`
- Default route redirects to `/meldinger` (messages)
- Tab URLs: `/meldinger`, `/innstillinger`, `/ekstrature`
- Tabs are conditionally rendered based on user permissions

### Organization & Multi-tenancy
- The app supports multiple organizations/authorities
- Users select an active organization via the navbar
- The selected organization is provided via `SelectedOrganizationContext`
- Organization format: `codespace:authority` (e.g., `NSB:Authority:NSB`)
- Permissions are checked against the codespace portion of the organization ID

### Custom Hooks (src/hooks/)
- `useOrganizations`: Fetches user context and available authorities, handles authorization
- `useSelectedOrganization`: Accesses the currently selected organization from context
- `useMessages`, `useCancellations`, `useExtrajourneys`: Fetch and manage respective data
- `useLines`, `useOperators`: Fetch reference data from journey planner API

### Styling
- Uses Bootstrap 5 for base styles
- Entur design system components (@entur/* packages) for UI elements
- Custom SCSS in `src/style/base/base.scss`
- Background image applied globally

## Technology Stack
- **Build Tool**: Vite with React SWC plugin
- **Framework**: React 19
- **Routing**: React Router v7
- **API**: Apollo Client for GraphQL, fetch for REST
- **Authentication**: OIDC (react-oidc-context)
- **UI Library**: Entur design system components
- **Testing**: Vitest with jsdom
- **Language**: TypeScript (strict mode enabled)
- **Styling**: SCSS with Bootstrap

## Important Notes
- The project uses a mix of TypeScript (.ts/.tsx) and JavaScript (.js/.jsx) files
- GraphQL queries are defined inline with `gql` template literals in `src/api/api.js`
- The `ET-Client-Name` header is set to "entur - deviation-messages" for all API requests
- Date handling uses `@internationalized/date` library
