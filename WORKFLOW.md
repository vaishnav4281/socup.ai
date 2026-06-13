# SOCup AI — External System Integration Workflow

> **How external systems, tools, and services communicate with SOCup AI.**

## Architecture Principle

**Only two communication protocols cross service boundaries:**
- **Apache Kafka** — for all event-driven, async, high-throughput data (alerts, timeline events, analysis requests/results)
- **GraphQL (Apollo Federation)** — for all synchronous queries, mutations, and real-time subscriptions from the frontend

No REST endpoints exist between services. The GraphQL Gateway is the sole entry point for the frontend. Kafka is the sole backbone for inter-service messaging.

---

## 1. Ingesting Security Events (External → SOCup AI)

### Option A: Kafka (Recommended)
External systems publish JSON events to Kafka topics. SOCup AI services consume them.

```
External SIEM / IDS / EDR
        │
        │  Kafka Producer (JSON over PLAINTEXT or SSL)
        ▼
┌───────────────────┐
│   Kafka Topic     │
│  events.alerts    │
│  events.timeline  │
│  events.logs      │
└────────┬──────────┘
         │
         ▼
  SOCup AI Service
  (consumer group)
```

**Example event:**
```json
{
  "source": "crowdstrike",
  "event_type": "ALERT",
  "severity": "CRITICAL",
  "message": "Suspicious powershell execution on host-342",
  "timestamp": "2026-06-13T10:30:00Z",
  "actor": "svc-backup",
  "source_ip": "10.0.1.50"
}
```

### Option B: GraphQL Mutation (For Interactive Tools)
Scripts or tools can also submit events via the GraphQL Gateway:

```graphql
mutation IngestAlert {
  addAlert(source: "manual", severity: CRITICAL, message: "Port scan detected") {
    id
  }
}

mutation IngestTimelineEvent {
  addTimelineEvent(eventType: "SCAN", actor: "unknown@10.0.0.5") {
    id
  }
}
```

Gateway URL: `http://<gateway-host>:4000/graphql`

---

## 2. Querying Data (External → GraphQL Gateway)

Any GraphQL client can query the Apollo Federation Gateway:

```graphql
query GetDashboard {
  getAlerts { id severity message }
  getTimeline { id timestamp eventType actor }
  getStats { evaluated actions score }
}
```

**WebSocket subscriptions** for real-time updates:
```graphql
subscription OnAlert {
  alertCreated { id severity message }
}
```

---

## 3. AI Investigation (External → Agent via Kafka)

### Request Analysis
To trigger an AI investigation, publish to the `threat-analysis-requests` topic:

```json
{
  "request_id": "uuid-or-tracking-id",
  "threat_input": "Investigate suspicious login from 192.168.1.100 at 10:30 UTC",
  "reply_topic": "threat-analysis-results",
  "source": "external-siem"
}
```

### Consume Results
Subscribe to the `threat-analysis-results` topic to receive AI verdicts:

```json
{
  "request_id": "uuid-or-tracking-id",
  "success": true,
  "alert_id": "alt_abc123",
  "severity": "CRITICAL",
  "verdict": "CRITICAL",
  "message": "IP 192.168.1.100 is a known C2 server...",
  "skills_invoked": ["geoip_lookup", "ip_fingerprinter", "threat_analyst"],
  "processed_at": "2026-06-13T10:31:05Z"
}
```

---

## 4. Running the Agent Worker

```bash
cd agents/security-agent
python main.py worker \
  --bootstrap-servers localhost:9092 \
  --request-topic threat-analysis-requests \
  --result-topic threat-analysis-results
```

Or via Docker:

```bash
cd agents/security-agent
docker-compose up worker
```

---

## 5. External Tools Integration

### Prometheus / Grafana
- All GraphQL services expose metrics at `:9464/metrics` (OpenTelemetry)
- Kafka consumer lag metrics via JMX exporter on `:9092`
- Pre-built Grafana dashboard in `grafana/dashboards/`

### OpenSearch (Direct)
- External log shippers (Filebeat, Logstash) can write directly to OpenSearch:
  `http://opensearch:9200/socup-ai-logs-{date}`
- SOCup AI reads via `OpenSearchConnector` (internal)

### PostgreSQL (Direct — Read-Only Recommended)
- External reporting tools can query PostgreSQL read replicas:
  `postgresql://reader:password@postgres:5432/socup`
- Schema: `users`, `organizations`, `rbac_roles`

---

## 6. Network Diagram

```
┌─────────────┐     GraphQL      ┌─────────────────────┐
│  Next.js    │◄─────────────────│  Apollo Federation  │
│  Frontend   │   HTTP/WebSocket │  Gateway (:4000)    │
└─────────────┘                  └──┬──────┬──────┬────┘
                                    │      │      │
                           ┌────────┘      │      └────────┐
                    ┌──────▼────┐   ┌──────▼──────┐  ┌─────▼──────┐
                    │  Alerts   │   │   Timeline  │  │  (Future)  │
                    │  Subgraph │   │  Subgraph   │  │  Auth/etc  │
                    │  (:8001)  │   │  (:8002)    │  │            │
                    └──────┬────┘   └──────┬──────┘  └────────────┘
                           │               │
                    ┌──────▼───────────────▼──────────┐
                    │         Apache Kafka            │
                    │  threat-analysis-requests       │
                    │  threat-analysis-results        │
                    │  events.alerts                  │
                    │  events.timeline                │
                    └──────┬───────────────▲──────────┘
                           │               │
                    ┌──────▼───────────────┴──────────┐
                    │     AI Agent (Kafka Worker)     │
                    │   LangGraph · RAG · Skills     │
                    └──────┬───────────────┬──────────┘
                           │               │
                    ┌──────▼──────┐  ┌─────▼────────┐
                    │  OpenSearch │  │    Qdrant    │
                    │  (logs)     │  │  (vectors)   │
                    └─────────────┘  └──────────────┘
```

---

## 7. End-to-End Flow Example

```
External SIEM publishes alert to Kafka topic: events.alerts
  │
  ▼
Alerts Subgraph consumes event, stores in PostgreSQL
  │
  ▼
Alerts Subgraph publishes analysis request to: threat-analysis-requests
  │
  ▼
AI Agent worker consumes request, runs LangGraph pipeline:
  ├─ geoip_lookup skill → enrich IP
  ├─ ip_fingerprinter → port/OS scan data
  ├─ threat_analyst → check AbuseIPDB/VirusTotal
  └─ LLM verdict
  │
  ▼
AI Agent publishes result to: threat-analysis-results
  │
  ▼
Alerts Subgraph consumes result, updates alert status
  │
  ▼
Frontend receives update via GraphQL subscription (WebSocket)
  └─ Dashboard shows new alert with AI verdict
```

---

*For local development, see [PROJECT.md](./PROJECT.md). For detailed architecture, see [DETAILS.md](./DETAILS.md).*
