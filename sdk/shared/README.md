# Shared Event Schema — SOCup AI Ingestion

> **Status: Under active development**

Canonical event schema used across all SDKs and the ingestion pipeline.

## Core Event Fields

```json
{
  "event":     "user.login",
  "userId":    "usr_123",
  "sessionId": "sess_abc456",
  "ip":        "192.168.1.10",
  "userAgent": "Mozilla/5.0 ...",
  "severity":  "low",
  "metadata":  { "mfa_enabled": true },
  "timestamp": "2026-06-13T10:30:00Z"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `event` | `string` | ✅ | Dot-notation event name (e.g. `user.login`, `file.download`, `auth.mfa_challenge`) |
| `userId` | `string` | ✅ | Unique identifier of the actor |
| `sessionId` | `string` | ❌ | Session identifier for correlation |
| `ip` | `string` | ❌ | Originating IP address |
| `userAgent` | `string` | ❌ | Client user-agent string |
| `severity` | `enum` | ✅ | One of: `low`, `medium`, `high`, `critical` |
| `metadata` | `object` | ❌ | Arbitrary key-value payload (max 4KB) |
| `timestamp` | `string` (ISO 8601) | ✅ | When the event occurred |

## Event Categories

| Category | Examples |
|---|---|
| **Authentication** | `user.login`, `user.logout`, `auth.mfa_challenge`, `auth.password_reset` |
| **Access** | `file.read`, `file.download`, `file.delete`, `resource.access` |
| **Network** | `connection.open`, `connection.close`, `dns.query`, `tls.handshake` |
| **System** | `process.start`, `process.stop`, `service.install`, `registry.modify` |
| **Security** | `scan.detected`, `malware.blocked`, `policy.violation`, `anomaly.score` |
