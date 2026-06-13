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

<img width="1865" height="961" alt="Screenshot from 2026-06-13 17-46-26" src="https://github.com/user-attachments/assets/827a664e-4072-4406-b6d4-14485c0da134" />

</div>

## ✨ Highlights

| 🚀 Feature                      | 📖 Description                                                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **📊 Executive Dashboard**      | Monitor security posture with live metrics, critical alerts, risk trends and investigation statistics in one unified view. |
| **🤖 AI Investigation Engine**  | Agentic AI powered by LangGraph and RAG that analyzes incidents, correlates evidence and generates investigation reports.  |
| **⚡ Real-Time Event Streaming** | Event-driven architecture built on Apache Kafka for low-latency processing and scalable communication between services.    |
| **🗺️ Attack Timeline**         | Visualize and replay security events in chronological order to understand the complete attack lifecycle.                   |
| **🎯 Threat Intelligence**      | Explore MITRE ATT&CK techniques, Indicators of Compromise (IOCs) and enriched security context from a single workspace.    |
| **🔍 Semantic Search**          | Combine OpenSearch and vector retrieval to discover related events, historical patterns and contextual information.        |
| **🧩 GraphQL Federation**       | Multiple domain services composed into a single API, enabling efficient data aggregation and real-time subscriptions.      |
| **📈 Enterprise Observability** | Integrated monitoring with Prometheus and Grafana for infrastructure, service health and event processing visibility.      |

---

# 🧠 Why SOCup AI?

Modern security teams work with thousands of events every minute, spread across multiple dashboards, log systems and investigation tools.

SOCup AI brings everything together into a single AI-native platform that helps analysts investigate incidents faster, correlate security data intelligently and understand attack behavior in real time.

Built around distributed systems and event-driven architecture, the platform combines modern backend engineering with practical AI workflows for security operations.

---
## 📸 Screenshots

| Page | Preview |
|---|---|
| **Executive Dashboard** | <img width="1865" height="961" alt="Screenshot from 2026-06-13 17-46-26" src="https://github.com/user-attachments/assets/c1f85e02-eb81-4d6a-b47e-45897e604237" />
) |
| **Attack Timeline** | (<img width="1865" height="961" alt="Screenshot from 2026-06-13 17-47-23" src="https://github.com/user-attachments/assets/7c64b07b-454a-4d4b-a3fa-1392d6f27cac" />
) |
| **Investigation Workspace** | (<img width="1865" height="961" alt="Screenshot from 2026-06-13 17-47-14" src="https://github.com/user-attachments/assets/483cc41f-4d1d-4d7d-b9dc-bfa7e6725cde" />
) |
| **Threat Intelligence** |(<img width="1865" height="961" alt="Screenshot from 2026-06-13 17-48-00" src="https://github.com/user-attachments/assets/85c29310-1a34-4636-830a-17334c0354a4" />
) |

# 🏗️ Architecture

SOCup AI follows an **event-driven microservice architecture** where every security event flows through Apache Kafka and is processed independently by specialized services.

```
                           🌐 Next.js Dashboard
                                    │
                       GraphQL Queries & Subscriptions
                                    │
                     🚪 Apollo GraphQL Federation Gateway
                                    │
        ┌──────────────┬──────────────┬──────────────┐
        │              │              │              │
   🔐 Auth        ⚠️ Alerts      📜 Timeline    📊 Analytics
        │              │              │              │
        └──────────────┴───────┬──────┴──────────────┘
                               │
                     📨 Apache Kafka Event Bus
                               │
              ┌────────────────┼────────────────┐
              │                                 │
      🤖 AI Investigation Agent         📈 Future Services
      LangGraph • RAG • Skills
                               │
     PostgreSQL • Redis • OpenSearch • Qdrant
```

---

# 📂 Repository Structure

```
socup-ai/

├── apps/
│   ├── web/                 # Next.js Dashboard
│   └── gateway/             # Apollo Federation Gateway
│
├── services/
│   ├── auth/
│   ├── alerts/
│   ├── timeline/
│   ├── investigation/
│   ├── analytics/
│   └── notifications/
│
├── agents/
│   └── security-agent/      # LangGraph + RAG Engine
│
├── libs/
│   ├── graphql/
│   ├── events/
│   └── shared/
│
└── infra/
    ├── docker/
    ├── kubernetes/
    └── monitoring/
```

---

# 🎯 Core Modules

### 📊 Executive Dashboard

A unified security overview providing:

* Live security metrics
* Risk distribution
* Critical alerts
* Investigation statistics
* AI activity feed

---

### 🤖 AI Investigation Engine

An agent-based investigation workflow powered by LangGraph.

```
Question

↓

Supervisor

↓

Threat Analyst

↓

Forensic Investigator

↓

MITRE Mapper

↓

Response Planner

↓

Investigation Report
```

---

### 📜 Attack Timeline

Visualize and replay security events across your infrastructure with chronological event correlation and investigation history.

---

### 🧠 Threat Intelligence

Explore MITRE ATT&CK techniques, IOC libraries, adversary information and contextual threat intelligence from one interface.

---

# 🛠️ Technology Stack

| Layer              | Technologies                                   |
| ------------------ | ---------------------------------------------- |
| 🎨 Frontend        | Next.js · React · TypeScript · Tailwind CSS    |
| 🔌 API             | Apollo GraphQL Federation · Strawberry GraphQL |
| 📨 Event Streaming | Apache Kafka                                   |
| 🤖 AI              | LangGraph · LangChain · Ollama · RAG           |
| 🔍 Search          | OpenSearch                                     |
| 🧠 Vector Database | Qdrant                                         |
| 🗄️ Data           | PostgreSQL · Redis                             |
| 📈 Observability   | Prometheus · Grafana · OpenTelemetry           |
| 🐳 Infrastructure  | Docker · Kubernetes Ready                      |

---

# 🌟 Engineering Highlights

* ⚡ Event-Driven Microservices
* 🧩 GraphQL Federation
* 🤖 Agentic AI Architecture
* 🔍 Retrieval-Augmented Generation
* 📊 Real-Time Investigation Dashboard
* 📨 Kafka Event Streaming
* 📜 Event Sourcing Timeline
* 🧠 Semantic Search & Vector Retrieval
* 📈 Enterprise Observability
* 🏗️ Modular Service Design

---

# 📚 Documentation

| Document            | Description             |
| ------------------- | ----------------------- |
| **PROJECT.md**      | Local development guide |
| **ARCHITECTURE.md** | High-level architecture |
| **DETAILS.md**      | Technical deep dive     |
| **WORKFLOW.md**     | Integration workflows   |

---

# 🚀 Project Vision

SOCup AI explores how modern Security Operations Centers can combine:

* Event-Driven Architecture
* GraphQL Federation
* Agentic AI
* Vector Search
* Distributed Systems
* Real-Time Analytics

to build an intelligent and scalable security investigation platform.

---

# 🔮 Future Enhancements

* 🕸️ Neo4j Attack Graph
* ⚡ Event Replay Engine
* 🤝 Multi-Agent Collaboration
* 🔍 Distributed Tracing
* ☁️ Kubernetes Production Deployment
* 🏢 Multi-Tenant Organizations

---

# 🤝 Contributing

Ideas, discussions and contributions are always welcome.

If you enjoy distributed systems, AI agents or cybersecurity engineering, feel free to fork the project and build something even better.

---

# 📄 License

Released under the **MIT License**.

---

<div align="center">

### ⭐ Star the repository if you found it useful.

**Built with Next.js • GraphQL Federation • Apache Kafka • LangGraph • Python**

</div>
