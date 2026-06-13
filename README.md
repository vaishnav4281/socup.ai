# SOCup AI — Enterprise Security Investigation Platform

SOCup AI is a distributed, event-driven Security Operations Center (SOC) platform designed for real-time threat investigation and AI-powered intelligence.

It is built as an enterprise-grade microservice architecture, offering a high-performance GraphQL interface, real-time observability, and deep AI integrations.

## Architecture Vision

Unlike traditional monolithic dashboards, SOCup AI is built on a scalable, event-driven backbone utilizing the following stack:

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Dark Enterprise UI
- **Gateway:** GraphQL Federation & Subscriptions
- **Backend:** FastAPI Microservices
- **Messaging:** Apache Kafka for Event-driven communication
- **Storage:** PostgreSQL, Redis, OpenSearch, Qdrant (Vector DB)
- **AI Engine:** Python-based Agentic frameworks (LangGraph, RAG)

### System Flow
1. **Login Event** → User acts on the system
2. **Kafka** → Event is propagated across services
3. **Risk Engine / Alert Service** → Analyzes context, aggregates risk
4. **Timeline Service** → Persists sequence of events via Event Sourcing
5. **AI Context Builder** → Pulls RAG context and vectors
6. **GraphQL Gateway** → Pushes updates over WebSockets (Subscriptions)
7. **Frontend Dashboard** → Renders updates in real time

## Repository Structure

```
apps/
  web/               # Next.js Frontend Dashboard
  gateway/           # GraphQL Federation Gateway
services/
  auth/              # Authentication & Identity Service
  alerts/            # Real-time Alerting Service
  timeline/          # Attack Timeline & Event Sourcing Service
  investigation/     # Investigation Workspace Service
  analytics/         # Risk Engine & Analytics Service
  notifications/     # Notifications & Delivery Service
agents/
  security-agent/    # Core AI Investigation Engine & RAG Foundation (Formally SOCup AI)
libs/
  events/            # Shared Kafka Event Schemas
  graphql/           # GraphQL Shared Definitions
  shared/            # Common Utilities & Configs
infra/
  docker/            # Docker Compose configs
  kubernetes/        # K8s Manifests (Helm/Kustomize)
  monitoring/        # Prometheus & Grafana configurations
```

## Core Features

- **Executive Dashboard:** Live metrics, critical alerts, and dynamic risk distribution.
- **AI Investigation:** NLP-driven security investigations utilizing the RAG agent.
- **Attack Timeline:** Real-time replay of security events across the entire monitored infrastructure.
- **Live Event Feed:** Streaming updates utilizing GraphQL Subscriptions.
- **Comprehensive Workspace:** Drill-down views for Users, Devices, Sessions, Threat Intel, and Recommendations.
- **Attack Graph:** Relational insights between MITRE ATT&CK patterns, API calls, and Threat Actors.

## Local Development

Prerequisites:
- Docker & Docker Compose
- Node.js 18+ & npm
- Python 3.11+
- Rust & Go (optional for various microservices tools)

1. **Start the Infrastructure Components:**

```bash
docker-compose up -d
```

Will start PostgreSQL, Redis, OpenSearch, Qdrant, Kafka, Prometheus, and Grafana.

2. **Start the Web App:**

```bash
cd apps/web
npm run dev
```

*(Detailed configurations coming soon for Gateway and specific Microservices)*
# socup.ai
