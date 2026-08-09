'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import NewPublicationBadge from '@/components/NewPublicationBadge';

const WIDTH = 900;
const HEIGHT = 540;
const DEFAULT_VENUE_COLOR = '#94a3b8';

const hash = (value) => Math.abs([...value].reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0));

const shortAuthors = (authors = '') => {
  const names = authors.split(',').map(name => name.trim());
  return names.length > 3 ? `${names.slice(0, 3).join(', ')}, et al.` : authors;
};

function buildTopicOrder(papers) {
  const counts = {};
  const cooccurrence = {};
  papers.forEach(paper => {
    paper.topicTags.forEach(topic => { counts[topic] = (counts[topic] || 0) + 1; });
    paper.topicTags.forEach(a => paper.topicTags.forEach(b => {
      if (a !== b) cooccurrence[`${a}\u0000${b}`] = (cooccurrence[`${a}\u0000${b}`] || 0) + 1;
    }));
  });

  const remaining = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
  if (!remaining.length) return [];
  const ordered = [remaining.shift()];
  while (remaining.length) {
    const previous = ordered[ordered.length - 1];
    let bestIndex = 0;
    let bestScore = -1;
    remaining.forEach((candidate, index) => {
      const neighborScore = (cooccurrence[`${previous}\u0000${candidate}`] || 0) * 4;
      const globalScore = ordered.reduce((sum, topic) => sum + (cooccurrence[`${topic}\u0000${candidate}`] || 0), 0);
      const score = neighborScore + globalScore + counts[candidate] * 0.01;
      if (score > bestScore) { bestScore = score; bestIndex = index; }
    });
    ordered.push(remaining.splice(bestIndex, 1)[0]);
  }
  return ordered;
}

