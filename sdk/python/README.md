# Python SDK — SOCup AI Event Ingestion

> **Status: Under active development**

Emit security events from your Python services to the SOCup AI ingestion pipeline.

## Installation

```bash
pip install socup-ai-sdk
```

## Quick Start

```python
from socup_ai import SOCupClient

client = SOCupClient(
    api_key="sk_...",
    endpoint="https://ingest.socup.ai/v1/events",
)

client.emit({
    "event": "user.login",
    "userId": "usr_123",
    "ip": "192.168.1.10",
    "severity": "low",
    "timestamp": "2026-06-13T10:30:00Z",
})
```

## API

### `SOCupClient(config)`

| Param | Type | Default | Description |
|---|---|---|---|
| `api_key` | `str` | required | Ingestion API key |
| `endpoint` | `str` | `https://ingest.socup.ai/v1/events` | Ingestion endpoint |
| `timeout` | `int` | `5` | Request timeout (seconds) |
| `retries` | `int` | `3` | Max retry attempts |

### `client.emit(event)`

Emits a single security event. Returns `dict` with `accepted` and `eventId` keys.

### `client.emit_batch(events)`

Emits up to 100 events in a single request.
