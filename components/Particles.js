'use client';

import { useEffect, useRef, useState } from 'react';

export default function Particles({ className }) {
    const canvasRef = useRef(null);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const desktop = window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)');
        const updateEnabled = () => setEnabled(desktop.matches && !document.hidden);
        updateEnabled();
        desktop.addEventListener('change', updateEnabled);
        document.addEventListener('visibilitychange', updateEnabled);
        return () => {
            desktop.removeEventListener('change', updateEnabled);
            document.removeEventListener('visibilitychange', updateEnabled);
        };
    }, []);

    useEffect(() => {
        if (!enabled) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationFrameId;
        let previousFrameTime = null;
        let particles = [];
        let mouse = { x: null, y: null };
        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
        let reducedMotion = motionPreference.matches;

        // Configuration
        const particleCount = 60;
        const connectionDistance = 150;
        const mouseConnectionDistance = 200;
        const particleColor = 'rgba(16, 185, 129, 0.4)';
        const particleSpeed = 0.24;

        // Central exclusion zone (content area)
        const getExclusionZone = () => {
            const w = canvas.width;
            const maxW = Math.min(1080, w * 0.75);
            return {
                left: (w - maxW) / 2,
                right: (w + maxW) / 2,
                top: 80,
                bottom: canvas.height,
            };
        };

        const isInExclusion = (x, y) => {
            const zone = getExclusionZone();
            return x > zone.left && x < zone.right && y > zone.top && y < zone.bottom;
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e) => {
            if (e.target.closest?.('[data-particle-exclusion]')) {
                mouse.x = null;
                mouse.y = null;
                return;
            }
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };

        class Particle {
            constructor() {
                this.respawn();
            }

            respawn() {
                let attempts = 0;
                do {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    attempts++;
                } while (isInExclusion(this.x, this.y) && attempts < 50);

                this.vx = (Math.random() - 0.5) * particleSpeed;
                this.vy = (Math.random() - 0.5) * particleSpeed;
                this.size = Math.random() * 2 + 1;
            }

            update(frameScale) {
                this.x += this.vx * frameScale;
                this.y += this.vy * frameScale;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                // Push away from exclusion zone
                if (isInExclusion(this.x, this.y)) {
                    const zone = getExclusionZone();
                    const cx = (zone.left + zone.right) / 2;
                    const dx = this.x - cx;
                    this.vx += (dx > 0 ? 0.1 : -0.1) * frameScale;
                    const maxSpeed = particleSpeed * 2;
                    this.vx = Math.max(-maxSpeed, Math.min(maxSpeed, this.vx));
                    this.vy = Math.max(-maxSpeed, Math.min(maxSpeed, this.vy));
                }
            }

            draw() {
                ctx.fillStyle = particleColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            resize();
            previousFrameTime = null;
            particles = Array.from({ length: particleCount }, () => new Particle());
        };

        const animate = (timestamp) => {
            // Gentle, refresh-rate-independent drift; reduced motion slows it further.
            const elapsed = previousFrameTime === null ? 0 : Math.min(timestamp - previousFrameTime, 32);
            previousFrameTime = timestamp;
            const frameScale = (elapsed / (1000 / 60)) * (reducedMotion ? 0.5 : 1);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update(frameScale);
                p.draw();
            });

            // Connections between particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        const opacity = 1 - (distance / connectionDistance);
                        ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.15})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Mouse connections — only show when cursor is OUTSIDE exclusion zone
            if (mouse.x !== null && mouse.y !== null && !isInExclusion(mouse.x, mouse.y)) {
                ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
                ctx.fill();

                for (let i = 0; i < particles.length; i++) {
                    const dx = mouse.x - particles[i].x;
                    const dy = mouse.y - particles[i].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouseConnectionDistance) {
                        const opacity = 1 - (distance / mouseConnectionDistance);
                        ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.6})`;
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(mouse.x, mouse.y);
                        ctx.lineTo(particles[i].x, particles[i].y);
                        ctx.stroke();

                        ctx.fillStyle = `rgba(16, 185, 129, ${opacity * 0.8})`;
                        ctx.beginPath();
                        ctx.arc(particles[i].x, particles[i].y, particles[i].size + 1, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            init();
        };
        const handleMotionPreference = () => {
            reducedMotion = motionPreference.matches;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('blur', handleMouseLeave);
        motionPreference.addEventListener('change', handleMotionPreference);

        init();
        animationFrameId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('blur', handleMouseLeave);
            motionPreference.removeEventListener('change', handleMotionPreference);
            cancelAnimationFrame(animationFrameId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
    }, [enabled]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={`fixed inset-0 pointer-events-none z-0 ${className || ''}`}
        />
    );
}
