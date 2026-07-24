# Production Testing Strategy: fe-user-todo Monorepo

## 1. Executive Summary & Testing Philosophy

This document outlines the production-grade frontend testing strategy for the **`fe-user-todo`** Turborepo monorepo (`apps/web`, `packages/users`, `packages/todos`, `packages/ui`, `@repo/shared`).

The testing methodology follows the **Testing Trophy** model (focusing heavily on integration and component confidence supported by unit tests for shared logic and E2E browser flows). Since server tests are omitted, all network interactions are decoupled and mocked using **MSW (Mock Service Worker)** during testing.

```
          / \
         /   \        E2E Tests (Playwright - Mocked Backend / MSW)
        /-----\       ----------------------------------------------------
       /       \      App Integration Tests (MSW + RTL + TanStack Router)
      /---------\     ----------------------------------------------------
     /           \    Component & Form Validation Tests (Vitest + RTL + RHF)
    /-------------\   ----------------------------------------------------
   /               \  Static Analysis & Schema Validation (TypeScript + Zod)
  -------------------
```

### Core Objectives
1. **High Frontend Confidence**: Guarantee user management, todo workflows, form validation, and UI state function reliably.
2. **Fast Feedback Loops**: Leverage Turborepo build caching and Vitest speed for rapid developer feedback.
3. **Resilience to Refactoring**: Test user-visible behavior (accessible queries, user actions) rather than internal implementation details.
4. **Mocked API Contracts**: Standardize MSW handlers based on `@repo/shared` schemas to simulate all server responses cleanly.

---

## 2. Test Architecture & Tooling Stack

| Layer | Recommended Tooling | Scope & Focus |
|---|---|---|
| **Static & Schema** | TypeScript, Zod | Type safety, schema enforcement across apps and packages |
| **Unit Testing** | Vitest | Zod schemas, helper functions, state mappers, Jotai atoms |
| **Component & Form Testing** | Vitest, React Testing Library, `@testing-library/user-event` | UI component rendering, user interactions, React Hook Form + Zod validation (`packages/ui`, `packages/users`, `packages/todos`) |
| **API Network Mocking** | MSW (Mock Service Worker) | Intercept HTTP requests during frontend unit, integration, and E2E tests |
| **App Integration Testing** | Vitest, React Testing Library, TanStack Router | Page composition, route transitions, query params, TanStack Query caching (`apps/web`) |
| **End-to-End (E2E)** | Playwright | Full browser automation for user flows using MSW or mock server handlers |
| **Accessibility (a11y)** | axe-core / RTL accessible queries | ARIA roles, keyboard navigation, accessible form inputs |

---

## 3. Deep Dive: What is MSW + RTL?

### **RTL (React Testing Library)**
- **What it is**: A lightweight UI testing library for React components.
- **Philosophy**: Tests components from the perspective of an end user ("Test behavior, not implementation"). Instead of inspecting internal state or component instances, RTL queries the DOM using accessible elements (e.g., `screen.getByRole('button', { name: /submit/i })`).
- **User Interactions**: Used alongside `@testing-library/user-event` to simulate realistic user events like typing, clicking checkboxes, and submitting forms.

### **MSW (Mock Service Worker)**
- **What it is**: An API mocking library that intercepts HTTP/REST and GraphQL requests at the network level.
- **Philosophy**: Rather than monkey-patching `fetch` or `axios`, MSW captures outbound HTTP requests transparently using Service Workers in the browser or Node request interceptors during Vitest runs.
- **Why it matters**: Your frontend code (e.g. TanStack Query hooks, `fetch('/api/todos')`) executes its actual network logic unchanged, while MSW catches the request and returns realistic JSON fixtures or mock error codes.

### **Why Pair MSW + RTL Together?**
Combining **MSW + RTL** is the modern standard for testing React applications because it enables **full integration confidence without running a live backend**:

1. **Realistic Async Flow**: RTL renders the component tree (e.g., `<TodoList />`), while MSW supplies data when TanStack Query issues `GET /api/todos`. You can test loading states (`"Loading todos..."`), success states (rendering todo items), and failure states (`"Failed to load todos"`).
2. **Zero Code Coupling**: Component source code doesn't know it's being tested or mocked.
3. **Speed & Reliability**: Tests run blazingly fast in Vitest (Node JS DOM) without needing a live server or database setup.

#### Example Pattern (`packages/todos` component test):
```tsx
// 1. MSW intercepts request
server.use(
  http.get('/api/todos', () => HttpResponse.json([{ id: '1', title: 'Buy groceries', completed: false }]))
);

// 2. RTL renders component connected to TanStack Query
render(<TodoList />);

// 3. Assert loading state then rendered UI
expect(screen.getByText(/loading/i)).toBeInTheDocument();
expect(await screen.findByText('Buy groceries')).toBeInTheDocument();
```

---

## 4. Detailed Testing Strategy by Layer

### Layer 1: Shared Package Unit Testing (`packages/shared`)

**Target**: Validation schemas, constants, and utility functions.

- **What to Test**:
  - **Zod Schemas**: Verify valid data objects pass parsing and invalid data objects fail with expected validation error issues (`userSchema`, `todoSchema`, filter status enums).
  - **Utility Helpers**: Test mappers, date formatters, and data transformation helpers.
