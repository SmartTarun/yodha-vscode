<div align="center">

# 🤖 Yodha — AI Engineering Team for VS Code

**15 specialized AI agents + PM-Agent orchestration, right inside GitHub Copilot Chat**

[![VS Code](https://img.shields.io/badge/VS%20Code-1.85%2B-007ACC?logo=visualstudiocode)](https://code.visualstudio.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-Compatible-181717?logo=github)](https://github.com/features/copilot)

*Powered by **VS Code LLM** (GitHub Copilot) · **Anthropic Claude** · **OpenAI GPT-4***

**Author: Tarun**

</div>

---

## What is Yodha?

Yodha gives you a complete AI engineering team inside VS Code. Type a requirement in Copilot Chat and a **PM-Agent** automatically breaks it into tasks, picks the right specialist agents, and hands each one's output as context to the next — all streamed live.

```
@yodha /create build a SaaS todo app with React, FastAPI, PostgreSQL, and Stripe payments
```

The PM-Agent sequences: **DB Architect → Backend Dev → Frontend Dev → API Spec → QA Engineer → Tech Writer** — each agent receiving the previous agent's output as context.

---

## ✨ Features

- **15 specialist agents** covering the full engineering lifecycle
- **PM-Agent orchestration** — auto-selects and sequences agents with dependency-aware handoffs
- **3 LLM backends** — VS Code built-in (no key needed!), Claude, or OpenAI
- **Streaming responses** — see output as it's generated
- **Independent agents** — zero inter-agent coupling, each is self-contained
- **Individual extensions** — install only the agents you need
- **Cost tracking** — token usage and estimated cost shown after each session

---

## 🤖 Agents

### Orchestrator

| Command | Description |
|---------|-------------|
| `@yodha /create <requirement>` | PM-Agent analyzes, plans, and coordinates specialist agents automatically |
| `@yodha /agents` | List all 15 agents with capabilities |

### Specialist Agents

| Command | Agent | Core Technologies |
|---------|-------|-------------------|
| `@yodha /backend` | **Backend Developer** | FastAPI · Node.js · Go · REST · GraphQL · gRPC |
| `@yodha /frontend` | **Frontend Developer** | React · Vue · Angular · TypeScript · Tailwind CSS |
| `@yodha /cloud` | **Cloud Architect** | AWS · Azure · GCP · Terraform · Kubernetes · Helm |
| `@yodha /qa` | **QA Engineer** | pytest · Jest · Playwright · Cypress · k6 · Locust |
| `@yodha /devops` | **DevOps Engineer** | GitHub Actions · Docker · ArgoCD · Prometheus · Grafana |
| `@yodha /db` | **Database Architect** | PostgreSQL · MongoDB · Redis · Elasticsearch · migrations |
| `@yodha /data` | **Data Engineer** | Airflow · PySpark · dbt · Kafka · Delta Lake · BigQuery |
| `@yodha /mobile` | **Mobile Developer** | Swift/SwiftUI · Kotlin/Compose · React Native · Flutter |
| `@yodha /ux` | **UX Designer** | Design systems · Tailwind UI · WCAG · wireframes |
| `@yodha /api` | **API Spec Engineer** | OpenAPI 3.1 · GraphQL SDL · gRPC Protobuf · AsyncAPI |
| `@yodha /ml` | **ML Engineer** | PyTorch · TensorFlow · Hugging Face · MLflow · BentoML |
| `@yodha /security` | **Security Engineer** | OWASP · SAST · Semgrep · OAuth2 · threat modeling |
| `@yodha /perf` | **Performance Engineer** | k6 · Locust · profiling · Redis caching · SLOs |
| `@yodha /docs` | **Technical Writer** | README · API docs · ADRs · runbooks · Mermaid diagrams |
| `@yodha /compliance` | **Compliance Engineer** | GDPR · SOC2 · HIPAA · audit logs · data governance |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   GitHub Copilot Chat                         │
│              @yodha /create <your requirement>                │
└─────────────────────────┬────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                       PM-Agent                                │
│   • Analyzes requirement                                      │
│   • Creates dependency-ordered task plan (max 5 tasks)        │
│   • Passes each agent's output as context to the next         │
└────┬──────────┬──────────┬──────────┬──────────┬─────────────┘
     │          │          │          │          │
     ▼          ▼          ▼          ▼          ▼
  DB Arch   Backend   Frontend    QA Eng    Tech Writer
                                              ...

Each agent: receives task + context → streams response → done
No agent knows about or imports any other agent.
```

### LLM Provider Abstraction

```
LLMProvider (interface)
    ├── ClaudeProvider     → Anthropic SDK  (Opus PM + Sonnet workers)
    ├── OpenAIProvider     → OpenAI SDK     (GPT-4 PM + GPT-4-turbo workers)
    └── VSCodeLLMProvider  → vscode.lm API  (GitHub Copilot, zero config)
```

Agents call `llmProvider.stream()` or `llmProvider.complete()` — they never know which backend is active.

---

## 🚀 Getting Started

### Prerequisites

- VS Code 1.85+
- GitHub Copilot extension *(for the `vscode` provider — recommended, no extra API key needed)*

### Install & Run

```bash
# Clone
git clone https://github.com/SmartTarun/yodha-vscode.git
cd yodha-vscode

# Install & build
npm install
npm run compile

# Launch: open in VS Code, press F5
# → Extension Development Host opens
# → Type @yodha in Copilot Chat
```

### Configuration

Open **Settings** (`Ctrl+,`) and search **Yodha**:

```jsonc
{
  // "vscode" uses GitHub Copilot — no extra key needed (default)
  // "claude"  uses Anthropic Claude API
  // "openai"  uses OpenAI API
  "yodha.aiProvider": "vscode",

  // Only required for Claude
  "yodha.claudeApiKey": "sk-ant-...",
  "yodha.claudeModel.pm": "claude-opus-4-5",
  "yodha.claudeModel.worker": "claude-sonnet-4-5",

  // Only required for OpenAI
  "yodha.openaiApiKey": "sk-...",
  "yodha.openaiModel.pm": "gpt-4",
  "yodha.openaiModel.worker": "gpt-4-turbo"
}
```

### LLM Providers

| Provider | Setting | Models | API Key |
|----------|---------|--------|---------|
| **VS Code LLM** | `vscode` *(default)* | GitHub Copilot (gpt-4o) | None — uses Copilot subscription |
| **Anthropic Claude** | `claude` | Opus (PM) + Sonnet (workers) | `yodha.claudeApiKey` |
| **OpenAI GPT-4** | `openai` | GPT-4 (PM) + GPT-4-turbo (workers) | `yodha.openaiApiKey` |

---

## 💬 Usage Examples

### Multi-agent orchestration

```
@yodha /create build a REST API for a blog platform with:
  - JWT authentication
  - PostgreSQL database
  - React frontend
  - Full test suite
  - API documentation
```

The PM-Agent will engage: DB Arch → Backend → API Spec → Frontend → QA → Tech Writer

### Single-agent direct commands

```
@yodha /backend   implement JWT refresh token rotation in FastAPI with Redis
@yodha /frontend  build a real-time dashboard component with React + WebSockets
@yodha /cloud     write Terraform for an EKS cluster with autoscaling on AWS
@yodha /qa        write Playwright E2E tests for a checkout flow
@yodha /security  audit this FastAPI app for OWASP Top 10 vulnerabilities
@yodha /db        design a PostgreSQL schema for a multi-tenant SaaS app
@yodha /ml        build a sentiment analysis pipeline with HuggingFace + FastAPI
@yodha /devops    create a GitHub Actions CI/CD pipeline with Docker + ArgoCD
@yodha /docs      write a complete README for my open source Python library
@yodha /compliance implement GDPR-compliant audit logging with immutable trail
```

---

## 📦 Individual Agent Extensions

Each agent ships as its own standalone VS Code extension under `extensions/`. Install only what you need, configure each independently.

| Extension | Chat Command | Settings Prefix |
|-----------|-------------|-----------------|
| `yodha-backend-dev` | `@yodha-backend` | `yodha-backend-dev.*` |
| `yodha-frontend-dev` | `@yodha-frontend` | `yodha-frontend-dev.*` |
| `yodha-cloud-arch` | `@yodha-cloud` | `yodha-cloud-arch.*` |
| `yodha-qa` | `@yodha-qa` | `yodha-qa.*` |
| `yodha-devops` | `@yodha-devops` | `yodha-devops.*` |
| `yodha-db-arch` | `@yodha-db` | `yodha-db-arch.*` |
| `yodha-data-eng` | `@yodha-data` | `yodha-data-eng.*` |
| `yodha-mobile-dev` | `@yodha-mobile` | `yodha-mobile-dev.*` |
| `yodha-ux` | `@yodha-ux` | `yodha-ux.*` |
| `yodha-api-spec` | `@yodha-api` | `yodha-api-spec.*` |
| `yodha-ml-eng` | `@yodha-ml` | `yodha-ml-eng.*` |
| `yodha-security` | `@yodha-security` | `yodha-security.*` |
| `yodha-perf` | `@yodha-perf` | `yodha-perf.*` |
| `yodha-tech-writer` | `@yodha-docs` | `yodha-tech-writer.*` |
| `yodha-compliance` | `@yodha-compliance` | `yodha-compliance.*` |

```bash
# Run a single agent extension
cd extensions/yodha-security
npm install && npm run compile
# Press F5 → use @yodha-security in Copilot Chat
```

---

## 📁 Project Structure

```
yodha-vscode/
├── src/                            # Main @yodha orchestrator extension
│   ├── extension.ts                # Activation entry point
│   ├── chat/
│   │   └── participant.ts          # Copilot Chat handler + command routing
│   ├── agents/
│   │   ├── base.ts                 # BaseAgent class
│   │   ├── orchestrator.ts         # PM-Agent (task planning + handoffs)
│   │   ├── factory.ts              # Agent registry
│   │   ├── backend-dev.ts
│   │   ├── frontend-dev.ts
│   │   └── ...                     # 13 more agent files
│   └── llm/
│       ├── provider.ts             # LLMProvider interface
│       ├── claude-provider.ts      # Anthropic SDK implementation
│       ├── openai-provider.ts      # OpenAI SDK implementation
│       ├── vscode-provider.ts      # VS Code LM API implementation
│       └── factory.ts              # Creates provider from settings
│
├── extensions/                     # 15 standalone agent extensions
│   ├── yodha-backend-dev/
│   │   ├── src/
│   │   │   ├── agent.ts            # Agent role + system prompt
│   │   │   ├── chat/participant.ts # Chat handler
│   │   │   ├── extension.ts
│   │   │   └── llm/                # Self-contained LLM layer
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── ...                         # 14 more
│
├── scripts/
│   └── generate-extensions.mjs    # Generates all 15 extensions from config
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 Development

### Adding a new agent

1. Add an entry to the `AGENTS` array in `scripts/generate-extensions.mjs`
2. Run `node scripts/generate-extensions.mjs` to generate the standalone extension
3. Add the agent class to `src/agents/` and register it in `src/agents/factory.ts`

### Regenerating all extensions

After updating system prompts or capabilities in the generator config:

```bash
node scripts/generate-extensions.mjs
```

### Building

```bash
# Main extension
npm run compile          # one-time build
npm run watch            # watch mode

# Single agent extension
cd extensions/yodha-backend-dev
npm install && npm run compile
```

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

<div align="center">

Built with ❤️ by **Tarun**

</div>
