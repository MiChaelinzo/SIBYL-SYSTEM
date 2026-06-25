# Project Title

**SIBYL SYSTEM – Ministry of Welfare Public Safety Bureau**

---

# Overview

**SIBYL SYSTEM** is a modular multi‑agent platform designed to assist welfare and public safety workflows. It combines continuous monitoring, autonomous triage, persistent memory, human‑in‑the‑loop checkpoints, and explainability to help agencies act faster, more fairly, and more transparently.

---

# Project Structure

```
Project Directory
├── README.md
├── components.json
├── index.html
├── package.json
├── postcss.config.js
├── public
│   ├── favicon.png
│   └── images
├── src
│   ├── App.tsx
│   ├── components
│   ├── context
│   ├── db
│   ├── hooks
│   ├── index.css
│   ├── layout
│   ├── lib
│   ├── main.tsx
│   ├── routes.tsx
│   ├── pages
│   ├── services
│   └── types
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

# Tech Stack

**Vite, TypeScript, React, Supabase, Qwen Cloud, Alibaba Cloud, Node.js, Python, FastAPI, Express, Docker, Kubernetes, Terraform, GitHub Actions, PostgreSQL, MongoDB, Redis, Pinecone, FAISS, Milvus, RabbitMQ, Kafka, gRPC, REST, WebSockets, OAuth2, JWT, Nginx, Prometheus, Grafana, Sentry, OpenTelemetry, LangChain, Hugging Face Transformers, PyTorch, TensorFlow, SQLAlchemy, Prisma, Tailwind CSS, Material UI, Figma, WebRTC, MQTT, Raspberry Pi (Edge), Edge TPU, OpenAPI/Swagger, JSON, YAML, Webhooks, Git**

(Use the subset relevant to your deployment; this list is comprehensive for the project.)

---

# Development Guidelines

## Environment Requirements

- **Node.js ≥ 20**  
- **npm ≥ 10**

Example verification:
```
node -v   # e.g., v20.18.3
npm -v    # e.g., 10.8.2
```

### Installing Node.js

**Windows**
1. Visit [https://nodejs.org/](https://nodejs.org/) and download the recommended installer.  
2. Run the installer and follow the prompts.  
3. Verify with `node -v` and `npm -v`.

**macOS**
1. Recommended: `brew install node` (requires Homebrew).  
2. Or download the macOS .pkg from [https://nodejs.org/](https://nodejs.org/).  
3. Verify with `node -v` and `npm -v`.

---

# Getting Started (Frontend)

1. **Clone the repo**
   ```
   git clone <repo-url>
   cd SIBYL-SYSTEM
   ```
2. **Install dependencies**
   ```
   npm i
   ```
3. **Start dev server**
   ```
   npm run dev -- --host 127.0.0.1
   ```
   If that fails:
   ```
   npx vite --host 127.0.0.1
   ```

---

# Backend Development

1. **Environment variables**
   - Create a `.env` file from `.env.example` (if present).
   - Typical variables:
     - `DATABASE_URL`
     - `SUPABASE_URL`
     - `SUPABASE_KEY`
     - `QWEN_API_KEY`
     - `ALIBABA_CLOUD_*`
     - `REDIS_URL`
2. **Install dependencies**
   ```
   cd backend
   npm i
   ```
   or for Python services:
   ```
   pip install -r requirements.txt
   ```
3. **Run locally**
   - Node/TypeScript:
     ```
     npm run dev
     ```
   - Python (FastAPI):
     ```
     uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
     ```

**Note:** For database work use the official Supabase instance as recommended.

---

# Architecture & Key Concepts

- **Microservices**: Agents and services are separated into focused microservices (ingest, triage, policy, outreach).  
- **Memory layer**: Hybrid approach — vector embeddings for semantic recall and relational DB for structured metadata. Approximate retrieval improves performance; naive retrieval is \(O(n)\) while indexed retrieval is approximately \(O(\log n)\).
\[
\text{Naive retrieval: } O(n) \quad\text{Indexed retrieval: } O(\log n)
\]
- **Agent coordination**: Agents communicate via a message bus (RabbitMQ/Kafka) and follow explicit arbitration rules to avoid conflicts.  
- **Safety & audit**: Every agent action is logged with a human‑readable rationale and tamper‑evident hash.

---

# Scripts

| **Script** | **Purpose** |
|---|---|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build production frontend |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |

---

# Deployment

- **Cloud**: Backend services run on Alibaba Cloud for the hackathon submission; use Qwen Cloud for model inference.  
- **Containerization**: Docker images for each service; orchestrate with Kubernetes.  
- **CI/CD**: GitHub Actions pipelines for build, test, and deploy.  
- **Monitoring**: Prometheus + Grafana for metrics; Sentry for error tracking; OpenTelemetry for tracing.

---

# Security & Privacy

- **Data minimization**: store only what is necessary; implement retention and selective forgetting policies.  
- **Access control**: OAuth2 / JWT for service authentication; role‑based access for human reviewers.  
- **Auditability**: tamper‑evident logs for all agent decisions and human overrides.  
- **Edge privacy**: local processing on Edge devices (Raspberry Pi / Edge TPU) with secure sync to cloud.

---

# Contributing

- Fork the repo, create a feature branch, open a pull request with a clear description and tests where applicable.  
- Follow the existing code style and add documentation for new modules.  
- Label PRs with the relevant area (frontend, backend, infra, docs).

---

# License

Include an open source license file in the repository root (e.g., **MIT**, **Apache‑2.0**). Make sure the license is visible in the repo About section.

---

# Contact

- **Project lead:** Michael  
- **Repo:** `https://github.com/MiChaelinzo/SIBYL-SYSTEM` (replace with actual repo URL)  
- **Demo:** `https://app-c7vje3odisxt.appmedo.com` (project demo link)

---
