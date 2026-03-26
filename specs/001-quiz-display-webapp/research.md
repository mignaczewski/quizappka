# Research: Quiz Display Web Application

**Feature**: Quiz Question Presentation  
**Branch**: `001-quiz-display-webapp`  
**Phase**: 0 – Research  
**Date**: 2026-03-26

---

## RES-001: ASP.NET Core SPA Proxy with Vite (.NET 10)

**Decision**: Use `Microsoft.AspNetCore.SpaProxy` NuGet package with `spa.proxy.json` auto-detection.

**Rationale**:  
The modern .NET 10 SPA proxy mechanism eliminates explicit `UseSpa()` / `UseReactDevelopmentServer()` calls. The proxy is activated automatically via `SpaProxyStartupFilter` when the project is built with `SpaProxyServerUrl` and `SpaProxyLaunchCommand` properties in the `.csproj`. In production no proxy is active — the app serves the pre-built Vite output from `wwwroot/`.

**Key configuration**:
```xml
<!-- QuizAppka.csproj -->
<PropertyGroup>
  <SpaRoot>ClientApp\</SpaRoot>
  <SpaProxyServerUrl>http://localhost:5173</SpaProxyServerUrl>
  <SpaProxyLaunchCommand>npm run dev</SpaProxyLaunchCommand>
</PropertyGroup>
```

`Program.cs` requires only:
```csharp
app.UseStaticFiles();
app.MapFallbackToFile("index.html");
```

**Alternatives considered**: `Microsoft.AspNetCore.SpaServices.Extensions` (deprecated), manual Vite dev server management (unnecessary complexity).

**Gotchas**:
- `spa.proxy.json` must exist in the bin directory; this is created automatically on build when properties are present.
- Vite proxy target in `vite.config.ts` must match backend dev port (e.g., `https://localhost:7001`).
- `secure: false` required in Vite proxy config for self-signed dev certificates.
- SPA proxy is **only active in Development** environment; production serves from `wwwroot/`.

---

## RES-002: Single-Project Structure (.NET 10 + Vite React TS)

**Decision**: React/Vite project lives in `ClientApp/` inside the .NET project root. Vite build output targets `wwwroot/`.

**Rationale**:  
This mirrors the official ASP.NET Core + React template pattern. A single `.csproj` file orchestrates both layers, keeping deployment simple. The `ClientApp/` source is excluded from `wwwroot/` (which holds only the built output).

**Directory layout**:
```
QuizAppka/
├── ClientApp/               # Vite React TypeScript source
│   ├── vite.config.ts
│   ├── package.json
│   └── src/
├── Controllers/
├── Models/
├── Services/
├── Data/                    # JSON quiz data (NOT HTTP-accessible)
│   └── categories/
├── wwwroot/                 # Vite build output + static images
│   └── images/
│       └── rebus/
├── Program.cs
└── QuizAppka.csproj
```

**Vite config key points**:
- `outDir: '../wwwroot'` so build output is placed directly in the .NET static file root.
- Server proxy at `/api` → backend HTTPS dev port.

**Alternatives considered**: Separate frontend project in monorepo (unnecessary for single-app scenario); `wwwroot/` as source (wrong — wwwroot is for served assets only).

---

## RES-003: .NET Aspire Integration

**Decision**: Separate `QuizAppka.AppHost` project for Aspire orchestration. The main `QuizAppka` web project remains a standard single-project app.

**Rationale**:  
Aspire AppHost is always a separate project — it is the orchestration entry point for local development and cloud deployment. It does not change the main application's code. For development, Aspire starts both the ASP.NET Core backend and the Vite dev server; SPA proxy handles the browser-facing frontend routing.

**Aspire AppHost pattern**:
```csharp
// QuizAppka.AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);
builder.AddProject<Projects.QuizAppka>("quizapp");
builder.Build().Run();
```

The Vite dev server is launched by the SPA proxy mechanism inside the web project, not directly by Aspire. Aspire provides: service discovery, dashboard, distributed tracing, and cloud deployment manifests.

**Prerequisites**: `dotnet workload install aspire`

**Alternatives considered**: Running Aspire without a separate AppHost (not supported); full Aspire orchestration of Vite as a separate Node resource (adds complexity not required for MVP, the SPA proxy already handles it).

---

## RES-004: JSON Data Storage and Loading

**Decision**: JSON category files stored in `Data/categories/` (content root), loaded once at startup into a singleton service.

