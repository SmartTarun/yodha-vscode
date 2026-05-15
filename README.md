# Yodha — AI Engineering Team for VS Code

> 15 specialized AI agents + PM-Agent orchestration, accessible via `@yodha` in GitHub Copilot Chat.
> Powered by VS Code LLM (GitHub Copilot), Anthropic Claude, or OpenAI GPT-4.

**Author:** Tarun

---

## Overview

Yodha brings a full AI engineering team into your VS Code editor. A PM-Agent breaks your request into tasks and hands them off to the right specialist agents in dependency order — each one streams production-ready code directly into Copilot Chat.

```
@yodha /create build a todo app with React + FastAPI + PostgreSQL
```

The PM-Agent automatically engages the DB Architect → Backend Developer → Frontend Developer → QA Engineer → Tech Writer in sequence, passing each agent's output as context to the next.

---

## Agents

| Command | Agent | Specialization |
|---------|-------|----------------|
| `@yodha /backend` | Backend Developer | FastAPI, Node.js, Go, REST/GraphQL |
| `@yodha /frontend` | Frontend Developer | React, Vue, Angular, TypeScript, Tailwind |
| `@yodha /cloud` | Cloud Architect | AWS, Azure, GCP, Terraform, Kubernetes |
| `@yodha /qa` | QA Engineer | pytest, Jest, Playwright, Cypress, k6 |
| `@yodha /devops` | DevOps Engineer | GitHub Actions, Docker, ArgoCD, Prometheus |
| `@yodha /db` | Database Architect | PostgreSQL, MongoDB, Redis, migrations |
| `@yodha /data` | Data Engineer | Airflow, PySpark, dbt, Kafka, Delta Lake |
| `@yodha /mobile` | Mobile Developer | Swift/SwiftUI, Kotlin/Compose, React Native |
| `@yodha /ux` | UX Designer | Design systems, Tailwind UI, accessibility |
| `@yodha /api` | API Specification | OpenAPI 3.1, GraphQL SDL, gRPC Protobuf |
| `@yodha /ml` | ML Engineer | PyTorch, TensorFlow, MLflow, model serving |
| `@yodha /security` | Security Engineer | OWASP, SAST, auth, encryption, threat modeling |
| `@yodha /perf` | Performance Engineer | k6, Locust, profiling, caching, optimization |
| `@yodha /docs` | Technical Writer | README, API docs, ADRs, runbooks, Mermaid |
| `@yodha /compliance` | Compliance Engineer | GDPR, SOC2, HIPAA, audit logs |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  @yodha /create                      │
│                  Copilot Chat                        │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                  PM-Agent                            │
│  Analyzes requirement → creates ordered task plan   │
│  Passes output of each agent as context to next     │
└──┬──────────┬──────────┬──────────┬─────────────────┘
   │          │          │          │
   ▼          ▼          ▼          ▼
DB Arch   Backend   Frontend     QA Eng   ...
```

Each agent is **independent** — no inter-agent imports, no shared state. The PM-Agent coordinates via task descriptions and handoff context.

---

## LLM Providers

Choose your AI backend in VS Code Settings (`yodha.aiProvider`):

| Provider | Setting value | Models | API Key needed? |
|----------|--------------|--------|-----------------|
| VS Code LLM | `vscode` (default) | GitHub Copilot models (gpt-4o) | No — uses your Copilot subscription |
| Anthropic Claude | `claude` | Opus 4 (PM) + Sonnet 4 (workers) | Yes — `yodha.claudeApiKey` |
| OpenAI GPT-4 | `openai` | GPT-4 (PM) + GPT-4-turbo (workers) | Yes — `yodha.openaiApiKey` |

---

## Project Structure

```
yodha-vscode/
├── src/                        # Main @yodha orchestrator extension
│   ├── extension.ts            # Entry point
│   ├── chat/participant.ts     # Copilot Chat handler
│   ├── agents/                 # All 15 agents + PM-Agent + factory
│   └── llm/                    # LLM provider abstraction layer
│
├── extensions/                 # 15 standalone individual agent extensions
│   ├── yodha-backend-dev/      # @yodha-backend
│   ├── yodha-frontend-dev/     # @yodha-frontend
│   ├── yodha-cloud-arch/       # @yodha-cloud
│   ├── yodha-qa/               # @yodha-qa
│   ├── yodha-devops/           # @yodha-devops
│   ├── yodha-db-arch/          # @yodha-db
│   ├── yodha-data-eng/         # @yodha-data
│   ├── yodha-mobile-dev/       # @yodha-mobile
│   ├── yodha-ux/               # @yodha-ux
│   ├── yodha-api-spec/         # @yodha-api
│   ├── yodha-ml-eng/           # @yodha-ml
│   ├── yodha-security/         # @yodha-security
│   ├── yodha-perf/             # @yodha-perf
│   ├── yodha-tech-writer/      # @yodha-docs
│   └── yodha-compliance/       # @yodha-compliance
│
└── scripts/
    └── generate-extensions.mjs  # Regenerates all 15 extensions from config
```

---

## Getting Started

### Prerequisites

- VS Code 1.85+
- GitHub Copilot extension (for `vscode` provider — recommended)

### Install & Run (development)

```bash
# Clone the repo
git clone https://github.com/SmartTarun/yodha-vscode.git
cd yodha-vscode

# Install dependencies for the main extension
npm install
npm run compile

# Open in VS Code and press F5 to launch the Extension Development Host
```

### Configuration

Open VS Code Settings (`Ctrl+,`) and search **Yodha**:

```jsonc
{
  // Choose provider: "vscode" (default), "claude", or "openai"
  "yodha.aiProvider": "vscode",

  // Only needed if using Claude
  "yodha.claudeApiKey": "sk-ant-...",

  // Only needed if using OpenAI
  "yodha.openaiApiKey": "sk-..."
}
```

### Usage

```
// Orchestrated multi-agent — PM chooses and sequences agents automatically
@yodha /create build a REST API for a blog with auth, PostgreSQL, and tests

// Direct single-agent commands
@yodha /backend implement JWT refresh token rotation in FastAPI
@yodha /security audit this API for OWASP Top 10 vulnerabilities
@yodha /docs write a README for my FastAPI project
@yodha /agents  — list all agents and capabilities
```

### Individual Agent Extensions

Each agent is also available as a standalone VS Code extension under `extensions/`. Each can be installed, published, and configured independently.

```bash
cd extensions/yodha-backend-dev
npm install
npm run compile
# Press F5 in VS Code to launch
# Then use @yodha-backend in Copilot Chat
```

To regenerate all 15 extensions after editing system prompts or capabilities:

```bash
node scripts/generate-extensions.mjs
```

---

## Development

### Adding a new agent

1. Add an entry to the `AGENTS` array in [`scripts/generate-extensions.mjs`](scripts/generate-extensions.mjs)
2. Run `node scripts/generate-extensions.mjs`
3. Add the agent to [`src/agents/factory.ts`](src/agents/factory.ts) in the main extension

### Switching LLM providers at runtime

The `LLMProvider` interface (`src/llm/provider.ts`) abstracts all three backends. Agents call `llmProvider.stream()` or `llmProvider.complete()` — they never know which backend is active.

---

## License

MIT

---

*Built by **Tarun***
