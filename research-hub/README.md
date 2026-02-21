# Minimalist Academic Research Hub

A lightning-fast, highly optimized Next.js personal website template for research scientists, academics, and developers. Designed to be statically exported and hosted seamlessly on GitHub Pages.

**Features:**
- 🟢 **Perfect Lighthouse Scores**: 90+ Performance & Accessibility, 100 SEO & Best Practices.
- 🚀 **Zero Layout Shift**: Leveraging `next/font` and strict image/video sizing.
- 📱 **Fully Responsive**: Beautiful across mobile and desktop.
- 🗃️ **Content-Driven**: No coding required to update your profile. Everything is powered by CSV and YAML files in the `content/` folder.

---

## 📂 Content Management Structure

All of your website's content is controlled through the `content/` directory.

### 1. Profile & Socials (`content/profile.yml`)
Stores your name, title, email, and social media links.
```yaml
name: Jose Luis Ponton
title: Research Scientist
email: example@email.com
social:
  github: https://github.com/yourusername
  linkedin: https://linkedin.com/in/yourusername
```

### 2. Biography (`content/about.md`)
Standard Markdown file. The contents of this file are rendered on your main Home page directly below your profile picture.

### 3. Publications (`content/Academic - Journal.csv` & `content/Academic - Conference.csv`)
These two CSVs drive the **Publications** page and the "Selected Publications" on the Home page.
*   **Key Columns Expected**: `Name` (Title), `Authors`, `Journal` or `Conference`, `Year`, `Month`, `Venue Tag`, `Topic Tag`.
*   **Media Matching**: 
    To add a video preview or PDF to a paper, place it in `content/videos/` or `content/pdf/`. 
    **Important:** The filename must exactly match the `Name` (Title) of the paper in the CSV.
    *   *Example*: If the title is `My Awesome Research Paper`, place `My Awesome Research Paper.mp4` in `content/videos/`.
    *   *Supported formats*: `.mp4`, `.webm`, `.gif`, and `.pdf`.

### 4. Co-Authors (`content/coauthors.yml`)
Automatically converts co-author names in your publication lists into clickable links pointing to their personal websites.
```yaml
Smith:
  firstname: ["John", "J."]
  url: "https://johnsmith.com"
```

### 5. Open Source Projects (`content/projects.yml`)
Drives the **Open Source** page. Fetches live GitHub stats (stars, forks) on load.
```yaml
- name: MotionMatching
  repo: JLPM22/MotionMatching
  description: Motion Matching implementation for Unity
  url: https://github.com/JLPM22/MotionMatching
```

### 6. Teaching (`content/Academic - Teaching.csv`)
Controls the **Teaching** page.
*   **Columns Expected**: `Name`, `Type`, `Where`, `Date`.

### 7. Service (`content/Academic - Committees and Service.csv`)
Controls the **Service** page (reviewing, program committees, editorial roles).
*   **Columns Expected**: `Role`, `Organization`, `Year`, `Description`.

---

## 💻 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

---

## 🌐 Deployment to GitHub Pages

This repository is pre-configured with a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the site to GitHub Pages whenever you push to the `main` branch.

**To enable this:**
1. Go to your repository **Settings** on GitHub.
2. On the left sidebar, click **Pages**.
3. Under the **"Build and deployment"** section, select **Source: GitHub Actions**.
4. Push your changes:
   ```bash
   git add .
   git commit -m "Update content"
   git push origin main
   ```
   
The GitHub Action will automatically run, and your site will be live at `https://yourusername.github.io` (or your custom domain) within minutes!
