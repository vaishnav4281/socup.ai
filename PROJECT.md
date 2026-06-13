# SOCup AI — Local Development Guide

## Overview

SOCup AI is an enterprise-grade, event-driven Security Operations Center (SOC) platform with AI-powered investigation. This guide covers running the full stack locally with LLM integration.

## Prerequisites

- **OS**: Linux / macOS / WSL2
- **Docker & Docker Compose** (for infrastructure: PostgreSQL, Redis, Kafka, OpenSearch, Qdrant)
- **Python 3.11+** with `venv`
- **Node.js 18+** & npm
- **Ollama** (local LLM provider)

---

## Quick Start (Full Stack)

### 1. Start Infrastructure (Docker)

```bash
docker-compose up -d
```

This spins up:
- PostgreSQL (port 5432)
- Redis (port 6379)
- OpenSearch (port 9200)
- Qdrant vector DB (port 6333)
- Kafka (port 9092)
- Prometheus (port 9090)
- Grafana (port 3000)

### 2. Set Up Python Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r agents/security-agent/requirements.txt
```

### 3. Configure LLM (Ollama)

Install Ollama and pull models:

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama serve
ollama pull llama3.2:3b        # Chat model
ollama pull nomic-embed-text   # Embedding model (RAG)
```

Run the onboarding wizard:

```bash
cd agents/security-agent
python main.py onboard
```

Set:
- DB host: `localhost`, port: `9200`, no SSL, no auth
- Ollama URL: `http://localhost:11434`
- Model: `llama3.2:3b` (or any model you pulled)

### 4. Start the AI Agent Service

```bash
cd agents/security-agent
python main.py service --host 127.0.0.1 --port 7799
```

This starts:
- **REST API** at `http://127.0.0.1:7799`
- **Background scheduler** for automated analysis
- **Chat streaming endpoint** at `/api/chat/stream`

### 5. Start GraphQL Microservices

Terminal 2:

```bash
source .venv/bin/activate
cd services/alerts && python main.py &
cd services/timeline && python main.py &
```

### 6. Start GraphQL Gateway

Terminal 3:

```bash
cd apps/gateway
npm install
npm run dev
```

Gateway runs at `http://localhost:4000`

### 7. Start Next.js Frontend

Terminal 4:

```bash
cd apps/web
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## Using LLM to Full Potential

### Local LLM (Ollama) — Best for Privacy

```bash
# In config.yaml set:
llm:
  provider: ollama
  ollama_model: llama3.2:3b
  ollama_embed_model: nomic-embed-text
  temperature: 0.2
  max_tokens: 65536
```

Run the agent and test:

```bash
python main.py chat
```

Try queries:
- "What's the threat level for IP 192.168.1.100?"
- "Create a baseline for normal traffic patterns"
- "Compare recent activity to baseline"

### Remote LLM (OpenAI, Anthropic, etc.)

Modify `core/llm_provider.py` to add your provider. The architecture supports provider-agnostic LLM integration.

### RAG Pipeline

The agent uses OpenSearch as a vector store. Embeddings are generated using `nomic-embed-text` (Ollama) and stored in the `socup-ai-vectors` index. During chat, relevant context is retrieved via KNN similarity search.

---

## Architecture At a Glance

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Next.js UI  │────▶│ GraphQL G/W  │────▶│ Microservices│
│  (port 3000) │     │  (port 4000) │     │  (8xx1-8xx2) │
└──────────────┘     └──────┬───────┘     └──────┬───────┘
                            │                    │
                            │           ┌────────▼────────┐
                            │           │  Apache Kafka   │
                            │           │  (Event Bus)    │
                            │           └────────┬────────┘
                            │                    │
                     ┌──────▼────────────────────▼───────┐
                     │       AI Agent (Python)           │
                     │  LangGraph · RAG · Skills Engine   │
                     │  API: 127.0.0.1:7799              │
                     └──────┬────────────────────┬───────┘
                            │                    │
                     ┌──────▼──────┐    ┌────────▼────────┐
                     │  OpenSearch │    │  Qdrant (Vector)│
                     │  (Logs)     │    │  (RAG)          │
                     └─────────────┘    └─────────────────┘
```

---

## Key Files

| File | Purpose |
|---|---|
| `agents/security-agent/main.py` | CLI entrypoint (chat, service, dispatch) |
| `agents/security-agent/web/api/server.py` | FastAPI web server + REST endpoints |
| `agents/security-agent/core/chat_router/logic.py` | LangGraph orchestration |
| `agents/security-agent/core/rag_engine.py` | RAG embedding & retrieval |
| `services/alerts/main.py` | Alerts GraphQL subgraph |
| `services/timeline/main.py` | Timeline GraphQL subgraph |
| `apps/gateway/src/index.ts` | Apollo Federation Gateway |
| `apps/web/src/app/page.tsx` | Main dashboard |

---

## Environment Variables (`.env`)

```env
# Database (optional — only if OpenSearch requires auth)
DB_USERNAME=admin
DB_PASSWORD=your_password

# Ollama
OLLAMA_BASE_URL=http://localhost:11434

# Threat Intel APIs (optional)
ABUSEIPDB_API_KEY=
ALIENVAULT_API_KEY=
VIRUSTOTAL_API_KEY=
TALOS_CLIENT_ID=
TALOS_CLIENT_SECRET=

# MaxMind GeoIP (optional)
MAXMIND_LICENSE_KEY=
```

---

## Troubleshooting

**Cannot connect to OpenSearch** — Ensure Docker container is running: `docker ps | grep opensearch`

**Cannot connect to Ollama** — Run `ollama serve` and check `curl http://localhost:11434/api/tags`

**No skills found** — Ensure `agents/security-agent/skills/` directory exists with skill subdirectories

**Gateway cannot reach subgraphs** — Start alerts and timeline services before the gateway

**Next.js build errors** — This project uses Next.js; if you encounter API errors, check `node_modules/next/dist/docs/` for breaking changes
