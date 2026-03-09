# Web App Agent Instructions

Project-specific conventions for `apps/web/`.

## Architecture

### Directory Structure

```
src/
  app/           Next.js App Router (pages + API routes)
  components/    React components
  config/        Feature flags, app configuration
  data/          Static content that populates pages (constants, arrays, metadata)
  services/      Webapp infrastructure (HTTP client, rate limiter, webhook helpers)
  tools/         Self-contained microservices (framework-agnostic core logic)
  types/         Shared Zod schemas and inferred types
  utils/         Pure functions (no side effects, no state)
```

### tools/ vs services/

- `services/` = webapp-coupled infrastructure (shared axios, rate limiter, botpress webhook)
- `tools/` = self-contained microservices whose core logic has ZERO webapp imports
  - Core (`tools/<name>/`) imports only npm packages and node builtins
  - Adapter layer lives in `app/` (API routes, pages) and wires the core to Next.js

### Module Structure Convention

Each service, tool, or domain module follows this pattern:
- `module/index.ts` — exports (barrel file for large modules, implementation for small ones)
- `module/types.ts` — Zod schemas + inferred types

### Type Conventions

- **Zod schemas are for runtime validation only.** If a schema is used with `.parse()` or `.safeParse()` at runtime, use Zod:
  ```typescript
  export const fooSchema = z.object({...});
  export type Foo = z.infer<typeof fooSchema>;
  ```
- **If a type is only used for type-checking (never validated at runtime), use a plain TS interface.** Don't import Zod just to derive a type — that adds bundle size for zero benefit, and the linter flags the schema as "only used as a type."
- Types with `ReactNode` or non-serializable values use plain TS interfaces
- Component-local types (props, internal state) stay in the component file
- Route-specific validation schemas stay in the route file

### Import Organization

1. External packages (react, next, zod, axios)
2. Blank line
3. Internal imports (@/services/..., @/data/..., @/types/..., @/utils/..., @/tools/..., @/components/..., @/config/...)

### Import Rules for tools/

Files inside `tools/<name>/` MUST NOT import from:
- `@/services/`, `@/data/`, `@/components/`, `@/config/`, `@/types/`
- `next/server` or any Next.js API

Files inside `tools/<name>/` MAY import from:
- npm packages (axios, zod, etc.)
- node builtins (crypto, fs, path)
- Other files within the same tool (`./types`, `./store`, etc.)

Only `tools/<name>/adapter.ts` may import Next.js APIs.

### API Route Conventions

- Export `runtime = "nodejs"` and `dynamic = "force-dynamic"`
- Validate with Zod `.safeParse()`, return first error message
- Error responses: `NextResponse.json({ error: "..." }, { status: N })`
- Non-idempotent axios calls: add `"axios-retry": { retries: 0 }`
- Email max: `.max(254)` per RFC 5321

### Code Quality

- Comments: only "the why," never "the what"
- No unused exports — if something isn't imported, delete it
- fetch → axios: axios throws on 4xx/5xx, always wrap in try/catch
