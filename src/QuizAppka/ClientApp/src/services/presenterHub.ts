import {
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
  type HubConnection,
} from '@microsoft/signalr';

let connection: HubConnection | null = null;
let startPromise: Promise<void> | null = null;

export function getPresenterHubConnection(): HubConnection {
  if (!connection) {
    connection = new HubConnectionBuilder()
      .withUrl('/hubs/presenter', {
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.onclose(() => {
      startPromise = null;
    });
  }
  return connection;
}

export function startPresenterHub(): Promise<void> {
  const conn = getPresenterHubConnection();
  if (conn.state === HubConnectionState.Connected) {
    return Promise.resolve();
  }
  if (startPromise) {
    return startPromise;
  }
  if (conn.state === HubConnectionState.Disconnected) {
    startPromise = conn.start().catch((err) => {
      startPromise = null;
      throw err;
    });
    return startPromise;
  }
  // Reconnecting — auto-reconnect handles it
  return Promise.resolve();
}

export { HubConnectionState };
