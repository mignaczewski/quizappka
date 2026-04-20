# Research: Presenter Mirroring Mode

**Feature**: 003-presenter-mirroring-mode  
**Branch**: `003-presenter-mirroring-mode`  
**Phase**: 0 – Research  
**Date**: 2026-03-26

---

## RES-001: ASP.NET Core SignalR Hub (Server Side)

**Decision**: Use the built-in `Microsoft.AspNetCore.SignalR` hub infrastructure — no additional NuGet package required for .NET 10.

**Rationale**:  
ASP.NET Core SignalR ships as part of the `Microsoft.AspNetCore.App` shared framework. Adding a hub requires:
1. `builder.Services.AddSignalR()` in `Program.cs`
2. `app.MapHub<PresenterHub>("/hubs/presenter")` after `app.UseWebSockets()` (or without it — ASP.NET Core handles WebSocket upgrade automatically when SignalR is mapped)

No additional NuGet dependency is needed vs the existing project — SignalR is already bundled.

**Key registration pattern**:
```csharp
builder.Services.AddSignalR();
// ...
app.MapHub<PresenterHub>("/hubs/presenter");
```

**Alternatives considered**: gRPC streaming (more complex, requires HTTP/2 setup), Server-Sent Events (unidirectional only, presenter cannot push state), REST polling (violates 1-second latency goal and causes unnecessary server load).

---

## RES-002: WebSocket-Only Transport on the Frontend Client

**Decision**: Configure the frontend `HubConnection` with `HttpTransportType.WebSockets` only — no automatic fallback to Server-Sent Events or Long Polling.

**Rationale**:  
The `@microsoft/signalr` client defaults to negotiating the best transport. The user explicitly requires WebSocket only. Restricting the transport:
- Eliminates the `/negotiate` preflight for Long Polling/SSE transports (slightly lower connection overhead)
- Makes the deployed behavior predictable: if WebSockets are unavailable (e.g., proxy misconfiguration), the connection fails visibly rather than silently degrading to polling

**Implementation**:
```typescript
import { HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr';

export function createPresenterHubConnection() {
  return new HubConnectionBuilder()
    .withUrl('/hubs/presenter', { transport: HttpTransportType.WebSockets })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();
}
```

**Server-side transport restriction (optional, not required)**: It is possible to restrict accepted transports on the server with `options.Transports = HttpTransportType.WebSockets` in `MapHub`. This is **not** applied here because the server may serve the SPA in environments where a reverse proxy handles WebSocket upgrades — restricting server-side is an infrastructure concern. The client-side restriction is sufficient to meet the feature requirement.

**Alternatives considered**: Default transport negotiation (rejected — user explicitly requires WebSocket only), Server-Sent Events (rejected — unidirectional), Long Polling (rejected by requirement).

---

## RES-003: Late-Join State Delivery (Current State on Connect)

**Decision**: Introduce a singleton `IPresenterSessionStore` that stores the last-published `PresenterStateDto`. On `OnConnectedAsync`, the hub reads the store and sends the current state to the newly connected client.

**Rationale**:  
A mirror opened mid-session must immediately show the presenter's current view without the presenter needing to navigate again (FR-007, SC-005). SignalR itself does not remember past messages — each connection only receives events fired after it connects. A server-side store bridges this gap.

The store is intentionally simple: it holds a single `PresenterStateDto?`, protected by a `ReaderWriterLockSlim` for thread safety (multiple mirror connections may read concurrently while a presenter write is rare).

**Key pattern**:
```csharp
public class PresenterHub : Hub
{
    private readonly IPresenterSessionStore _store;

    public PresenterHub(IPresenterSessionStore store) => _store = store;

    public override async Task OnConnectedAsync()
    {
        var current = _store.CurrentState;
        if (current is not null)
            await Clients.Caller.SendAsync("StateUpdated", current);
        await base.OnConnectedAsync();
    }

    public async Task UpdateState(PresenterStateDto state)
    {
        _store.SetState(state);
        await Clients.All.SendAsync("StateUpdated", state);
    }
}
```

**Alternatives considered**: Storing state in a distributed cache (Redis) — unnecessary for a single-server local deployment; storing state in the hub's static field — not testable and breaks dependency injection; sending state only to the caller — other mirrors already connected won't see same session without this.

---

## RES-004: SignalR Hub Integration Testing

**Decision**: Use `WebApplicationFactory<Program>` plus `Microsoft.AspNetCore.SignalR.Client` to test the hub over a real in-process HTTPS test server with WebSocket transport.

**Rationale**:  
Hub integration tests must exercise the real SignalR pipeline — not unit-level mock assertions — to confirm that:
- The hub negotiates a WebSocket connection
- `UpdateState` fires the `StateUpdated` event on all connected clients
- Late-joining clients receive the current state on connect
- Closing one client does not affect others

`WebApplicationFactory` starts the actual ASP.NET Core middleware stack including SignalR. Hub connections in tests use `HubConnectionBuilder` pointed at the test server's address, using `HttpTransportType.WebSockets`.

**NuGet requirement for test project**: `Microsoft.AspNetCore.SignalR.Client` must be added to `QuizAppka.Tests.csproj`.

**Key pattern**:
```csharp
var connection = new HubConnectionBuilder()
    .WithUrl(factory.Server.BaseAddress + "hubs/presenter",
        o => {
            o.Transports = HttpTransportType.WebSockets;
            o.HttpMessageHandlerFactory = _ => factory.Server.CreateHandler();
        })
    .Build();
await connection.StartAsync();
```

**Alternatives considered**: Mocking `IHubContext<T>` in unit tests only (insufficient — does not test client-to-hub-to-client message flow), using a real network endpoint (fragile, port binding issues in CI).

---

## RES-005: Automatic Reconnection and Disconnected-State UI

**Decision**: Use `.withAutomaticReconnect()` on the frontend `HubConnectionBuilder`. `MirrorPage` subscribes to `connection.onreconnecting()` and `connection.onreconnected()` to show/hide a disconnection banner.

**Rationale**:  
SC-006 requires automatic reconnection within 5 seconds. The default `.withAutomaticReconnect()` retries at 0, 2, 10, and 30 seconds — the first retry at 0s means a transient blip typically recovers within 2 seconds, meeting the 5-second bound.

The mirror must visibly indicate disconnection (edge case defined in spec) rather than silently showing stale content. A non-intrusive banner or overlay anchored to the viewport communicates the state without obscuring the last-known content.

**Alternatives considered**: Manual reconnect logic (`onclose` + `setTimeout`) — more complex and error-prone; no disconnect indicator — violates spec edge case requirement.

---

## RES-006: Frontend Hook for Presenter State Broadcasting

**Decision**: Implement a `usePresenterSession` custom React hook that creates (or reuses) a hub connection and calls `UpdateState` whenever the presenter page mounts or its route parameters change.

**Rationale**:  
Each presenter page (HomePage, QuestionListPage, QuestionDetailPage) needs to publish its current state as soon as it renders and whenever its identity changes (e.g., user navigates from one question to another within the same page component via React Router param change). A shared hook encapsulates the connection lifecycle and prevents duplicate connections. The hook creates the connection on first call and tears it down when the component unmounts (or uses a module-level singleton to share a connection across pages without reconnecting on every navigation).

**Design choice**: Module-level singleton connection in `presenterHub.ts`. The hook imports it and calls `UpdateState` in a `useEffect` — no reconnection overhead on each page mount.

**Alternatives considered**: Context provider wrapping the entire app (more complex, requires provider changes); creating a new connection per page (unnecessary reconnect overhead on every navigation).