**Rationale**:  
Quiz data is read-only and predefined. Loading at startup eliminates per-request I/O during live presentations. `Data/` at the content root is inaccessible via HTTP (unlike `wwwroot/`), which is correct — raw JSON data should not be directly downloadable by browsers.

**Loading pattern**:
- `IQuizDataService` singleton registered in DI
- On first access, reads all `*.json` files from `Data/categories/`
- Validates and caches `IReadOnlyList<QuizCategory>` in memory
- Invalid or malformed files are logged and excluded from the available categories

**JSON structure** (per file, one file per category):
```json
{
  "id": "history-101",
  "name": "World History",
  "questions": [
    { "id": "q1", "type": "open", "prompt": "..." },
    { "id": "q2", "type": "closed", "prompt": "...", "options": [...] },
    { "id": "q3", "type": "image-rebus", "prompt": "...", "imageRef": "rebus/q3.png" }
  ]
}
```

**Alternatives considered**: Single large JSON file (harder to maintain, all-or-nothing failure); database (out of scope, no persistence requirement); embedded resources (requires recompile to update content).

---

## RES-005: Question Type Discrimination

**Decision**: `type` string discriminator field in JSON, mapped to C# class hierarchy using `System.Text.Json` `[JsonPolymorphic]` / `[JsonDerivedType]` attributes (.NET 7+, still standard in .NET 10).

**Rationale**:  
`System.Text.Json` supports first-class polymorphism via `[JsonPolymorphic]` on the base type. This avoids manual switch/case deserialization and keeps the model clean. For a read-only scenario no special converters are needed.

**C# model sketch**:
```csharp
[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(OpenQuestion), "open")]
[JsonDerivedType(typeof(ClosedQuestion), "closed")]
[JsonDerivedType(typeof(ImageRebusQuestion), "image-rebus")]
public abstract class Question { ... }
```

**Alternatives considered**: Custom `JsonConverter<Question>` (more code, no benefit for this read path); `dynamic` / `JsonDocument` approach (loses type safety).

---

## RES-006: Static Image Serving for Rebus Questions

**Decision**: Images stored in `wwwroot/images/rebus/`. JSON stores a relative path fragment (e.g., `rebus/q3.png`). Frontend constructs the full URL as `/images/{imageRef}`.

**Rationale**:  
`wwwroot/` is the HTTP-deliverable root. `app.UseStaticFiles()` serves everything in it automatically. Storing only the relative fragment in JSON keeps data portable and decoupled from URL structure.

**No additional configuration needed** beyond `app.UseStaticFiles()` (already in all ASP.NET Core templates).

---

## RES-007: Testing Stack

**Decision**:

| Layer | Tool | Package |
|-------|------|---------|
| Backend unit | xUnit | `xunit`, `Microsoft.NET.Test.Sdk` |
| Backend integration | WebApplicationFactory | `Microsoft.AspNetCore.Mvc.Testing` |
| Frontend component | Vitest + React Testing Library | `vitest`, `@testing-library/react` |
| Frontend type check | TypeScript compiler | `tsc --noEmit` |
| E2E | Playwright | `@playwright/test` |
| Backend static analysis | `dotnet format` | built-in |
| Frontend linting | ESLint + TypeScript ESLint | `eslint`, `@typescript-eslint/*` |

**Rationale**:  
`WebApplicationFactory` is the official ASP.NET Core integration test harness — still standard in .NET 10. No database means no in-memory DB setup is needed, simplifying integration tests. Vitest is the natural choice for Vite-based frontends (same transform pipeline, fast). Playwright provides real-browser E2E coverage for the full navigation flow.

**Alternatives considered**: Jest for frontend (Vitest is better aligned with Vite, no additional transform config needed); Cypress for E2E (Playwright has better .NET ecosystem support and lower overhead).

---

## Summary of Resolved Unknowns

| Unknown | Resolution |
|---------|-----------|
| SPA proxy mechanism in .NET 10 | `Microsoft.AspNetCore.SpaProxy` with `SpaProxyServerUrl`/`SpaProxyLaunchCommand` in `.csproj` |
| Aspire integration shape | Separate `QuizAppka.AppHost` project; main project unchanged |
| JSON data location | `Data/categories/*.json` in content root (not HTTP-accessible) |
| Question type polymorphism | `System.Text.Json` `[JsonPolymorphic]` / `[JsonDerivedType]` |
| Image serving | `wwwroot/images/rebus/` with relative ref in JSON |
| Testing stack | xUnit + WebApplicationFactory + Vitest + RTL + Playwright |
