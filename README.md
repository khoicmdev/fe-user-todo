# Architecture & Handover Overview: `fe-user-todo`

Welcome to the **`fe-user-todo`** monorepo! This document summarizes our key architectural decisions, monorepo package structure, state management strategy, and technical trade-offs to help your team get onboarded quickly.

---

## 1. Monorepo Structure & Package Boundaries

The repository is built with **Turborepo** and partitioned into distinct domain packages and applications:

```
fe-user-todo/
├── apps/
│   ├── web/               # Application shell (Vite, TanStack Router, layout composition)
│   └── server/            # REST API backend (Express, Node, Zod validation)
└── packages/
    ├── shared/            # Shared DTOs, Zod schemas, API contracts & constants
    ├── ui/                # Dumb design system components (Button, Input, Card, Popover)
    ├── users/             # User domain package (UserTable, UserForm, UserDetail, user atoms)
    └── todos/             # Todo domain package (TodoTable, CreateTodoForm, TodoDetail, todo atoms)
```

### Why We Split the Monorepo This Way
- **Feature Domain Isolation**: By isolating `users` and `todos` into separate packages, team members can work on user management or todo features independently without risk of merge conflicts or cross-domain spaghetti code.
- **Dumb UI vs. Smart Features**: `@repo/ui` contains unstyled/styled primitive components with zero domain knowledge. Feature packages (`@repo/users`, `@repo/todos`) encapsulate domain business logic, data-fetching, and form validation.
- **Single Source of Truth (`@repo/shared`)**: All Zod schemas and TypeScript interfaces are defined centrally, ensuring strict type-safety across both frontend packages and the backend server.

---

## 2. Key Architectural Decisions

### A. Slot Composition Architecture
To maintain strict boundaries between domain packages (`users` and `todos`), **`packages/users` does not import `packages/todos` directly**. 

Instead, views like `UserDetail` accept UI slots (`createTodoFormSlot`, `todoTableSlot`) provided by `apps/web`. The web shell acts as the **Composition Root**, injecting `<CreateTodoForm />` and `<TodoTable />` into the user view. This ensures packages remain completely decoupled and unit-testable in isolation.

### B. Multi-Tiered State Management
We deliberately separate server state, form state, and client state:
1. **Server State**: Managed via **`jotai-tanstack-query`** (`atomWithQuery`, `atomWithMutation`, `atomWithInfiniteQuery`). This gives us automatic caching, deduplication, and background refetching.
2. **Cross-Cutting UI State**: Managed via **primitive Jotai atoms** (`selectedUserIdAtom`, `isUserSelectedAtom`). Shared global UI state is lightweight and accessible anywhere without Redux boilerplate.
3. **Form State**: Managed via **React Hook Form + Zod** (`zodResolver`). Form inputs perform validation on change with zero unnecessary re-renders.

### C. Accessibility & Semantic HTML
All forms use semantic HTML (`<form>`, `<button type="submit">`), accessible label associations (`<label htmlFor="...">`), and focus indicators. Complex popovers/comboboxes leverage Radix UI primitives for built-in keyboard navigation (`Tab`, `Enter`, `Escape`, `Arrow` keys).

---

## 3. Trade-offs & Considerations

| Decision | Benefit | Trade-off |
|---|---|---|
| **Domain Package Isolation** | Clean architectural boundaries; easy code ownership | Requires slot composition in `apps/web` shell rather than direct component imports |
| **Atomic State (Jotai)** | Zero boilerplate; granular re-renders for cross-cutting UI state | Requires clear naming conventions to distinguish client atoms from server query atoms |

---

## 4. Performance Reflections & Optimization Strategies

### A. Re-render Prevention
- **Atomic State Granularity (Jotai)**: By using primitive Jotai atoms (`selectedUserIdAtom`), only components subscribing to `useAtomValue(selectedUserIdAtom)` re-render when the selected user changes. This avoids top-down tree re-renders inherent in React Context or monolithic store providers.
- **Uncontrolled Form Fields (React Hook Form)**: Forms (`UserForm`, `CreateTodoForm`, `UserDetail`) leverage `react-hook-form` to isolate field state. Typing into inputs does not trigger parent component re-renders on every keystroke.
- **DOM Virtualization (`@tanstack/react-virtual`)**: `UserTable` and `GlobalTodoTable` virtualize list rows using `useVirtualizer`, rendering only the elements visible in the viewport instead of hundreds of DOM nodes.

### B. Query Caching & Memory Management
- **Deduplication & Cache Invalidation**: `jotai-tanstack-query` automatically deduplicates identical data requests. When a mutation occurs (e.g. creating a todo or user), targeted query key invalidation (`queryClient.invalidateQueries`) keeps the cache fresh without manual state synchronization.
- **Infinite Query Pagination**: Large lists (`usersInfiniteQueryAtom`, `todosInfiniteQueryAtom`) fetch data page-by-page, keeping network payloads compact and memory consumption low.

### C. Code-Splitting & Bundle Optimization
- **Route-Level Code Splitting**: TanStack Router lazy-loads feature page components (`/users`, `/todos`, `/users/$id`), reducing initial bundle sizes.
- **Tree-Shaking**: All domain packages (`@repo/ui`, `@repo/users`, `@repo/todos`) are exported as ES modules (`"type": "module"`), allowing Vite/Rollup to drop unused icons or helper utilities during production builds.
- **React Compiler Integration**: Configured `babel-plugin-react-compiler` automatically memoizes component props and JSX subtrees, reducing manual `useMemo`/`useCallback` maintenance.

---

## 5. Quick Start Commands

```bash
npm install       # Install all monorepo workspace dependencies
npm run dev       # Launch web app (http://localhost:3000) and server (http://localhost:3001) concurrently
npm run build     # Typecheck and build all packages via Turborepo
npm run lint      # Run ESLint across all apps and packages
```