function buildLayout(papers) {
  const topics = buildTopicOrder(papers);
  const edges = [];
  papers.forEach((paper, i) => papers.slice(i + 1).forEach((other, offset) => {
    const shared = paper.topicTags.filter(topic => other.topicTags.includes(topic));
    if (shared.length) {
      const union = new Set([...paper.topicTags, ...other.topicTags]).size || 1;
      edges.push({ source: i, target: i + offset + 1, strength: shared.length, similarity: shared.length / union, topics: shared });
    }
  }));

  // A deterministic paper embedding driven by weighted topic similarity.
  const nodes = papers.map((paper, index) => {
    const angle = index * 2.399963 + (hash(paper.title) % 31) * 0.01;
    const radius = 32 * Math.sqrt(index + 1);
    return { index, x: WIDTH / 2 + Math.cos(angle) * radius, y: HEIGHT / 2 + Math.sin(angle) * radius * 0.68, vx: 0, vy: 0 };
  });

  for (let iteration = 0; iteration < 360; iteration++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const distance = Math.max(Math.hypot(dx, dy), 1);
        const repel = 1350 / (distance * distance);
        nodes[i].vx -= (dx / distance) * repel;
        nodes[i].vy -= (dy / distance) * repel;
        nodes[j].vx += (dx / distance) * repel;
        nodes[j].vy += (dy / distance) * repel;
      }
    }
    edges.forEach(edge => {
      const a = nodes[edge.source]; const b = nodes[edge.target];
      const dx = b.x - a.x; const dy = b.y - a.y;
      const distance = Math.max(Math.hypot(dx, dy), 1);
      const desired = 54 + (1 - edge.similarity) * 105;
      const pull = (distance - desired) * 0.006 * (0.4 + edge.similarity);
      a.vx += (dx / distance) * pull; a.vy += (dy / distance) * pull;
      b.vx -= (dx / distance) * pull; b.vy -= (dy / distance) * pull;
    });
    nodes.forEach(node => {
      node.vx += (WIDTH / 2 - node.x) * 0.00035;
      node.vy += (HEIGHT / 2 - node.y) * 0.00035;
      node.vx *= 0.84; node.vy *= 0.84;
      node.x += node.vx; node.y += node.vy;
    });
  }

  const xs = nodes.map(node => node.x); const ys = nodes.map(node => node.y);
  const minX = Math.min(...xs); const maxX = Math.max(...xs);
  const minY = Math.min(...ys); const maxY = Math.max(...ys);
  nodes.forEach(node => {
    node.x = 95 + ((node.x - minX) / Math.max(maxX - minX, 1)) * 710;
    node.y = 75 + ((node.y - minY) / Math.max(maxY - minY, 1)) * 390;
  });

  // Topic labels are derived from their papers rather than assigned arbitrary positions.
  const anchors = topics.map(topic => {
    const members = nodes.filter(node => papers[node.index].topicTags.includes(topic));
    return {
      topic,
      labelX: members.reduce((sum, node) => sum + node.x, 0) / Math.max(members.length, 1),
      labelY: members.reduce((sum, node) => sum + node.y, 0) / Math.max(members.length, 1) - 24,
    };
  });
  for (let iteration = 0; iteration < 80; iteration++) {
    for (let i = 0; i < anchors.length; i++) for (let j = i + 1; j < anchors.length; j++) {
      const a = anchors[i]; const b = anchors[j];
      const requiredX = Math.min(110, 24 + (a.topic.length + b.topic.length) * 2.4);
      const dx = b.labelX - a.labelX; const dy = b.labelY - a.labelY;
      if (Math.abs(dx) < requiredX && Math.abs(dy) < 22) {
        const direction = dx >= 0 ? 1 : -1;
        const push = (requiredX - Math.abs(dx)) * 0.18;
        a.labelX -= direction * push; b.labelX += direction * push;
        a.labelY -= 0.35; b.labelY += 0.35;
      }
    }
    anchors.forEach(anchor => {
      anchor.labelX = Math.max(65, Math.min(WIDTH - 65, anchor.labelX));
      anchor.labelY = Math.max(34, Math.min(HEIGHT - 20, anchor.labelY));
    });
  }

  // Multi-topic papers should read as bridges. Move them toward the centre of
  // their (already separated) topic labels, then gently resolve node overlaps.
  const anchorByTopic = new Map(anchors.map(anchor => [anchor.topic, anchor]));
  nodes.forEach(node => {
    const paperTopics = papers[node.index].topicTags;
    if (paperTopics.length < 2) return;
    const paperAnchors = paperTopics.map(topic => anchorByTopic.get(topic)).filter(Boolean);
    const targetX = paperAnchors.reduce((sum, anchor) => sum + anchor.labelX, 0) / paperAnchors.length;
    const targetY = paperAnchors.reduce((sum, anchor) => sum + anchor.labelY, 0) / paperAnchors.length;
    node.x = node.x * 0.12 + targetX * 0.88;
    node.y = node.y * 0.12 + targetY * 0.88;
  });
  for (let iteration = 0; iteration < 40; iteration++) {
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]; const b = nodes[j];
      const dx = b.x - a.x; const dy = b.y - a.y;
      const distance = Math.max(Math.hypot(dx, dy), 0.1);
      if (distance < 25) {
        const push = (25 - distance) * 0.12;
        a.x -= (dx / distance) * push; a.y -= (dy / distance) * push;
        b.x += (dx / distance) * push; b.y += (dy / distance) * push;
      }
    }
  }
  nodes.forEach(node => {
    node.x = Math.max(36, Math.min(WIDTH - 36, node.x));
    node.y = Math.max(42, Math.min(HEIGHT - 42, node.y));
  });

  return { topics, anchors, nodes, edges };
}

