# Node.js SDK — SOCup AI Event Ingestion

> **Status: Under active development**

Track and emit security-relevant events from your Node.js applications to the SOCup AI platform.

## Installation

```bash
npm install @socup-ai/sdk-node
```

## Quick Start

```typescript
import { SOCupClient } from "@socup-ai/sdk-node";

const client = new SOCupClient({
  apiKey: "sk_...",
  endpoint: "https://ingest.socup.ai/v1/events",
});

await client.emit({
  event: "user.login",
  userId: "usr_123",
  ip: "192.168.1.10",
  severity: "low",
  timestamp: new Date().toISOString(),
});
```

## API

### `SOCupClient(config)`

| Param | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `string` | required | Ingestion API key |
| `endpoint` | `string` | `https://ingest.socup.ai/v1/events` | Ingestion endpoint |
| `timeout` | `number` | `5000` | Request timeout (ms) |
| `retries` | `number` | `3` | Max retry attempts |

### `client.emit(event)`

Emits a single security event. Returns `Promise<{ accepted: boolean; eventId: string }>`.

### `client.emitBatch(events)`

Emits up to 100 events in a single request.

## Event Schema

Reference the [shared schema](../shared/README.md) for field definitions.
