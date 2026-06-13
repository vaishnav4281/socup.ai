# SOCup AI — Platform Specification & System Design

> **The complete reference for interviews, architecture reviews, and platform understanding.**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement & Motivation](#2-problem-statement--motivation)
3. [Tech Stack](#3-tech-stack)
4. [System Architecture & Design](#4-system-architecture--design)
5. [Key Design Decisions & Trade-offs](#5-key-design-decisions--trade-offs)
6. [Use Cases](#6-use-cases)
7. [Why SOCup AI is Special](#7-why-socup-ai-is-special)
8. [Challenges Faced](#8-challenges-faced)
9. [Skills Demonstrated](#9-skills-demonstrated)
10. [System Design Deep Dive](#10-system-design-deep-dive)
11. [Interview Q&A](#11-interview-qa)

---

## 1. Project Overview

| Attribute | Detail |
|---|---|
| **Name** | SOCup AI |
| **Type** | Enterprise SOC Platform + AI Investigation Engine |
| **Architecture** | Event-driven Microservices + Agentic AI |
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS v4 |
| **API Layer** | GraphQL Federation (Apollo) + REST (FastAPI) |
| **Messaging** | Apache Kafka (Event-driven backbone) |
| **Backend** | FastAPI microservices (Python) |
| **AI Engine** | LangGraph agent with RAG, skill routing, supervisor planning |
| **Databases** | PostgreSQL, Redis, OpenSearch, Qdrant (Vector DB) |
| **LLM Integration** | Ollama (local), extensible to OpenAI/Anthropic |
| **Observability** | Prometheus + Grafana |
| **Deployment** | Docker Compose, Kubernetes-ready |

---

## 2. Problem Statement & Motivation

### The Problem

Traditional SOC (Security Operations Center) tools are:
- **Monolithic** — Hard to scale individual components
- **Reactive** — Alert-driven, not intelligence-driven
- **Siloed** — No unified view across logs, alerts, threat intel, and investigation
- **Manual** — Analysts spend hours correlating data across tools
- **Expensive** — Enterprise SIEM solutions cost millions

### The Solution

SOCup AI provides:
- **Unified platform** — Dashboard, timeline, investigation, threat intel in one UI
- **AI-native investigation** — LangGraph agents that autonomously triage alerts, query logs, correlate threat intel, and produce verdicts
- **Event-driven architecture** — Kafka-based decoupling for horizontal scalability
- **RAG-powered context** — Vector similarity search against historical baselines
- **Open-source, local-first** — Runs fully offline with local LLMs (Ollama)

---

## 3. Tech Stack

### Frontend
| Technology | Purpose | Why |
|---|---|---|
| **Next.js 14+ (App Router)** | React framework with SSR, RSC | SEO, performance, modern React patterns |
| **TypeScript** | Type-safe frontend | Catch errors at compile time |
| **Tailwind CSS v4** | Utility-first styling | Rapid UI development, consistent design |
| **Apollo Client** | GraphQL client | Real-time subscriptions, query caching |
| **React 19** | UI library | Concurrent features, server components |

### API & Gateway
| Technology | Purpose | Why |
|---|---|---|
| **Apollo Federation** | GraphQL gateway | Compose multiple subgraphs into one endpoint |
| **GraphQL Subscriptions** | Real-time over WebSocket | Live threat feed without polling |
| **Strawberry GraphQL** | Python GraphQL library | Type-safe, federation-ready Python GraphQL |

### Backend Services
| Technology | Purpose | Why |
|---|---|---|
| **FastAPI** | REST + GraphQL microservices | Async, auto-docs, high performance |
| **Python 3.12** | Runtime | Rich AI/ML ecosystem |
| **Uvicorn** | ASGI server | Production-grade async server |

### AI Engine
| Technology | Purpose | Why |
|---|---|---|
| **LangGraph** | Agent orchestration | Graph-based state machine for multi-step reasoning |
| **LangGraph Checkpoint** | Conversation persistence | SQLite-backed session state |
| **Ollama** | Local LLM provider | Privacy, no external API costs |
| **RAG (Vector Search)** | Context retrieval | KNN similarity against OpenSearch embeddings |
| **APScheduler** | Skill scheduling | Cron and interval-based skill execution |
| **Skill System** | Modular agent capabilities | Plugin architecture for SOC workflows |

### Data Layer
| Technology | Purpose | Why |
|---|---|---|
| **PostgreSQL** | Relational data | Users, orgs, RBAC — ACID compliance |
| **Redis** | Cache + ephemeral state | Sub-millisecond reads, rate limiting |
| **OpenSearch** | Log storage + search | Fork of Elasticsearch, Apache 2.0 license |
| **Qdrant** | Vector database | HNSW indexing for RAG similarity search |
| **Apache Kafka** | Event bus | Decoupled async communication |

### Observability
| Technology | Purpose | Why |
|---|---|---|
| **Prometheus** | Metrics collection | Industry standard, Grafana integration |
| **Grafana** | Visualization | Rich dashboards, alerting |

### DevOps
| Technology | Purpose | Why |
|---|---|---|
| **Docker Compose** | Local orchestration | Single-command infra setup |
| **Kubernetes (Helm/Kustomize)** | Production orchestration | Scalable, self-healing deployment |

---

## 4. System Architecture & Design

### High-Level Architecture

```
                    ┌──────────────────────────────────────┐
                    │           Next.js Frontend           │
                    │     (Dashboard · Timeline · Intel)   │
                    └────────────────┬─────────────────────┘
                                     │ GraphQL over HTTP/WS
                    ┌────────────────▼─────────────────────┐
                    │     Apollo Federation Gateway        │
                    │     (port 4000 · Schema Composer)    │
                    └──┬──────────────┬──────────────┬─────┘
                       │              │              │
              ┌────────▼───┐  ┌───────▼───────┐  ┌───▼────────┐
              │ Alerts     │  │ Timeline      │  │ Auth       │
              │ Subgraph   │  │ Subgraph      │  │ (planned)  │
              │ :8001/gql  │  │ :8002/gql     │  │            │
              └──────┬─────┘  └───────┬───────┘  └────────────┘
                     │                │
              ┌──────▼────────────────▼──────┐
              │       Apache Kafka          │
              │   (events.auth, alerts,      │
              │    timeline, investigations) │
              └──────┬────────────────▲──────┘
                     │                │
              ┌──────▼────────────────┴──────┐
              │    AI Agent (Python)         │
              │  LangGraph · RAG · Skills    │
              │  REST API :7799 · Scheduler  │
              └──────┬────────────────┬──────┘
                     │                │
              ┌──────▼────┐    ┌──────▼──────┐
              │ OpenSearch│    │   Qdrant   │
              │ (logs +   │    │ (vectors)  │
              │  indices) │    │            │
              └───────────┘    └─────────────┘
```

### Request Lifecycle (Suspicious Login)

```
1. INGEST    → Auth Service fires LOGIN_SUCCESS event to Kafka
2. ANALYZE   → Risk Engine consumes event, queries vector DB
3. DETECT    → 94% anomaly score → publishes to events.alerts
4. AGENT     → Security Agent consumes alert, LangGraph tree
              → fetches RAG context → issues verdict
5. RENDER    → Gateway pushes GraphQL subscription → Dashboard
```

### AI Agent Architecture (LangGraph + Skills)

```
                    ┌──────────────────────────┐
                    │   Chat Router Supervisor │
                    │  (LangGraph StateGraph)  │
                    └──────┬───────────────────┘
                           │ Routes questions to skills
          ┌────────────────┼────────────────────┐
          │                │                    │
  ┌───────▼──────┐ ┌──────▼───────┐  ┌─────────▼────────┐
  │ Forensic    │ │ Threat       │  │ Baseline        │
  │ Examiner    │ │ Analyst      │  │ Querier         │
  │ (evidence)  │ │ (reputation) │  │ (patterns)      │
  └───────┬──────┘ └──────┬───────┘  └─────────┬────────┘
          │                │                    │
  ┌───────▼────────────────▼────────────────────▼──────┐
  │              RAG Engine (OpenSearch)               │
  │   Embed query → KNN search → context → LLM reply  │
  └────────────────────────────────────────────────────┘
```

### Skill System Plugin Architecture

Each skill is a self-contained directory:
```
skills/
  forensic_examiner/
    logic.py          # Python implementation
    instruction.md    # LLM system prompt
    manifest.yaml     # Routing contract, dependencies
    hooks.py          # Pre/post execution hooks
    graph.py          # LangGraph sub-graph (optional)
```

---

## 5. Key Design Decisions & Trade-offs

### 1. Event-Driven (Kafka) over Synchronous REST
- **Decision**: Kafka as central nervous system
- **Advantage**: Complete decoupling; 10M events won't crash the AI agent
- **Trade-off**: Requires schema registry, replay logic, complex debugging

### 2. CQRS + Event Sourcing for Timeline
- **Decision**: Separate write model (PostgreSQL) and read model (Redis cache)
- **Advantage**: Sub-millisecond dashboard renders
- **Trade-off**: Eventual consistency, two models to maintain

### 3. GraphQL Federation over Unified REST
- **Decision**: Apollo Gateway composing subgraphs from isolated services
- **Advantage**: No BFF bottleneck; UI queries relational data in one request
- **Trade-off**: Schema coordination overhead between teams

### 4. Headless AI Engine (Agentic Microservice)
- **Decision**: AI agent as isolated service consuming GraphQL/Kafka
- **Advantage**: Zero-trust data boundaries, independent scaling
- **Trade-off**: Added latency for AI "thought process"

### 5. Multi-Database Strategy
| Database | Role | Why Not One? |
|---|---|---|
| PostgreSQL | Relational truth | ACID for users, RBAC |
| Redis | Ephemeral cache | Sub-ms reads, rate limiting |
| OpenSearch | Log ingestion | Full-text search, aggregations |
| Qdrant | Vector similarity | HNSW indexing, semantic search |

### 6. Local-First LLM (Ollama)
- **Decision**: Default to local LLM via Ollama
- **Advantage**: Zero data leakage, no API costs, offline-capable
- **Trade-off**: Smaller models, reduced reasoning quality vs GPT-4

---

## 6. Use Cases

### Primary: SOC Analyst Daily Workflow
```
1. Dashboard shows 3 CRITICAL alerts
2. Analyst clicks → AI Agent investigates each
3. Agent queries OpenSearch logs, checks threat intel
4. Agent produces verdict: "IP 185.xxx.xxx is known C2 — block"
5. Timeline records all events for compliance
6. Case logged in Investigation workspace
```

### Automated Threat Hunting
Scheduled skills run every N hours:
- **fields_baseliner**: Indexes OpenSearch field schemas (hourly)
- **network_baseliner**: Builds traffic baselines (6 hours)
- **geoip_lookup**: Updates GeoIP database (Tue/Fri)

### Incident Response
- AI agent provides step-by-step remediation
- Forensic examiner reconstructs attack timeline
- Threat analyst enriches with external intel

### Compliance & Reporting
- Event sourcing provides immutable audit trail
- MITRE ATT&CK mapping for regulatory reporting
- Timeline replay for post-mortem analysis

### Custom Skill Development
Engineers can add new skills without modifying core:
```
skills/my_custom_skill/
  logic.py          # Implement run(context) -> dict
  instruction.md    # LLM instructions for this skill
  manifest.yaml     # Routing contract, env requirements
```

---

## 7. Why SOCup AI is Special

### 🧠 AI-Native, Not AI-Wrapped
Unlike tools that bolt on a chatbot, SOCup AI uses **LangGraph agents** that plan, execute skills, evaluate results, and iterate — all autonomously.

### 🔌 Plugin Skill Architecture
The skill system allows **any SOC workflow** to be plugged in as a self-contained module with its own LLM instructions, schedule, and logic.

### 🏗️ Enterprise-Grade Architecture
Not a toy — uses Kafka, GraphQL Federation, CQRS, Event Sourcing, Vector DBs. Production-grade decisions from day one.

### 🔒 Privacy-First
Runs fully offline with local LLMs. No data leaves your network unless you explicitly configure external threat intel APIs.

### 🎯 Purpose-Built for SOC
Every feature — timeline, investigation workspace, threat intel, MITRE ATT&CK mapping — is designed for real SOC workflows.

### 📊 Real-Time Observable
Prometheus + Grafana for infrastructure monitoring. GraphQL Subscriptions for real-time UI updates.

---

## 8. Challenges Faced

### 1. LangGraph Agent Reliability
**Challenge**: Agents would sometimes hallucinate skill selections or skip necessary analysis steps.
**Solution**: Multi-round supervisor planning with question grounding, candidate review, and confidence scoring. Added skills_check phase to verify question-skill alignment before execution.

### 2. RAG Context Quality
**Challenge**: Vector similarity sometimes returned irrelevant context, confusing the LLM.
**Solution**: Similarity threshold (0.65), top-K limiting (5), and query repair pipeline that validates and fixes malformed OpenSearch queries.

### 3. Kafka Integration Complexity
**Challenge**: Setting up Kafka with KRaft mode (no ZooKeeper) for local dev without schema registry.
**Solution**: Bitnami Kafka image with KRaft configuration, simplified topic management, and graceful error handling for missing topics.

### 4. Multi-Database Coordination
**Challenge**: Keeping PostgreSQL, Redis, OpenSearch, and Qdrant in sync without distributed transactions.
**Solution**: Eventual consistency model via Kafka events. Each service owns its data and publishes state changes.

### 5. GraphQL Federation Schema Drift
**Challenge**: Subgraphs evolving independently could break the gateway schema.
**Solution**: IntrospectAndCompose with 2-second polling detects schema changes. Gateway retries on failure with exponential backoff.

### 6. Path Traversal Security
**Challenge**: API endpoints accepting file paths from users.
**Solution**: Strict input validation (alphanumeric only for IDs), resolved path verification against safe directory boundaries, 403 on violation.

### 7. LLM Streaming Complexity
**Challenge**: Streaming LLM tokens through FastAPI to the UI while maintaining supervisor trace visibility.
**Solution**: SSE (Server-Sent Events) with multi-event protocol: `step` events for supervisor trace, `token` events for LLM text, `response` for final payload.

---

## 9. Skills Demonstrated

### Software Engineering
- **Full-stack development**: Next.js → GraphQL → FastAPI → Databases
- **System design**: Event-driven microservices, CQRS, Federation
- **API design**: REST, GraphQL (queries, mutations, subscriptions), SSE streaming
- **Security**: Input validation, path traversal prevention, CORS, secrets isolation

### AI / Machine Learning
- **LangGraph**: Agent state machines, supervisor planning, multi-step reasoning
- **RAG (Retrieval-Augmented Generation)**: Vector embeddings, KNN search, context injection
- **LLM Integration**: Ollama, streaming tokens, prompt engineering, system instructions
- **Skill orchestration**: Dynamic routing, prerequisite chains, conditional execution

### DevOps & Infrastructure
- **Docker Compose**: Multi-service orchestration
- **Kubernetes**: (Helm/Kustomize manifests ready)
- **Observability**: Prometheus + Grafana
- **CI/CD**: GitHub Actions for tests

### Data Engineering
- **Apache Kafka**: Event-driven architecture, topic management, consumer groups
- **OpenSearch**: Full-text search, aggregations, index management
- **Qdrant**: Vector database, HNSW indexing, similarity search
- **PostgreSQL**: Relational modeling, ACID transactions
- **Redis**: Caching, rate limiting, ephemeral state

---

## 10. System Design Deep Dive

### Scalability Strategy
```
Scale Dimension        Approach
─────────────────────────────────────────────────────
Services               Each microservice scales independently
Kafka Partitions       Increase partitions for higher throughput
Read Replicas          PostgreSQL read replicas for dashboard queries
AI Agent               Multiple agent instances with different skill sets
Frontend               Next.js ISR + CDN caching
```

### Data Flow (End-to-End)
```
Event (Login) 
  → Kafka Topic: events.auth 
    → Risk Engine (consumer) 
      → Queries Qdrant for behavior baseline 
        → Publishes Alert to events.alerts 
          → AI Agent (consumer) 
            → LangGraph: supervisor → skill execution 
              → RAG context from OpenSearch 
                → LLM verdict
                  → Kafka: events.verdict
                    → Gateway (subscriber via Kafka → WebSocket)
                      → Dashboard (real-time update)
```

### Database Schema Design

**PostgreSQL** (Relational):
```
users: id, email, role, org_id, created_at
organizations: id, name, plan, settings
rbac_roles: id, name, permissions
```

**OpenSearch** (Logs):
```
index: socup-ai-logs-{date}
  fields: @timestamp, source_ip, event_type, user, action, status, geoip
index: socup-ai-vectors
  fields: embedding (dense_vector), text, metadata, skill_name
```

**Redis** (Cache):
```
Key Pattern: timeline:{org_id}:recent → cached timeline events
Key Pattern: session:{token} → user session data
Key Pattern: rate_limit:{ip}:{endpoint} → request counter
```

---

## 11. Interview Q&A

### Q: Why microservices instead of monolith?
**A**: SOC tools handle bursty, high-volume log data. Microservices allow:
- Independent scaling (e.g., AI agent on GPU nodes)
- Isolation (log ingestion doesn't crash the dashboard)
- Technology diversity (Python for AI, Node.js for gateway, Go for future services)

### Q: Why GraphQL instead of REST?
**A**: SOC dashboards need relational data (alert → user → device → timeline). GraphQL lets the UI fetch nested data in one request. Subscriptions provide real-time updates without polling.

### Q: Why Kafka instead of RabbitMQ?
**A**: Kafka provides:
- Log compaction for event sourcing
- Partition-based parallelism
- Exactly-once semantics for critical security events
- Long-term retention for audit trails

### Q: How does the AI agent decide which skill to use?
**A**: A supervisor LangGraph agent:
1. Grounds the question to extract entities and intent
2. Scores available skills against the grounded question
3. Reviews candidate skills through multiple rounds (confidence scoring)
4. Executes selected skills in order
5. Evaluates results — if unsatisfactory, replans

### Q: How do you handle LLM hallucinations?
**A**: Multiple layers:
- Skill system constrains LLM to defined actions
- Question grounding prevents scope creep
- Multi-round supervisor review catches bad plans
- Query validation before OpenSearch execution
- RAG context provides factual grounding

### Q: How is security handled?
**A**: 
- No auth layer (designed for trusted networks)
- Path traversal protection via input validation + path resolution
- CORS restricted to localhost origins
- Secrets isolated in `.env` (git-ignored)
- CORS, input sanitization on all API endpoints
- Zero-trust data boundaries between services

### Q: What's the most interesting technical challenge?
**A**: The LangGraph supervisor that routes questions to skills. Getting it to reliably choose the right skill, in the right order, without hallucinating — and streaming the entire thought process to the UI — was a significant engineering challenge involving multi-round review, confidence scoring, and question grounding.

### Q: How would you scale this to 1M events/second?
**A**: 
1. Increase Kafka partitions (more consumers)
2. Add more AI agent instances (partition-per-agent)
3. Shard OpenSearch by time + org_id
4. Redis Cluster for cache scalability
5. CDN + ISR for static dashboard content
6. Auto-scaling via Kubernetes HPA

### Q: What monitoring and observability exists?
**A**: Prometheus scrapes all service endpoints. Grafana dashboards visualize:
- Event throughput (Kafka consumer lag)
- Agent decision latency (p50/p95/p99)
- Skill execution success/failure rates
- OpenSearch query performance
- System resource usage (CPU, memory, disk)

### Q: How do you test the AI agent?
**A**: 
- Mock LLM for deterministic testing
- Mock OpenSearch for skill validation
- Integration tests with real OpenSearch + Ollama
- `test_supervisor_skill_selection.py`: Tests routing decisions
- `test_forensic_examiner_timeline.py`: Tests evidence gathering
- Pytest with coverage reporting

---

## Key Metrics

| Metric | Target |
|---|---|
| Dashboard load time | <500ms |
| AI agent response (simple) | <5s |
| AI agent response (complex) | <30s |
| Event ingestion | 10k+ events/sec per node |
| RAG retrieval | <100ms per query |
| Uptime | 99.9% (production) |

---

*Last updated: June 2026*
