const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'content');
const publicDir = path.join(__dirname, 'public');

function copyMediaFiles(src, dest) {
    if (!fs.existsSync(src)) return;
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach((childItemName) => {
            copyMediaFiles(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        const ext = path.extname(src).toLowerCase();
        if (['.jpg', '.png', '.gif', '.mp4', '.webm', '.pdf'].includes(ext)) {
            fs.copyFileSync(src, dest);
        }
    }
}

copyMediaFiles(contentDir, publicDir);
