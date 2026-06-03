# At Your Hand — Template-Preserving Resume Builder

> **TEMPLATE IN = TEMPLATE OUT**

Upload any PDF or DOCX resume template. Answer targeted questions. Get back the *exact same template* — pixel-perfect, with your content filled in. No redesign. No layout changes. Your template is sacred.

**Live Demo:** [https://resume-kohl-chi-77.vercel.app/](https://resume-kohl-chi-77.vercel.app/)

---

## ✨ Features

- **Upload PDF or DOCX** resume templates
- **Template Intelligence Engine** — reads written instructions (`"3–4 lines"`, `"5 bullet points"`) and enforces them
- **Dynamic Question Generator** — questions derived from YOUR template's actual sections
- **AI Content Assist** — Generate, Improve, Shorten, Professional Tone (optional)
- **Live Preview** — real-time PDF preview as you answer questions
- **Strict Template Mode** — locks layout, fonts, colors (default ON)
- **Pixel-perfect PDF output** — visually identical to your uploaded template
- **PDF & DOCX export**
- **Fully local-first** — no login, no database, no tracking
- **Open source** (MIT)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- npm or yarn

### 1. Clone the repo

```bash
git clone https://github.com/your-username/at-your-hand.git
cd at-your-hand
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local to add your AI API key (optional)
```

### 5. Start the backend

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

### 6. Start the frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend | FastAPI, Python |
| PDF Processing | PyMuPDF (fitz) |
| DOCX Processing | python-docx |
| State | Zustand + localStorage |
| AI (optional) | OpenAI / Anthropic |

---

## 📁 Project Structure

```
/app
  /components
    /landing       # Hero, Navbar, FeatureCards
    /upload        # UploadZone
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

## 📋 How the Template Engine Works

1. **Parse**: Upload PDF/DOCX → extract sections, headings, fonts, bounding boxes
2. **Detect Instructions**: Find text like `"3–4 lines"` → create constraints
3. **Generate Questions**: Map sections to targeted question sets
4. **Validate Answers**: Real-time constraint checking in the UI
5. **Generate Output**: Fill original template with answers at exact positions
6. **Export**: Download pixel-perfect PDF or DOCX

---

## 📄 License

MIT License — see [LICENSE](./LICENSE)
