# Security Policy

## Supported Versions

SOCup AI is currently in active development. Security fixes are backported to the latest stable release only.

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| < latest | :x:               |

---

## Security Architecture

SOCup AI is a **locally-deployed agent** designed to run inside your own network. It does not transmit data externally unless explicitly configured with optional third-party API keys (AbuseIPDB, AlienVault OTX, VirusTotal, Cisco Talos).

### Deployment Model

SOCup AI is **not hardened for exposure to untrusted users**. It is designed for:
- **Single-operator SOC** teams analyzing logs on internal networks
- **Trusted network access only** — assume all API consumers are authorized

The current implementation:
- **Has no authentication/authorization layer** — anyone who can reach the service can use it
- **Binds to 0.0.0.0 by default** — ensure network firewall isolation (see "Network Security" below)
- **Exposes skill configuration and logs via API** — do not expose to untrusted networks

### Network Security

The agent no longer exposes an API server. It runs as a **Kafka worker** (`python main.py worker`) consuming from `threat-analysis-requests` and producing to `threat-analysis-results`.

**API surface has been replaced by Kafka + GraphQL:** The GraphQL Gateway (`:4000`) is the sole external entry point. The agent is only reachable via Kafka topics.

### Authentication

**Current state**: The GraphQL Gateway has **no authentication mechanism**. It is designed for trusted network use only.

---

## Key Security Controls in the Codebase

### 1. Path Traversal Prevention ✓

All file operations on conversation IDs and skill names are validated:
- **Conversation deletion** (`DELETE /api/conversations/{conversation_id}`):
  - Validates conversation_id contains only alphanumeric, `-`, `_` characters
  - Resolves path and checks it stays within `ROOT/conversations/` directory
  - Returns `403 Forbidden` if path escapes safe directory
  
- **Skill manifest/instruction editing** (`PUT /api/skills/{skill_name}/*`):
  - Validates skill_name contains only alphanumeric, `_` characters
  - Checks resolved path is direct child of `ROOT/skills/`
  - Returns `403 Forbidden` if not

### 2. Input Validation

- **Conversation IDs**: Validated to alphanumeric + `-_` only
- **Skill names**: Validated to alphanumeric + `_` only
- **YAML parsing**: Uses `yaml.safe_load()` (not `yaml.load()`)
- **Chat messages**: Passed to LLM as-is; LLM reasoning bounds user input (see "Prompt Injection" below)

### 3. Secrets Isolation ✓

Credentials are stored **exclusively in `.env`** (git-ignored):
- Database password
- LLM provider credentials (Ollama base URL)
- Threat intelligence API keys (AbuseIPDB, AlienVault, VirusTotal, Talos)
- GeoIP license keys (MaxMind)
- Skill-specific variables

**`config.yaml` contains zero secrets*** — only non-sensitive configuration (indices, hosts, etc.).

The `.env` file is:
- Created during `python main.py onboard`
- Loaded via `python-dotenv` at startup
- Masked in the `/api/env` response (secrets shown as `••••••••`)
- Never logged or exposed in errors

*Example config.yaml (safe to commit):*
```yaml
db:
  host: localhost
  port: 9200
  logs_index: socup-ai-logs
llm:
  provider: ollama
  ollama_base_url: http://localhost:11434
```

*Example .env (git-ignored, never committed):*
```
DB_USERNAME=admin
DB_PASSWORD=secure_password_here
ABUSEIPDB_API_KEY=your_key_here
```

### 4. SQLite Checkpointing ✓

Conversation and runtime state are persisted locally:
- **Chat memory**: `data/conversations.db` (LangGraph `SqliteSaver`)
- **Scheduler memory**: `data/runtime_memory.db` (LangGraph `SqliteSaver`)
- **Not exposed** on the network; accessed only by the Python process

### 5. Prompt Injection Mitigation

