# Setup Guide — At Your Hand

Complete step-by-step guide for local development setup.

---

## System Requirements

- **OS**: Windows 10+, macOS 12+, or Ubuntu 20.04+
- **Node.js**: 18.0 or later ([download](https://nodejs.org))
- **Python**: 3.10 or later ([download](https://www.python.org))
- **pip**: Usually included with Python
- **Git**: For cloning the repository

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/at-your-hand.git
cd at-your-hand
```

---

## Step 2: Frontend Setup

### Install dependencies

```bash
npm install
```

### Configure environment

```bash
copy .env.example .env.local   # Windows
cp .env.example .env.local     # macOS/Linux
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Step 3: Backend Setup

### Create a virtual environment (recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Install Python dependencies

```bash
pip install -r requirements.txt
```

> **Note:** PyMuPDF (fitz) may take a moment to install. If you encounter issues on Windows, ensure you have Visual C++ Build Tools installed.

---

## Step 4: Configure AI (Optional)

If you want AI content generation:

1. Get an API key:
   - **OpenAI**: https://platform.openai.com/api-keys
   - **Anthropic**: https://console.anthropic.com

2. Add to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   AI_PROVIDER=openai
   AI_MODEL=gpt-4o-mini
   ```

The app works fully without AI. AI buttons will show "unavailable" when no key is set.

---

## Step 5: Run the Application

You need **two terminal windows** — one for backend, one for frontend.

### Terminal 1: Start the backend

```bash
# Make sure your virtual environment is activated
python -m uvicorn backend.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Started reloader process
```

### Terminal 2: Start the frontend

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

### Open the app

Go to **http://localhost:3000**

---

## Step 6: Verify Installation

1. Open http://localhost:3000 — landing page should appear
2. Open http://localhost:8000/docs — FastAPI docs should appear
3. Click "Upload Template" → drag and drop a PDF resume template
4. Verify that sections are detected and questions appear

---

## Troubleshooting

### `ModuleNotFoundError: No module named 'fitz'`
PyMuPDF not installed correctly. Try:
```bash
pip uninstall PyMuPDF
pip install PyMuPDF==1.24.5
```

### `CORS error` in browser console
Make sure the backend is running on port 8000 and `NEXT_PUBLIC_API_URL=http://localhost:8000` is set in `.env.local`.

### PDF preview not showing
pdfjs-dist requires certain browser security headers. The `next.config.js` includes these headers. If you're using a custom server, add:
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

### Port conflicts
Change backend port: `uvicorn backend.main:app --port 8001`
Then update `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8001`

---

## Building for Production

```bash
# Frontend
npm run build
npm run start

# Backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

---

## Development Tips

- The frontend auto-reloads on file changes (`npm run dev`)
- The backend auto-reloads on Python file changes (`--reload` flag)
- Template state persists in `localStorage` between refreshes
- Use the FastAPI interactive docs at http://localhost:8000/docs to test API endpoints directly
