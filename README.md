# 🛡️ SOCup AI

<p align="center">

Enterprise Event-Driven Security Investigation Platform powered by AI Agents, GraphQL Federation and Apache Kafka.

Built for learning modern distributed systems, AI orchestration and enterprise security workflows.

</p>

---

## ✨ Overview

SOCup AI is a modern Security Operations Center (SOC) platform that helps analysts investigate threats using AI.

Instead of switching between multiple tools, SOCup AI brings dashboards, investigations, timelines and threat intelligence into one unified workspace.

The project is built using an event-driven architecture with GraphQL Federation, Apache Kafka and LangGraph AI agents.

---

# 📸 Screenshots

## 🏠 Executive Dashboard

![Dashboard](assets/dashboard.png)

---

## 🤖 AI Investigation Workspace

![Investigation](assets/investigation.png)

---

## ⏳ Attack Timeline

![Timeline](assets/timeline.png)

---

## 🎯 Threat Intelligence

![Threat Intel](assets/threat-intel.png)

---

# 🚀 Features

✅ Executive Dashboard

✅ AI Investigation Agent

✅ Real-time Attack Timeline

✅ Threat Intelligence Workspace

✅ MITRE ATT&CK Mapping

✅ GraphQL Federation

✅ Apache Kafka Event Streaming

✅ LangGraph Multi-step AI Planning

✅ RAG Powered Context Retrieval

✅ OpenSearch Log Search

✅ Qdrant Vector Search

✅ GraphQL Subscriptions

✅ Docker Compose Development

✅ Prometheus & Grafana Monitoring

---

# 🏗️ Architecture

![Architecture](assets/architecture.png)

```

                Next.js Dashboard
                        │
                GraphQL Federation
                        │
        ┌───────────────┼───────────────┐
        │               │               │
     Alerts        Timeline      Investigation
        │               │               │
        └───────────────┼───────────────┘
                        │
                  Apache Kafka
                        │
                  AI Agent (LangGraph)
                        │
      OpenSearch • Qdrant • Redis • PostgreSQL

```

---

# ⚡ Event Flow

```

Login Event

↓

Kafka Topic

↓

Risk Engine

↓

Alert Service

↓

Timeline Service

↓

AI Investigation Agent

↓

GraphQL Subscription

↓

Dashboard Update

```

---

# 🤖 AI Pipeline

```

User Question

↓

Supervisor Agent

↓

Skill Selection

↓

RAG Retrieval

↓

Threat Analysis

↓

Final Verdict

```

---

# 🛠️ Tech Stack

| Layer | Technology |
| -------------------------------- | -------------------------------- |
| Frontend | Next.js + TypeScript |
| Styling | Tailwind CSS |
| API | Apollo GraphQL Federation |
| Backend | Strawberry GraphQL |
| Messaging | Apache Kafka |
| AI | LangGraph + Ollama |
| Search | OpenSearch |
| Vector Database | Qdrant |
| Database | PostgreSQL |
| Cache | Redis |
| Monitoring | Prometheus + Grafana |
| Containerization | Docker Compose |

---

# 📂 Project Structure

```

apps/
web/
gateway/

services/
alerts/
timeline/
investigation/
analytics/

agents/
security-agent/

libs/
events/
graphql/
shared/

infra/
docker/
monitoring/
kubernetes/

```

---

# 💡 Why SOCup AI?

Traditional SOC tools are

❌ Expensive

❌ Monolithic

❌ Hard to extend

❌ Manual

SOCup AI explores a different approach:

- Event-driven architecture
- AI-native investigation
- GraphQL Federation
- Real-time dashboards
- Modular skill system
- Local-first LLM execution

---

# 📚 Documentation

| File | Description |
| -------------------------------- | -------------------------------- |
| PROJECT.md | Local development guide |
| ARCHITECTURE.md | High-level architecture |
| DETAILS.md | Deep technical documentation |
| WORKFLOW.md | External integrations |

---

# 🎯 Learning Goals

This project was built to learn and experiment with

- Distributed Systems
- Event-Driven Architecture
- GraphQL Federation
- Apache Kafka
- Agentic AI
- LangGraph
- RAG
- Vector Databases
- Enterprise Dashboard Design

---

# 🗺️ Roadmap

- [ ] Neo4j Attack Graph

- [ ] Event Replay Engine

- [ ] Multi-Agent Collaboration

- [ ] OpenTelemetry Tracing

- [ ] Kubernetes Production Deployment

- [ ] Multi-Tenant Organizations

---

# ⭐ Project Highlights

- Enterprise-inspired architecture

- GraphQL-first design

- Kafka-based communication

- AI-powered investigations

- Local-first execution

- Modern Next.js dashboard

- Modular microservice structure

---

# 🤝 Contributing

Pull requests, suggestions and discussions are always welcome.

Feel free to fork the project and experiment with new ideas.

---

# 📄 License

MIT License

---

<p align="center">

If you found this project interesting,

consider giving it a ⭐ on GitHub.

</p>
