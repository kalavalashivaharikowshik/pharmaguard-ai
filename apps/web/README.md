# PharmaGuard AI — Web dashboard

React 19 + Vite + Tailwind CSS 4. Pages live in `src/pages`, API clients in `src/services`.

```bash
npm run dev     # http://localhost:5173 (API at http://localhost:3000 by default)
npm run build   # production build in dist/
```

Set `VITE_API_URL` to point at another API (see `.env.example`). Deployed on Vercel with `vercel.json` (SPA rewrites).

Theme: Deep Blue `#0F4C81`, Medical Green `#2E8B57`, 12px cards, light / dark / system mode (toggle in the header or Settings).