User questions are passed to the LLM but bounded by skill instructions:
- **System prompt** (from `core/chat_router/instruction.md`): Defines boundaries for skill selection
- **Skill instructions** (from each skill's `instruction.md`): Define what the skill can/should do
- **Query building**: Parameterized OpenSearch queries (not string concatenation)

**Known risk**: If an LLM is compromised or jailbroken, it could bypass skill boundaries. This is inherent to agentic AI and mitigated by:
- Careful instruction writing
- Query validation before execution
- Audit logging of all skill invocations

### 6. CORS via GraphQL Gateway ✓

The GraphQL Gateway (Apollo Federation at `:4000`) handles CORS for frontend requests. The agent itself has no HTTP surface — all communication is over Kafka (internal, no CORS needed).

### 7. OpenSearch Query Safety

Query construction is LLM-assisted but validated:
- **Field names** discovered dynamically from schema (data-agnostic, no hardcoding)
- **Query structure** built by `core/query_builder.py` using parameterized APIs
- **Query repair** uses LLM but always submits the repaired query for validation before execution
- **Size limits**: Default 100 results; configurable up to 10,000 (prevents memory exhaustion)

### 8. Logging Practices

Logs are written to stdout/stderr. Consider:
- **Never log passwords or API keys** — currently enforced by Config; all secrets masked
- **Error messages** include type/message but not full stack traces in API responses (to prevent info leakage)
- **Debug logs** may contain LLM prompts and results — keep DEBUG level off in production

---

## Threat Intelligence API Keys

If you configure external threat intelligence integrations, IP addresses and domains discovered in your logs will be sent to those external services:

**APIs used by `threat_analyst` skill** (if configured):
- **AbuseIPDB** (`ABUSEIPDB_API_KEY`) — IP abuse history and score
- **AlienVault OTX** (`ALIENVAULT_API_KEY`) — Threat intelligence pulses
- **VirusTotal** (`VIRUSTOTAL_API_KEY`) — Multi-engine malware detection
- **Cisco Talos** (`TALOS_CLIENT_ID`, `TALOS_CLIENT_SECRET`) — Reputation and threat data

**Before enabling**:
1. Review each vendor's **privacy policy** and **data retention policy**
2. Ensure your organization's **data governance approves** sending IPs/domains to external services
3. Understand the **API costs** (some charge per query)

**To disable**: Simply do not set the corresponding environment variable in `.env`. Skills check for env var presence before making external calls.

---

## Dependency Security

SOCup AI depends on external Python packages. Security best practices:
1. **Pin versions** in `requirements.txt` to known-good releases
2. **Regular updates**: Monitor dependencies for security patches
3. **CVE scanning**: Use `pip-audit` or similar to detect known vulnerabilities

```bash
pip install pip-audit
pip-audit  # Scan current environment
```

Current critical dependencies:
- `confluent-kafka` — Kafka client; keep updated
- `opensearch-py` — Database client; keep updated
- `langgraph` — Graph orchestration; keep updated
- `requests` — HTTP client; keep updated
- `pyyaml` — Config parsing; uses `safe_load()` (not vulnerable to RCE)

---

## File Permissions

Ensure proper permissions on sensitive files:

```bash
chmod 600 .env                    # Only owner can read
chmod 755 config.yaml             # World-readable (no secrets)
chmod 700 data/                   # Only owner can access
chmod 600 data/conversations.db   # Only owner can read/write
chmod 600 data/runtime_memory.db  # Only owner can read/write
```

---

## Data Retention

SOCup AI stores:
- **Conversations** in `data/conversations.db` — Indefinite (auto-purge not implemented)
- **Agent memory** in `data/runtime_memory.db` — Indefinite
- **RAG embeddings** in OpenSearch vector index — Per index retention policy
- **Logs** to stdout/stderr — Depends on log aggregation system

**To delete conversation history**:
```bash
# Delete a single conversation:
python main.py delete-conversation <conversation_id>

# To reset all data:
rm -rf data/conversations.db data/runtime_memory.db
```

---

## Reporting a Vulnerability

If you discover a security vulnerability in SOCup AI, please **do not open a public GitHub issue**.

1. Open a [GitHub Security Advisory](https://github.com/SOCup AI/SOCup AI/security/advisories/new) (private disclosure).
2. Include a description of the issue, steps to reproduce, and any proof-of-concept code.
3. You can expect an initial acknowledgement within 5 business days and a status update within 14 days.

Vulnerabilities confirmed as valid will be patched in a timely manner. Credit will be given in the release notes unless you prefer to remain anonymous.

---

## Future Security Roadmap

Planned improvements:
- [ ] **API authentication** — API key or JWT-based auth
- [ ] **Rate limiting** — Per-IP/API-key request throttling
- [ ] **HTTPS/TLS** — Secure communication with client
- [ ] **Audit logging** — Immutable log of all API calls for regulatory compliance
- [ ] **Role-based access control (RBAC)** — Different permissions for different users
- [ ] **Secrets encryption at rest** — Encrypt `.env` and database secrets
- [ ] **Multi-tenancy** — Support multiple isolated SOCup AI instances per deployment
- [ ] **Vulnerability scanning** — Automated CVE detection and patching alerts
