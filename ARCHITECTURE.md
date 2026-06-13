# SOCup AI - System Architecture

SOCup AI is a massively scalable, event-driven enterprise Security Operations Center (SOC) platform. It departs from monolithic chatbot designs, scaling instead as a cohesive mesh of domain-driven microservices.

## Architectural Trade-offs & Decisions

### 1. Event-Driven Messaging over Synchronous REST
* **Decision**: We utilize **Apache Kafka** as the absolute source of truth and central nervous system.
* **Trade-off**: Increases system complexity (requires schema registries, KRaft/zookeeper, and replay logic), but completely decouples microservices. A burst of 10M login events will never crash the downstream AI agent; the `Alert Service` consumes at its own pace. 

### 2. CQRS & Event Sourcing in the Timeline Service
* **Decision**: Implementing Command Query Responsibility Segregation (CQRS) for the attack timeline.
* **Trade-off**: Requires maintaining two models (Write vs. Read) and eventual consistency, but allows us to aggressively cache the Read model in Redis for sub-millisecond dashboard renders while persisting immutable event arrays to PostgreSQL.

### 3. GraphQL Federation over Unified REST
* **Decision**: Using an **Apollo Federation Gateway** to aggregate subgraphs from completely isolated FastAPI microservices.
* **Trade-off**: Requires strict schema coordination between teams, but prevents the "backend-for-frontend (BFF) bottleneck" and allows UI developers to seamlessly request relational data (e.g., matching a Kafka `Alert` with a Postgres `User` identity) in a single request. 
* **Real-time**: We leverage GraphQL Subscriptions (WebSockets) directly from the Gateway to stream real-time attacks onto the Next.js UI, bypassing polling.

### 4. Headless AI Engine (SOCup AI Legacy to Agentic Microservice)
* **Decision**: Encapsulating the original SOCup AI AI into a dedicated `agents/security-agent` RAG worker. 
* **Trade-off**: The AI loses direct database access. Instead, it must consume GraphQL APIs or specific RAG OpenSearch endpoints. This adds latency to the AI's "thought process" but strictly enforces zero-trust data boundaries.

### 5. Multi-Database Persistence Strategy
* **PostgreSQL**: Relational truth (Users, Organizations, RBAC roles).
* **Redis**: Ephemeral state, Rate-limiting, GraphQL DataLoader caching.
* **OpenSearch / Elasticsearch**: Massive ingestion of raw log data and secondary indexing.
* **Qdrant (Vector DB)**: Specific HNSW indexing for rapid semantic similarity lookups (RAG behavior matching).

---

## The Request Lifecycle (Example: A Suspicious Login)

1. **Ingest**: The `Auth Service` handles the login event and immediately fires a `{ event: "LOGIN_SUCCESS", ip: "1.2.3.4" }` onto the `events.auth` Kafka topic.
2. **Analysis**: The `Risk Engine` microservice, constantly listening to Kafka, evaluates the IP. It queries the Vector DB for behavior anomalies.
3. **Trigger**: Determining a 94% anomaly score, the Risk Engine publishes to `events.alerts`.
4. **Agent Action**: The `Security Agent` consumes the alert, constructs a LangGraph decision tree, fetches related RAG context, and issues an isolation command back onto the bus.
5. **Real-time Render**: The `Gateway` captures the state change and pushes the precise GraphQL Payload over a WebSocket to the Next.js dashboard. 
