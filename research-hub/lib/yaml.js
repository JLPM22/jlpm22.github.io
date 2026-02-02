import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const dataDir = path.join(process.cwd(), 'data');

export function readYamlFile(filename) {
    const filePath = path.join(dataDir, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContents);
}

export function writeYamlFile(filename, data) {
    const filePath = path.join(dataDir, filename);
    const yamlContent = yaml.dump(data, { lineWidth: -1, quotingType: '"' });
    fs.writeFileSync(filePath, yamlContent, 'utf8');
}

export function readProjectFiles() {
    const projectsDir = path.join(dataDir, 'projects');
    const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.yaml'));

    return files.map(file => {
        const content = fs.readFileSync(path.join(projectsDir, file), 'utf8');
        const data = yaml.load(content);
        return { ...data, _filename: file.replace('.yaml', '') };
    });
}

export function writeProjectFile(filename, data) {
    const filePath = path.join(dataDir, 'projects', `${filename}.yaml`);
    const yamlContent = yaml.dump(data, { lineWidth: -1, quotingType: '"' });
    fs.writeFileSync(filePath, yamlContent, 'utf8');
}

export function readNoteFiles() {
    const notesDir = path.join(dataDir, 'notes');
    const files = fs.readdirSync(notesDir).filter(f => f.endsWith('.md'));

    return files.map(file => {
        const content = fs.readFileSync(path.join(notesDir, file), 'utf8');
        const parsed = parseNoteFrontmatter(content);
        return { ...parsed, _filename: file.replace('.md', '') };
    });
}

function parseNoteFrontmatter(text) {
    const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (match) {
        const frontmatter = yaml.load(match[1]);
        const content = match[2];
        return { ...frontmatter, content };
    }
    return { title: 'Untitled', content: text };
}
