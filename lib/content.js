import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import matter from 'gray-matter';
import { marked } from 'marked';
import yaml from 'js-yaml';

const contentDirectory = path.join(process.cwd(), 'content');

export function getAboutContent() {
    const fullPath = path.join(contentDirectory, 'about.md');
    try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        const htmlContent = marked(content);
        return { data, htmlContent };
    } catch (e) {
        return { data: {}, htmlContent: '<div>Content not found.</div>' };
    }
}

const cleanForMatch = (str) => {
    if (!str) return '';
    return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
};

export function getCoauthors() {
    const fullPath = path.join(contentDirectory, 'coauthors.yml');
    if (!fs.existsSync(fullPath)) return {};
    try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        return yaml.load(fileContents) || {};
    } catch (e) {
        return {};
    }
}

export function getProfile() {
    const fullPath = path.join(contentDirectory, 'profile.yml');
    if (!fs.existsSync(fullPath)) return { name: 'Your Name', title: 'Your Title', email: '', social: {} };
    try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        return yaml.load(fileContents) || {};
    } catch (e) {
        return { name: 'Your Name', title: 'Your Title', email: '', social: {} };
    }
}

export function getProjects() {
    const fullPath = path.join(contentDirectory, 'projects.yml');
    if (!fs.existsSync(fullPath)) return [];
    try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        return yaml.load(fileContents) || [];
    } catch (e) {
        return [];
    }
}

export function getPapers() {
    let papers = [];

    const parseFile = (fileName, isJournal) => {
        const fullPath = path.join(contentDirectory, fileName);
        if (!fs.existsSync(fullPath)) return;
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const parsed = Papa.parse(fileContents, { header: true, skipEmptyLines: true });

        parsed.data.forEach(row => {
            const topicTagRaw = (row['Topic Tag'] || '').trim();

            papers.push({
                title: row.Name,
                authors: row.Authors,
                venue: isJournal ? row.Journal : row.Conference,
                publisher: row.Editorial || '',
                journalConference: isJournal ? (row.Conference || '') : '',
                venueTag: (row['Venue Tag'] || '').trim(),
                topicTags: topicTagRaw ? topicTagRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
                year: parseInt(row.Year) || 9999,
                month: (row.Month || '').trim(),
                doi: row.DOI,
                video_ext_url: (row.Video || '').trim(),
                code_url: (row.Code || '').trim(),
                website_url: (row.Website || '').trim(),
                bibtex: (row.BibTeX || '').trim(),
                type: isJournal ? 'Journal' : 'Conference',
                metrics: {
                    jcrQuartile: (row['Quartile JCR'] || '').trim(),
                    jcrIf: (row['Impact Factor JCR'] || '').trim(),
                    jcrRank: (row['Ranking JCR'] || '').trim(),
                    sjrQuartile: (row['Quartile SJR'] || '').trim(),
                    sjrIf: (row['Impact Factor SJR'] || '').trim(),
                    ggsRating: (row['GGS Rating'] || '').trim(),
                    coreRating: (row['CORE'] || '').trim(),
                }
            });
        });
    };

    parseFile('Academic - Journal.csv', true);
    parseFile('Academic - Conference.csv', false);

    // Month name to number for sorting
    const monthOrder = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };
    const getMonthNum = (m) => monthOrder[(m || '').toLowerCase()] || 0;

    // Sort by year descending, then month descending
    papers.sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return getMonthNum(b.month) - getMonthNum(a.month);
    });

    // Find media files
    let videos = [];
    let pdfs = [];
    try { videos = fs.readdirSync(path.join(contentDirectory, 'videos')); } catch (e) { }
    try { pdfs = fs.readdirSync(path.join(contentDirectory, 'pdf')); } catch (e) { }

    papers.forEach(paper => {
        const cleanTitle = cleanForMatch(paper.title);

        // Find matching video
        const videoFile = videos.find(v => cleanForMatch(path.basename(v, path.extname(v))) === cleanTitle);
        if (videoFile) paper.video_url = `/videos/${videoFile}`;

        // Find matching pdf
        const pdfFile = pdfs.find(p => cleanForMatch(path.basename(p, path.extname(p))) === cleanTitle);
        if (pdfFile) paper.pdf_url = `/pdf/${pdfFile}`;
    });

    return papers;
}

export function getVenueColors() {
    const fullPath = path.join(contentDirectory, 'venue_colors.txt');
    const colors = {};
    if (!fs.existsSync(fullPath)) return colors;
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    fileContents.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.includes('=')) return;
        const eqIdx = trimmed.indexOf('=');
        const tag = trimmed.substring(0, eqIdx).trim();
        const color = trimmed.substring(eqIdx + 1).trim();
        if (tag && color) colors[tag] = color;
    });
    return colors;
}

export function getService() {
    let serviceItems = [];

    const parseFile = (fileName, mapFunc) => {
        const fullPath = path.join(contentDirectory, fileName);
        if (!fs.existsSync(fullPath)) return;
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const parsed = Papa.parse(fileContents, { header: true, skipEmptyLines: true });
        parsed.data.forEach(row => {
            serviceItems.push(mapFunc(row));
        });
    }

    parseFile('Academic - Roles.csv', row => {
        const yearMatch = row['Start Date'] ? row['Start Date'].match(/\d{4}/) : null;
        return {
            role: row.Role,
            organization: `${row.Name} ${row.Acronym ? `(${row.Acronym})` : ''}`,
            year: yearMatch ? yearMatch[0] : '',
            description: row.Location
        };
    });

    parseFile('Academic - Reviews Public.csv', row => ({
        role: 'Reviewer',
        organization: row['Conference/Journal'],
        year: row.Year,
        description: row.Observations
    }));

    // Sort by year descending
    serviceItems.sort((a, b) => {
        const yA = parseInt(a.year) || 0;
        const yB = parseInt(b.year) || 0;
        return yB - yA;
    });

    return serviceItems;
}

export function getTeaching() {
    const fullPath = path.join(contentDirectory, 'Academic - Teaching.csv');
    if (!fs.existsSync(fullPath)) return [];
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const parsed = Papa.parse(fileContents, { header: true, skipEmptyLines: true });

    return parsed.data.map(row => ({
        name: row.Name || '',
        type: row.Type || '',
        realName: row['Real Name'] || '',
        where: row.Where || '',
        hours: row.Hours || '',
        date: row.Date || '',
        description: row.Description || '',
    }));
}

export function getSelectedPapers() {
    const fullPath = path.join(contentDirectory, 'selected_papers.txt');
    if (!fs.existsSync(fullPath)) return [];

    // Read list of selected paper titles
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const selectedTitles = fileContents.split('\n').map(l => cleanForMatch(l)).filter(l => l.length > 0);

    const allPapers = getPapers();
    return allPapers.filter(paper => {
        const cleanTitle = cleanForMatch(paper.title);
        return selectedTitles.some(sel => cleanTitle.includes(sel));
    });
}
