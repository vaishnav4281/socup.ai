# Event Normalizer — SOCup AI Ingestion Pipeline

> **Status: Under active development**

Normalizes events from diverse sources into a canonical format before Kafka publication.

## Responsibilities

- **IP enrichment**: GeoIP lookup, ASN tagging, threat intel matching
- **User-Agent parsing**: OS, browser, device extraction
- **Timestamp normalization**: Converts all timestamps to UTC ISO 8601
- **Deduplication**: Idempotency keys prevent duplicate event ingestion
- **Field mapping**: Maps source-specific fields to canonical schema

## Flow

```
Raw Event → Parse → Enrich → Deduplicate → Canonical Event → Kafka Topic
```

The normalizer ensures downstream services (Alerts, Timeline, Analytics) always receive consistently structured events regardless of the source.
