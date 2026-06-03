# At Your Hand — Structure-Preserving Resume Builder

> **ANSWER QUESTIONS = GET A PERFECT RESUME**

Answer targeted questions based on standard professional resume layouts. Watch your resume render in real time on a beautifully structured template. Download as a standalone HTML file or print/save as a clean vector PDF instantly.

**Live Demo:** [https://resume-kohl-chi-77.vercel.app/](https://resume-kohl-chi-77.vercel.app/)

---

## ✨ Features

- **Guided Questions** — Fill in your details step-by-step across 8 comprehensive sections designed for maximum visual alignment.
- **Smart Repeaters** — Dynamically add and manage repeatable blocks for Professional Experience, Projects, Education, and Awards.
- **Live Preview** — Watch your resume render in real time on a beautifully structured, standard Calibri/Arial template card.
- **Print Directly to PDF** — Instantly print or save your resume as a clean, high-resolution vector PDF using standard browser print options.
- **Export Standalone HTML** — Download a single, fully responsive HTML file with nested styles to host online or run locally.
- **AI Content Assist (Optional)** — Generate, Improve, Shorten, or set a Professional Tone.
- **100% Offline & Private** — No database, no accounts, and no data tracking. Your resume details stay locally in your browser storage.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- npm or yarn

### 1. Clone the repo

```bash
git clone https://github.com/Saisidd05/Resume.git
cd Resume
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies (Optional, required for AI features)

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local to add your AI API key (optional)
```

### 5. Start the backend (Optional, required for AI features)

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

### 6. Start the frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port specified by Next.js) to use the app.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| State | Zustand + localStorage |
| AI (optional) | FastAPI, Python, OpenAI / Anthropic |

---

## 📁 Project Structure

```
/app
  /components
    /landing       # Hero, Navbar, FeatureCards
    /questions     # QuestionFlow, QuestionCard, AnswerToolbar
    /preview       # LivePreview, TemplateRenderer
    /export        # ExportPanel
    /ui            # StrictModeToggle
  /store           # Zustand stores (templateStore, builderStore)
  /hooks           # useTemplateParser, useAI
  /template-engine # Client-side constraint parser/validator
  /export          # Export handler
  /styles          # Global CSS
  /builder         # Builder page route
/backend
  /parsers         # pdf_parser.py, docx_parser.py
  /engines         # template_engine.py, question_engine.py, generator.py
  /routers         # parse.py, generate.py, ai.py
  /models          # schemas.py (Pydantic models)
  main.py          # FastAPI entry point
```

---

## 🤖 AI Features (Optional)

AI features are completely optional. The app works fully without an API key.

To enable AI:
1. Get an API key from [OpenAI](https://platform.openai.com) or [Anthropic](https://www.anthropic.com)
2. Add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-...
   # or
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Restart the backend

---

## 📋 How It Works

1. **Answer Questions**: Fill in 8 comprehensive sections with optional repeatable blocks.
2. **Live Preview**: Watch your layout and contents update in real time as you type.
3. **Print & Export**: Print/save directly as a clean PDF or download the standalone responsive HTML file.

---

## 📄 License

MIT License — see [LICENSE](./LICENSE)
