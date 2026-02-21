<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1wFWOSeWcqiopLdSkPCuhMZVNauQCQG-a

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set `GEMINI_API_KEY` in your environment (e.g. in [.env.local](.env.local) or export in shell). The key is only used by the backend server, not the frontend.
3. Start the API server (keeps the key on the server):
   ```bash
   npm run server
   ```
   By default it runs at http://localhost:3001. Use `PORT` to change (e.g. `PORT=4000 npm run server`).
4. In another terminal, start the frontend (Vite proxies `/api` to the server):
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 (or the URL Vite prints).

### Production / Deploying the API

- **Frontend (e.g. GitHub Pages):** Build with `npm run build`. The bundle does not contain the API key. If the frontend is served from a different origin than the API, set `VITE_API_BASE_URL` at build time to your API URL (e.g. `VITE_API_BASE_URL=https://your-api.example.com npm run build`).
- **Backend:** Deploy `server/index.js` to any Node host (Railway, Render, Fly.io, etc.). Set `GEMINI_API_KEY` in the host's environment. Optionally set `CORS_ORIGIN` to your frontend origin (e.g. `https://your-username.github.io`) to restrict CORS.
