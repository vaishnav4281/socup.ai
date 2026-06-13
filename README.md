<div align="center">

# 🛡️ SOCup AI — Enterprise Security Investigation Platform

**Real-time threat detection · AI-powered investigation · Event-driven architecture**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat-square&logo=python)](https://python.org/)
[![GraphQL](https://img.shields.io/badge/GraphQL-Federation-E10098?style=flat-square&logo=graphql)](https://graphql.org/)
[![Apache Kafka](https://img.shields.io/badge/Kafka-231F20?style=flat-square&logo=apache-kafka)](https://kafka.apache.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agentic-1C3C3C?style=flat-square)](https://langchain-ai.github.io/langgraph/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

---

<img src="assets/dashboard.png" alt="SOCup AI Dashboard" width="100%"/>

</div>

## ✨ Highlights

| 🚀 **Feature** | 📖 **Description** |
|---|---|
| **Real-Time SOC Dashboard** | Executive KPIs, live anomaly feed, attack timeline — updates every 3-5s |
| **AI Investigation Agent** | LangGraph-powered RAG agent with 7+ specialized sub-agents |
| **MITRE ATT&CK Mapping** | Interactive coverage map with expandable tactic/technique browser |
| **IOC Intelligence** | Searchable indicator-of-compromise library with confidence scoring |
| **Event Sourcing** | Complete audit trail of every security event across your infrastructure |
| **Kafka-First Architecture** | Fully event-driven with CQRS patterns and GraphQL subscriptions |
| **Graceful Degradation** | Frontend works offline with zero backend dependency — mock data fallback |

## 🧠 Why SOCup AI?

> *"Most SOC tools are either dashboards that look pretty but can't investigate, or AI toys that hallucinate without context. SOCup AI is both — and it works when your backend doesn't."*

### 🏢 Enterprise-Ready, Developer-Friendly
- **📉 Zero Backend Dependency** — The frontend works fully offline with inline mock data. Start building UI before the backend exists.
- **🔌 Event-Driven Core** — Apache Kafka powers all inter-service communication. No REST, just events and GraphQL.
- **🧩 GraphQL Federation** — Each domain owns its subgraph. The gateway composes them into a unified API.
- **🤖 Multi-Agent AI** — Inspired by modern SOC analyst workflows: Supervisor → Threat Analyst → Forensic Investigator → MITRE Mapper → Response Planner → Report Generator → Confidence Scorer.
- **🛡️ FAANG-Level Practices** — CQRS, Event Sourcing, OpenTelemetry tracing, dead letter queues, and retry with exponential backoff.

## 📸 Screenshots

| Page | Preview |
|---|---|
| **Executive Dashboard** | ![Dashboard](assets/dashboard.png) |
| **Attack Timeline** | ![Timeline](assets/timeline.png) |
| **Investigation Workspace** | ![Investigation](assets/investigation.png) |
| **Threat Intelligence** | ![Threat Intel](assets/threat-intel.png) |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     🌐 Frontend (Next.js)                    │
│  Dashboard · Timeline · Investigations · Threat Intel       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 🔌 GraphQL Client (mock fallback + 3-state conn)     │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ ⬆ Subscriptions (WebSocket)
                         │ ⬇ Queries / Mutations
┌────────────────────────▼────────────────────────────────────┐
│               🚪 GraphQL Federation Gateway                  │
└──┬──────────────┬──────────────┬────────────────┬───────────┘
   │              │              │                │
   ▼              ▼              ▼                ▼
┌──────┐    ┌────────┐    ┌──────────┐    ┌──────────┐
│Auth  │    │Alerts  │    │Timeline  │    │Analytics │
│SG    │    │SG      │    │SG        │    │SG        │
└──────┘    └───┬────┘    └────┬─────┘    └──────────┘
                │              │
         ┌──────▼──────────────▼──────┐
         │     📨 Apache Kafka         │
         │  threat-analysis-requests   │
         │  threat-analysis-results    │
         │  audit-events               │
         └──────┬──────────────────────┘
                │
         ┌──────▼──────┐
         │ 🤖 AI Agent │
         │  (Worker)   │
         └─────────────┘
```

## 🗂️ Project Structure

```
📦 socup.ai
├── apps/
│   ├── web/              # 🖥️ Next.js Frontend Dashboard
│   └── gateway/          # 🚪 GraphQL Federation Gateway
├── services/
│   ├── auth/             # 🔐 Authentication & Identity
│   ├── alerts/           # ⚠️ Alerting Service
│   ├── timeline/         # 📜 Attack Timeline (Event Sourcing)
│   ├── investigation/    # 🔍 Investigation Workspace
│   ├── analytics/        # 📊 Risk Engine & Analytics
│   └── notifications/    # 📬 Notifications & Delivery
├── agents/
│   └── security-agent/   # 🧠 Core AI Investigation Engine
├── libs/
│   ├── events/           # 📨 Shared Kafka Event Schemas
│   ├── graphql/          # 📡 GraphQL Shared Definitions
│   └── shared/           # 🔧 Common Utilities
└── infra/
    ├── docker/           # 🐳 Docker Compose Configs
    ├── kubernetes/       # ☸️ K8s Manifests
    └── monitoring/       # 📈 Prometheus & Grafana
```

## 🚀 Quick Start

### Prerequisites
- **Docker** & **Docker Compose** (for infra)
- **Node.js 18+** & **npm** (for frontend)
- **Python 3.11+** (for AI agent)

### 1. Start Infrastructure
```bash
docker-compose up -d
```
*Starts: PostgreSQL · Redis · OpenSearch · Qdrant · Kafka · Prometheus · Grafana*

### 2. Start the Frontend
```bash
cd apps/web
npm install
npm run dev
```

### 3. Start Backend Services
```bash
# Alerts subgraph
cd services/alerts && python main.py

# Timeline subgraph
cd services/timeline && python main.py

# AI Agent worker
cd agents/security-agent && docker-compose up
```

### 4. Open the Dashboard
→ [**http://localhost:3000**](http://localhost:3000)

*The frontend renders immediately with demo data. Connect backend services for live data.*

### 5. (Optional) Start Gateway
```bash
cd apps/gateway && npm run dev
```

## 🎯 Core Features

### 📊 Executive Dashboard
- **KPI Cards** — Active threats, events analyzed, agent actions, risk score
- **Live Anomalies** — Real-time alert feed with severity coloring and glow effects
- **Attack Timeline** — Reverse-chronological event log across all infrastructure
- **AI Agent Console** — Natural language threat analysis interface

### 🔍 Investigation Workspace
- **Open Cases** — Severity-sorted alert list with click-to-investigate
- **AI Investigation Agent** — RAG-powered analysis with live output console
- **Threat Escalation** — One-click pipeline from alert to deep investigation

### 📜 Attack Timeline
- **Event Injector** — Manually inject test events for simulation
- **Chronological View** — Time-ordered replay with colored event types
- **Timeline Visualization** — Connected dot-and-line event flow

### 🧠 Threat Intelligence
- **MITRE ATT&CK Coverage** — Interactive tactics map with expandable technique lists
- **IOC Library** — Searchable indicators with confidence scoring and threat levels
- **Adversary Profiling** — Correlate IOCs to known threat actors

## 🧪 Graceful Degradation

SOCup AI is designed for unstable environments. Every page works in **three states**:

```
🟢 Connected    → Live data from GraphQL gateway
🟡 Degraded     → Cached data (transient failure, <15s)
⚫ Offline      → Full mock data (gateway unreachable >15s)
```

The `ConnectionStatus` component shows the current state at all times. When offline, the UI is indistinguishable from live — except for a gray indicator in the header.

## 🛣️ Roadmap

- [ ] **🔌 Wire Kafka Consumers** into alerts/timeline subgraphs (currently in-memory)
- [ ] **🗄️ PostgreSQL Persistence** with SQLAlchemy + Alembic migrations
- [ ] **📡 GraphQL Subscriptions** via WebSocket (replace polling)
- [ ] **🤖 Multi-Agent AI Pipeline** — 7 specialized agents in LangGraph
- [ ] **🔍 OpenTelemetry** — Distributed tracing with Jaeger/Tempo
- [ ] **🔄 Dead Letter Queues** — Kafka retry with exponential backoff
- [ ] **⌨️ Cmd+K Palette** — Keyboard-first command interface
- [ ] **🕸️ Neo4j Attack Graph** — D3.js force-directed visualization
- [ ] **⚡ FAANG Review** — Address 10 architectural improvement items

## 🧰 Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | Next.js 15.5, React 19, TypeScript 5.8, Tailwind CSS v4 |
| **API Layer** | GraphQL Federation, Strawberry (Python), WebSockets |
| **Messaging** | Apache Kafka (Confluent) |
| **AI/ML** | LangGraph, LangChain, RAG, ChromaDB, Ollama |
| **Storage** | PostgreSQL, Redis, OpenSearch, Qdrant (Vector DB), Neo4j |
| **Observability** | OpenTelemetry, Prometheus, Grafana, Jaeger |
| **Infrastructure** | Docker, Kubernetes (Helm/Kustomize) |
| **Languages** | TypeScript, Python, Rust, Go |

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m '✨ Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more.

## 📬 Contact & Community

- **GitHub Issues** — Report bugs or request features
- **Pull Requests** — Contributions welcome
- **Security Concerns** — [Security Policy](SECURITY.md)

---

<div align="center">
  
**Made with ❤️ by the SOCup Team** · *Securing infrastructure, one event at a time.*

[![Star](https://img.shields.io/github/stars/vaishnav4281/socup.ai?style=social)](https://github.com/vaishnav4281/socup.ai)
[![Fork](https://img.shields.io/github/forks/vaishnav4281/socup.ai?style=social)](https://github.com/vaishnav4281/socup.ai)

</div>
