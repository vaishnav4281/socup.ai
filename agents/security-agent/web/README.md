# SOCup AI Web UI (Legacy)

> **⚠️ DEPRECATED:** The standalone React/Vite frontend has been superseded by the Next.js dashboard at `apps/web/`.

This directory contains the old standalone React/Vite chat UI for the SOCup AI agent.

## Architecture Change

The agent no longer runs a FastAPI REST server (`main.py service`). It now operates as a **Kafka worker** (`main.py worker`). The **main frontend** is the Next.js SOC dashboard:
- **Dashboard**: `apps/web/` (Next.js, TypeScript, Tailwind)
- **Gateway**: `apps/gateway/` (Apollo Federation, port 4000)
- **GraphQL Subgraphs**: `services/alerts/`, `services/timeline/`

## Legacy Reference

The old UI communicated with the agent REST API at `:7799`. That API has been removed. If you need this UI, you would need to connect it to the GraphQL Gateway at `:4000` instead.
