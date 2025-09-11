
# AI Marketer MVP Blueprint

## 1. High-Level Architecture
1. **Frontend (chat UI)**
   - Next.js, Streamlit, or Gradio
   - Deploy on Vercel or Streamlit Cloud

2. **API / Orchestrator**
   - FastAPI (Python) or Express (Node.js)
   - Responsibilities:
     - Forward chat messages to LLM
     - Parse action requests (post, scrape, fill form)
     - Enqueue automation tasks

3. **LLM Layer**
   - Start with **hosted LLM** (OpenAI GPT-4o-mini, Anthropic Claude Haiku) for speed
   - Later migrate to **SLM** (Llama 3, Mistral, Phi-3) hosted on RunPod for cost savings

4. **Task Runner / Automation**
   - **Playwright (Python)** for web driver automation
   - Asynchronous task queue (Celery or RQ + Redis)

5. **Storage**
   - Postgres for logs, conversation memory, and metadata
   - Credentials in Vault / Railway Secrets Manager

6. **Integrations**
   - Zapier or n8n for quick CRM / Email / Ads integration

7. **Hosting**
   - Backend + Workers → Railway, Fly.io, or Render
   - Frontend → Vercel
   - Future: Self-host SLM on RunPod (GPU rental)

---

## 2. Model Choice (SLM vs Hosted LLM)

| Option      | Pros | Cons | Best For |
|-------------|------|------|----------|
| **SLM** (self-host) | Cheap at scale, full control | Needs GPU hosting, more ops overhead | Long-term savings |
| **Hosted LLM** | No infra, scalable, high quality | Pay-per-use, may cost more at high scale | Fast launch |

**Recommendation:**  
- MVP → Hosted LLM (GPT-4o-mini or Claude Haiku)  
- Later → Swap to hosted SLM on RunPod  

---

## 3. MVP Stack

- **Frontend:** Next.js (or Streamlit for speed)
- **Backend:** FastAPI (Python)
- **LLM Client:** OpenAI / Anthropic SDK
- **Orchestration:** LangChain (optional)
- **Automation:** Playwright (Python)
- **Queue:** Redis + RQ or Celery
- **Hosting:** Railway (backend/workers), Vercel (frontend)
- **Database:** Postgres (managed add-on)

---

## 4. Example Code

### A. FastAPI Chat Endpoint
```python
from fastapi import FastAPI
from redis import Redis
from rq import Queue
import requests, os, json
from tasks import run_playwright_action

app = FastAPI()
redis_conn = Redis.from_url(os.getenv("REDIS_URL"))
q = Queue(connection=redis_conn)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def call_llm(prompt: str):
    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
    payload = {
      "model": "gpt-4o-mini",
      "messages": [{"role":"user","content": prompt}],
      "max_tokens": 800
    }
    return requests.post(url, headers=headers, json=payload).json()

@app.post("/chat")
async def chat(payload: dict):
    user_message = payload["message"]
    system = """You must return JSON: { "reply": "...", "action": null | { "type": "...", "params": {...}} }"""
    prompt = f"{system}\n\nUser: {user_message}"
    resp = call_llm(prompt)["choices"][0]["message"]["content"]
    try:
        obj = json.loads(resp)
    except:
        return {"reply": resp, "action_job": None}
    if obj.get("action"):
        job = q.enqueue(run_playwright_action, obj["action"])
        return {"reply": obj["reply"], "action_job": job.get_id()}
    return {"reply": obj["reply"], "action_job": None}
````

### B. Playwright Worker

```python
from playwright.sync_api import sync_playwright

def run_playwright_action(action_spec: dict):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        if action_spec["type"] == "post_twitter":
            params = action_spec["params"]
            page.goto("https://twitter.com/login")
            page.fill('input[name="session[username_or_email]"]', params["username"])
            page.fill('input[name="session[password]"]', params["password"])
            page.click('div[data-testid="LoginForm_Login_Button"]')
            page.goto("https://twitter.com/intent/tweet")
            page.fill('div[aria-label="Tweet text"]', params["text"])
            page.click('div[data-testid="tweetButtonInline"]')
        elif action_spec["type"] == "simple_scrape":
            page.goto(action_spec["params"]["url"])
            return page.content()
        browser.close()
    return {"status":"ok"}
```

---

## 5. Prompt Contract

```
SYSTEM:
Always return valid JSON:
{ "reply": "<response to user>", "action": null | { "type": "<action>", "params": {...} } }
Allowed action types: ["post_social", "scrape_url", "fill_form"].
```

---

## 6. Security & Safety

* Explicit **user confirmation** before executing any automation
* Secrets in encrypted storage (Vault / Railway Secrets Manager)
* Rate-limits & retries for Playwright tasks
* Sandbox workers with minimal permissions
* Audit log for all actions

---

## 7. Scaling Plan

* **Phase 0:** Hosted LLM + single worker (Railway free tier + Vercel)
* **Phase 1:** Autoscale workers, add Celery + Redis for concurrency
* **Phase 2:** Migrate to SLM on RunPod, batch inference, cost optimize

---

## 8. Cost Estimates

* **Hosted LLM (GPT-4o-mini)**: \~\$0.15 per 1M input / \$0.60 per 1M output tokens
* **Claude Haiku**: competitive per-token rates
* **Hosting (Railway, Vercel, Render)**: \$5–\$30/month starting
* **GPU Hosting (RunPod, RTX 4090)**: \~\$0.34/hr and up

---

## 9. Build Checklist

**Day 1**

* Scaffold frontend + backend
* Add LLM integration

**Day 2**

* Add JSON action contract
* Build Playwright worker + Redis queue

**Day 3**

* Add consent flow
* Secure secrets
* Deploy on Railway + Vercel

---

## 10. Next Steps After MVP

* Add **LangChain Agents** for memory & tool-use
* Add **vector database (Pinecone/Weaviate)** for brand knowledge
* Fine-tune / RAG for client-specific marketing copy
* Human approval workflows for compliance

```

---

Do you want me to also generate a **starter GitHub repo skeleton** (FastAPI + Redis + Playwright + Next.js) in code form so you can deploy straight to Railway/Vercel, or just keep it as this written blueprint?
```
