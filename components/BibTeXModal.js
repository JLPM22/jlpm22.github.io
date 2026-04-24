'use client';

import { useState, useRef } from 'react';

export default function BibTeXModal({ bibtex, onClose }) {
    const [copied, setCopied] = useState(false);
    const [confetti, setConfetti] = useState([]);
    const btnRef = useRef(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(bibtex);
        setCopied(true);

        const btn = btnRef.current;
        const rect = btn ? btn.getBoundingClientRect() : null;
        const btnCenterX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const btnCenterY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

        const particles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: btnCenterX,
            y: btnCenterY,
            angle: (Math.random() * 360) * (Math.PI / 180),
            velocity: 3 + Math.random() * 6,
            color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'][Math.floor(Math.random() * 8)],
            size: 4 + Math.random() * 6,
            rotation: Math.random() * 360,
        }));
        setConfetti(particles);
        setTimeout(() => setCopied(false), 2500);
        setTimeout(() => setConfetti([]), 1500);
    };

    const formatBibtex = (bib) => {
        if (!bib) return '';
        return bib
            .replace(/@(\w+)\{/g, '<span class="text-accent font-bold">@$1</span>{')
            .replace(/(\w+)\s*=\s*\{/g, '  <span class="text-blue-600">$1</span> = {')
            .replace(/\{([^}]*)\}/g, '{<span class="text-emerald-700">$1</span>}');
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col relative border border-border mx-4 sm:mx-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-border">
                    <h3 className="text-lg font-bold text-text">BibTeX Citation</h3>
                    <button onClick={onClose} className="text-text-muted hover:text-text transition-colors p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4 sm:p-5 overflow-auto flex-1">
                    <pre
                        className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 text-xs sm:text-sm font-mono text-text whitespace-pre-wrap break-all sm:break-words leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatBibtex(bibtex) }}
                    />
                </div>
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-border flex justify-end relative">
                    <button
                        ref={btnRef}
                        onClick={handleCopy}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${copied
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                            : 'bg-accent text-white hover:bg-emerald-400 shadow-md hover:shadow-lg'
                            }`}
                    >
                        {copied ? '✓ Copied!' : 'Copy to Clipboard'}
                    </button>
                </div>
            </div>

            {confetti.length > 0 && (
                <div className="fixed inset-0 pointer-events-none z-[200]">
                    {confetti.map(p => (
                        <div
                            key={p.id}
                            className="absolute rounded-sm"
                            style={{
                                left: p.x,
                                top: p.y,
                                width: p.size,
                                height: p.size,
                                backgroundColor: p.color,
                                transform: `rotate(${p.rotation}deg)`,
                                animation: `confetti-burst 1s ease-out forwards`,
                                '--dx': `${Math.cos(p.angle) * p.velocity * 40}px`,
                                '--dy': `${Math.sin(p.angle) * p.velocity * 40 - 80}px`,
                            }}
                        />
                    ))}
                </div>
            )}

            <style jsx>{`
                @keyframes confetti-burst {
                    0% {
                        transform: translate(0, 0) rotate(0deg) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(var(--dx), var(--dy)) rotate(720deg) scale(0);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}