export default function PublicationTopicMap({ papers, activePapers = papers, venueColors = {} }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [viewport, setViewport] = useState({ scale: 1, x: 0, y: 0 });
  const closeTimer = useRef(null);
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const pointerPoints = useRef(new Map());
  const pinchRef = useRef(null);
  const layout = useMemo(() => buildLayout(papers), [papers]);
  const activePaper = activeIndex == null ? null : papers[activeIndex];
  const activeTitles = useMemo(() => new Set(activePapers.map(paper => paper.title)), [activePapers]);
  const venues = [...new Set(papers.map(paper => paper.venueTag || paper.displayVenue || paper.venue || 'Other'))];
  const activeNode = activeIndex == null ? null : layout.nodes[activeIndex];
  const displayedNode = activeNode ? { x: viewport.x + activeNode.x * viewport.scale, y: viewport.y + activeNode.y * viewport.scale } : null;
  // Elements grow with zoom, but more slowly than the distances between them.
  const detailScale = Math.pow(viewport.scale, -0.65);
  const cancelClose = () => { if (closeTimer.current) clearTimeout(closeTimer.current); closeTimer.current = null; };
  const closePreview = () => { cancelClose(); setActiveIndex(null); };
  const scheduleClose = () => { cancelClose(); closeTimer.current = setTimeout(() => setActiveIndex(null), 140); };

  useEffect(() => {
    setActiveIndex(null);
    setActiveTopic(null);
  }, [activePapers]);

  useEffect(() => () => cancelClose(), []);

  const clientToSvg = (clientX, clientY) => {
    if (!svgRef.current) return { x: WIDTH / 2, y: HEIGHT / 2 };
    const point = svgRef.current.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const local = point.matrixTransform(svgRef.current.getScreenCTM().inverse());
    return { x: local.x, y: local.y };
  };
  const zoomTo = (nextScale, anchor = { x: WIDTH / 2, y: HEIGHT / 2 }) => {
    setViewport(current => {
      const scale = Math.max(0.75, Math.min(3.2, nextScale));
      const worldX = (anchor.x - current.x) / current.scale;
      const worldY = (anchor.y - current.y) / current.scale;
      return {
        scale,
        x: anchor.x - worldX * scale,
        y: anchor.y - worldY * scale,
      };
    });
  };
  const resetViewport = () => setViewport({ scale: 1, x: 0, y: 0 });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const handleWheel = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const anchor = clientToSvg(event.clientX, event.clientY);
      setViewport(current => {
        const scale = Math.max(0.75, Math.min(3.2, current.scale * (event.deltaY < 0 ? 1.12 : 0.89)));
        const worldX = (anchor.x - current.x) / current.scale;
        const worldY = (anchor.y - current.y) / current.scale;
        return { scale, x: anchor.x - worldX * scale, y: anchor.y - worldY * scale };
      });
    };
    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, []);

  const startPan = (event) => {
    if (event.button !== 0 || event.target.closest('[data-paper-node], [data-topic-label]')) return;
    pointerPoints.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    if (pointerPoints.current.size === 2) {
      const [a, b] = [...pointerPoints.current.values()];
      const anchor = clientToSvg((a.x + b.x) / 2, (a.y + b.y) / 2);
      pinchRef.current = {
        distance: Math.max(Math.hypot(b.x - a.x, b.y - a.y), 1),
        viewport,
        worldX: (anchor.x - viewport.x) / viewport.scale,
        worldY: (anchor.y - viewport.y) / viewport.scale,
      };
      dragRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pan = (event) => {
    if (pointerPoints.current.has(event.pointerId)) pointerPoints.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointerPoints.current.size >= 2 && pinchRef.current) {
      const [a, b] = [...pointerPoints.current.values()];
      const distance = Math.max(Math.hypot(b.x - a.x, b.y - a.y), 1);
      const start = pinchRef.current.viewport;
      const scale = Math.max(0.75, Math.min(3.2, start.scale * distance / pinchRef.current.distance));
      const anchor = clientToSvg((a.x + b.x) / 2, (a.y + b.y) / 2);
      setViewport({
        scale,
        x: anchor.x - pinchRef.current.worldX * scale,
        y: anchor.y - pinchRef.current.worldY * scale,
      });
      return;
    }
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !svgRef.current) return;
    const bounds = svgRef.current.getBoundingClientRect();
    const dx = (event.clientX - drag.x) * WIDTH / bounds.width;
    const dy = (event.clientY - drag.y) * HEIGHT / bounds.height;
    dragRef.current = { ...drag, x: event.clientX, y: event.clientY };
    setViewport(current => ({ ...current, x: current.x + dx, y: current.y + dy }));
  };
  const stopPan = (event) => {
    pointerPoints.current.delete(event.pointerId);
    pinchRef.current = null;
    if (pointerPoints.current.size === 1) {
      const [pointerId, point] = [...pointerPoints.current.entries()][0];
      dragRef.current = { pointerId, ...point };
    } else if (dragRef.current?.pointerId === event.pointerId || pointerPoints.current.size === 0) {
      dragRef.current = null;
    }
  };

  if (!papers.length) return <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center text-text-muted">No publications match the current search.</div>;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm" onPointerLeave={(event) => { if (event.pointerType === 'mouse') { setActiveIndex(null); setActiveTopic(null); } }}>
      <div className="border-b border-border/70 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-sm text-text-secondary"><strong className="text-text">{activePapers.length} of {papers.length} papers</strong> shown in a stable topic-similarity layout.</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
          {venues.map(venue => <span key={venue} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: venueColors[venue] || DEFAULT_VENUE_COLOR }}></span>{venue}</span>)}
        </div>
      </div>

      <div className="relative min-h-[400px]">
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border border-border bg-white/90 p-1 shadow-sm backdrop-blur-sm" aria-label="Map zoom controls">
          <button type="button" onClick={() => zoomTo(viewport.scale * 1.25)} className="flex h-7 w-7 items-center justify-center rounded-full text-lg leading-none text-text-secondary hover:bg-bg-subtle hover:text-accent" aria-label="Zoom in">+</button>
          <button type="button" onClick={resetViewport} className="px-1 text-[10px] font-bold uppercase tracking-wide text-text-muted hover:text-accent" aria-label="Reset map view">Reset</button>
          <button type="button" onClick={() => zoomTo(viewport.scale / 1.25)} className="flex h-7 w-7 items-center justify-center rounded-full text-lg leading-none text-text-secondary hover:bg-bg-subtle hover:text-accent" aria-label="Zoom out">−</button>
        </div>
        <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block w-full h-auto min-h-[400px] touch-none cursor-grab active:cursor-grabbing select-none" role="img" aria-label="Interactive map of publications arranged by shared topics" onPointerDown={startPan} onPointerMove={pan} onPointerUp={stopPan} onPointerCancel={stopPan}>
          <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`}>
            {layout.edges.map((edge, index) => {
              const filterMatch = activeTitles.has(papers[edge.source].title) && activeTitles.has(papers[edge.target].title);
              const opacity = !filterMatch ? 0.008 : activeTopic ? (edge.topics.includes(activeTopic) ? 0.3 : 0.015) : (edge.strength > 1 ? 0.16 : 0.055);
              return <line key={index} x1={layout.nodes[edge.source].x} y1={layout.nodes[edge.source].y} x2={layout.nodes[edge.target].x} y2={layout.nodes[edge.target].y} stroke="#64748b" strokeWidth={Math.min(edge.strength, 2.5)} opacity={opacity} />;
            })}
          {layout.anchors.map(anchor => {
            const labelWidth = Math.max(54, anchor.topic.length * 7.2 + 18);
            const selected = activeTopic === anchor.topic;
            return (
              <g data-topic-label key={anchor.topic} transform={`translate(${anchor.labelX} ${anchor.labelY}) scale(${detailScale})`} role="button" tabIndex="0" aria-label={`Highlight ${anchor.topic} papers`} onPointerEnter={() => { setActiveTopic(anchor.topic); setActiveIndex(null); }} onFocus={() => { setActiveTopic(anchor.topic); setActiveIndex(null); }} onPointerLeave={() => setActiveTopic(null)} className="cursor-pointer outline-none">
                <rect x={-labelWidth / 2} y="-15" width={labelWidth} height="22" rx="11" fill="white" fillOpacity={selected ? 0.98 : 0.86} stroke={selected ? '#10b981' : '#e2e8f0'} strokeOpacity={selected ? 0.75 : 0.7} strokeWidth="1" className="transition-all" />
                <text x="0" y="0" textAnchor="middle" className={`pointer-events-none text-[14px] font-semibold transition-all ${selected ? 'fill-emerald-600 opacity-100' : activeTopic ? 'fill-slate-400 opacity-70' : 'fill-slate-600 opacity-95'}`}>{anchor.topic}</text>
              </g>
            );
          })}
          {papers.map((paper, index) => {
            const node = layout.nodes[index];
            const venue = paper.venueTag || paper.displayVenue || paper.venue || paper.type;
            const active = activeIndex === index;
            const topicMatch = !activeTopic || paper.topicTags.includes(activeTopic);
            const filterMatch = activeTitles.has(paper.title);
            const opacity = !filterMatch ? 0.12 : topicMatch ? 1 : 0.16;
            return (
              <g data-paper-node key={paper.title} transform={`translate(${node.x} ${node.y})`} opacity={opacity} tabIndex={filterMatch ? 0 : -1} role="button" aria-disabled={!filterMatch} aria-label={`${paper.title}. Topics: ${paper.topicTags.join(', ')}`} onPointerEnter={() => { if (filterMatch) { cancelClose(); setActiveIndex(index); setActiveTopic(null); } }} onPointerLeave={(event) => { if (event.pointerType === 'mouse') scheduleClose(); }} onFocus={() => { if (filterMatch) { cancelClose(); setActiveIndex(index); setActiveTopic(null); } }} onBlur={scheduleClose} onClick={() => { if (filterMatch) { cancelClose(); setActiveIndex(index); setActiveTopic(null); } }} className={`${filterMatch ? 'cursor-pointer' : 'cursor-not-allowed'} outline-none transition-opacity`}>
                <circle r={25 * detailScale} fill="transparent" className="sm:hidden" aria-hidden="true" />
                <circle r={(active ? 16 : 12) * detailScale} fill={venueColors[venue] || DEFAULT_VENUE_COLOR} opacity="0.18" className="transition-all duration-200" />
                <circle r={(active ? 10 : 7.5) * detailScale} fill={venueColors[venue] || DEFAULT_VENUE_COLOR} stroke="white" strokeWidth={2 * detailScale} className="transition-all duration-200 drop-shadow-sm" />
              </g>
            );
          })}
          </g>
        </svg>

        <div className="absolute left-4 bottom-4 text-[11px] text-text-muted bg-white/80 rounded-full px-2.5 py-1 border border-border/60 pointer-events-none">Drag to pan · pinch or use +/− to zoom</div>
        {activePaper && displayedNode && (
          <article
            className={`absolute bottom-4 left-4 right-4 sm:bottom-auto sm:right-auto sm:left-[var(--node-x)] sm:top-[var(--node-y)] sm:w-[430px] sm:-translate-y-1/2 ${displayedNode.x > WIDTH / 2 ? 'sm:-translate-x-[calc(100%+18px)]' : 'sm:translate-x-[18px]'} rounded-xl border border-border bg-white/95 backdrop-blur-md p-4 shadow-xl pointer-events-auto z-20`}
            style={{ '--node-x': `${Math.max(5, Math.min(95, (displayedNode.x / WIDTH) * 100))}%`, '--node-y': `${Math.max(18, Math.min(82, (displayedNode.y / HEIGHT) * 100))}%` }}
            onPointerEnter={cancelClose}
            onPointerLeave={(event) => { if (event.pointerType === 'mouse') closePreview(); }}
          >
            <NewPublicationBadge year={activePaper.year} month={activePaper.month} className="absolute right-3 top-3" />
            <button type="button" onClick={closePreview} className="absolute right-3 top-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-white text-sm text-text-muted shadow-sm hover:text-accent sm:hidden" aria-label="Close paper preview">×</button>
            <div className="flex gap-3">
              <div className="hidden sm:flex w-32 shrink-0 self-stretch flex-col gap-2">
                {activePaper.video_url && <div className="flex flex-1 items-center"><div className="w-full overflow-hidden rounded-lg bg-bg-subtle">{activePaper.video_url.endsWith('.mp4') || activePaper.video_url.endsWith('.webm') ? <video key={activePaper.video_url} autoPlay loop muted playsInline preload="metadata" className="w-full h-auto"><source src={activePaper.video_url} type={`video/${activePaper.video_url.split('.').pop()}`} /></video> : <img key={activePaper.video_url} src={activePaper.video_url} alt="" className="w-full h-auto" />}</div></div>}
                <div className="flex flex-wrap gap-1 mt-auto">
                  {activePaper.pdf_url && <a href={activePaper.pdf_url} target="_blank" rel="noopener noreferrer" className="map-action">PDF</a>}
                  {activePaper.doi && <a href={`https://${activePaper.doi}`} target="_blank" rel="noopener noreferrer" className="map-action">DOI</a>}
                  {activePaper.video_ext_url && <a href={activePaper.video_ext_url} target="_blank" rel="noopener noreferrer" className="map-action">Video</a>}
                  {activePaper.code_url && <a href={activePaper.code_url} target="_blank" rel="noopener noreferrer" className="map-action">Code</a>}
                  {activePaper.website_url && <a href={activePaper.website_url} target="_blank" rel="noopener noreferrer" className="map-action">Web</a>}
                </div>
              </div>
              <div className="min-w-0 pr-14">
                <div className="mb-1 flex items-center gap-2">
                  <p className="min-w-0 truncate text-xs font-bold uppercase tracking-wider" style={{ color: venueColors[activePaper.venueTag] || DEFAULT_VENUE_COLOR }}>{activePaper.displayVenue || activePaper.venue || activePaper.type} · {activePaper.year}</p>
                </div>
                <h2 className="font-outfit font-bold text-text leading-snug">{activePaper.title}</h2>
                <p className="text-xs text-text-secondary mt-1">{shortAuthors(activePaper.authors)}</p>
                <div className="flex flex-wrap gap-1 mt-2">{activePaper.topicTags.map(topic => <span key={topic} className="rounded-full bg-bg-subtle border border-border px-2 py-0.5 text-[10px] text-text-secondary">{topic}</span>)}</div>
              </div>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