- **How to Test**:
  - Vitest test suites executed in Node environment.
  - Test matrix for boundary values (empty strings, malformed emails, missing required fields).

---

### Layer 2: UI Package Testing (`packages/ui`)

**Target**: Shared UI component library (buttons, inputs, dialogs, drawers).

- **What to Test**:
  - Render variants (primary, secondary, disabled states).
  - Event listeners (`onClick`, `onChange`) and keyboard accessibility.
  - Variant class composition (Tailwind merging via `clsx`/`tailwind-merge`).
- **How to Test**:
  - Vitest + `@testing-library/react` + `@testing-library/user-event` JS DOM environment.

---

### Layer 3: Feature Package & Component Testing (`packages/users`, `packages/todos`)

**Target**: Feature React components (`UserForm`, `CreateTodoForm`, `TodoList`).

- **What to Test**:
  - **Form Validation & React Hook Form Integration**:
    - Assert dynamic error message badges render when submitting empty or invalid fields in `UserForm` or `CreateTodoForm`.
    - Ensure submit callback functions fire **only** when form fields pass Zod validation rules.
    - Test submission states (disable buttons during pending status, reset form inputs on success).
  - **Component State & Interactive Behaviors**:
    - Toggle todo completion checkboxes.
    - Test Jotai atom state changes when selecting different users.
- **How to Test**:
  - Vitest + `@testing-library/react` + `@testing-library/user-event` JS DOM environment.
  - Network calls intercepted via **MSW (Mock Service Worker)** handlers.
  - Query elements strictly via accessible roles (e.g., `screen.getByRole('button', { name: /create todo/i })`).

---

### Layer 4: Web Application Integration Testing (`apps/web`)

**Target**: Full pages, routing with TanStack Router, TanStack Query caching, and global layout.

- **What to Test**:
  - **Routing & Query Params**: Verify navigating to `/todos?userId=123` correctly filters displayed todos.
  - **Data Fetching & Cache Management (TanStack Query)**:
    - Initial loading skeleton states -> data loaded state -> error boundary states.
    - Test cache invalidation (e.g., creating a todo triggers a re-fetch of the todo list).
  - **Global Notifications & Feedback**: Verify `sonner` toast alerts trigger on API successes or simulated network errors.
- **How to Test**:
  - Vitest with memory router setup (`createMemoryHistory`) wrapping TanStack Router.
  - MSW handlers intercepting all web app REST requests.
  - QueryClient provider configured with `retry: false` for deterministic test runs.

---

### Layer 5: End-to-End (E2E) & User Journey Testing (`apps/web`)

**Target**: Real browser interaction testing complete user journeys against the web application.

- **Critical User Journeys (CUJs)**:
  1. **User Creation & Todo Assignment**:
     - User opens web app -> opens User Form -> fills & submits valid user details.
     - User selects new user from user selector.
     - User creates a new todo for the selected user.
     - User toggles completion status and filters by "Completed".
  2. **Form Validation Feedback Journey**:
     - User submits empty form -> verifies validation error messages -> fills valid inputs -> error messages clear.
  3. **Theme & Responsiveness**:
     - User toggles dark/light theme; verify visual theme persists across page reload.
- **How to Test**:
  - **Playwright** running against Vite dev/preview server.
  - API responses mocked using Playwright `page.route()` or MSW Service Worker.

---

## 5. Test Data Management & Mocking Strategy

1. **Centralized MSW Handlers**:
   - Maintain a canonical set of MSW handlers in `@repo/shared` or `apps/web/src/mocks/handlers.ts` representing realistic API endpoints (`GET /api/users`, `POST /api/todos`, etc.).
   - Allow tests to override handlers per-test (e.g., `server.use(http.post('/api/todos', () => HttpResponse.json(null, { status: 500 })))`).
2. **Factory Fixtures**:
   - Provide helper functions (`createMockUser()`, `createMockTodo()`) to produce type-safe mock data objects.

---

## 6. CI/CD Integration & Turborepo Pipeline Strategy

### Turborepo Task Pipeline (`turbo.json`)
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:e2e": {
      "dependsOn": ["build"]
    }
  }
}
```

### Pipeline Jobs
1. **Lint & Typecheck**: `turbo run lint check-types`
2. **Unit & Component Tests**: `turbo run test -- --coverage` (target >= 80% coverage on shared & feature logic).
3. **E2E Tests**: `npx playwright test`

---

## 7. Implementation Roadmap

1. **Install Vitest & Testing Library**: Add `vitest`, `@testing-library/react`, `@testing-library/user-event`, and `msw` to devDependencies.
2. **Add Unit Tests for `@repo/shared`**: Validate Zod schemas (`userSchema`, `todoSchema`).
3. **Setup MSW Mock Server**: Configure central handlers for API endpoints.
4. **Add Component Tests for `packages/users` & `packages/todos`**: Validate `user-form.tsx` and `todo-form.tsx` React Hook Form validations.
5. **Setup Playwright**: Configure `playwright.config.ts` for `apps/web` E2E user flow tests.
