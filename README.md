# FlipMargin

Modern SaaS for tracking resale inventory, investments, profit, and ROI.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Supabase (Auth, PostgreSQL, Storage)
- React Router, Lucide React, Recharts

## Setup

1. **Install dependencies**

```bash
npm install
```

2. **Create a Supabase project** at [supabase.com](https://supabase.com)

3. **Run the database schema** — open the SQL Editor and paste the contents of `supabase_setup.sql`

4. **Configure environment variables**

```bash
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Project Settings → API.

5. **Start the app**

```bash
npm run dev
```

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the project in Vercel
3. Add the same `VITE_SUPABASE_*` environment variables
4. Deploy

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
