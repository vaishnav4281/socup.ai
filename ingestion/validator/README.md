# Event Validator — SOCup AI Ingestion Pipeline

> **Status: Under active development**

Validates incoming events before they enter the Kafka pipeline.

## Validation Rules

- **Schema validation**: JSON Schema draft-07 conformance
- **Required fields**: `event`, `userId`, `severity`, `timestamp`
- **Severity enum**: Must be one of `low`, `medium`, `high`, `critical`
- **Timestamp format**: ISO 8601 with timezone information
- **Metadata size**: Maximum 4 KB
- **Rate limiting**: Per-API-key, configurable RPM

## Architecture

```
Request → Auth → Rate Limit → Schema Check → Normalize → Publish to Kafka
```

On validation failure, returns `422 Unprocessable Entity` with a structured error payload.
