# Jose Luis Ponton - Personal Webpage

This is a statically exported Next.js personal webpage, designed to be easily deployable on GitHub pages and easy to maintain.

## Adding Content

All content should be modified within the `content/` folder. This eliminates the need to dive into complex code to update your webpage.

### Biography / Home Page
Update `content/about.md` with standard markdown. The page will automatically read and render this file.

### Publications
1. Export a `.csv` file from Google Docs (or create one) and replace `content/papers.csv`.
2. The columns expected are: `title`, `authors`, `venue`, `year`, `doi`, `abstract`, `pdf_url`, `code_url`.
3. To add a video or GIF preview for a paper, place it in `public/videos/`.
4. Name the video file precisely after the DOI, replacing any `/` characters with `_`. 
   * Example: For DOI `10.1145/1234.5678`, name the file `10.1145_1234.5678.mp4`.
   * The page accepts `.mp4`, `.webm`, or `.gif`.

### Academic Service
1. Provide a `.csv` file and replace `content/service.csv`.
2. Expected columns: `role`, `organization`, `year`, `description`.

## Running Locally

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`

## Deployment

To deploy statically to GitHub Pages (or any host):
1. Build the project: `npm run build`
2. The static files will be generated in the `out/` directory. Upload these files to your hosting platform.
