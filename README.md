# Research Hub

A personal research productivity dashboard built with **Next.js**.

## Features

- **Public Portfolio**: Landing page with bio and publications
- **Papers Management**: Filter by type/year, view metrics (IF, quartile, ratings)
- **Task Manager**: Interactive checkboxes with file persistence
- **Notes**: Personal research notes

## Setup

```bash
cd research-hub
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

1. Set password in `.env.local`:
   ```
   AUTH_PASSWORD=your-secure-password
   ```

2. Build and run:
   ```bash
   npm run build
   npm start
   ```

## Data

All data is stored in `data/` as YAML files:
- `profile.yaml` - Your profile info
- `papers.yaml` - Publications
- `projects/*.yaml` - Projects with tasks
- `notes/*.md` - Markdown notes
