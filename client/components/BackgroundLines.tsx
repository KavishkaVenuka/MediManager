"use client";

import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

const ModernBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, radius: 150 });
  const animationFrameId = useRef<number | null>(null);

  const config = {
    particleCount: 60,
    connectionDistance: 180,
    mouseInfluence: 120,
    colors: [
      'rgba(20, 184, 166, 0.2)',    // Teal
      'rgba(16, 185, 129, 0.18)',   // Emerald
      'rgba(34, 197, 94, 0.15)',    // Green
      'rgba(14, 165, 233, 0.15)',   // Sky blue
    ],
    gradientColors: [
      { pos: 0, color: 'rgba(20, 184, 166, 0.03)' },
      { pos: 0.5, color: 'rgba(16, 185, 129, 0.02)' },
      { pos: 1, color: 'rgba(34, 197, 94, 0.03)' },
    ]
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const createParticle = (): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      color: config.colors[Math.floor(Math.random() * config.colors.length)]
    });

    const init = () => {
      particlesRef.current = [];
      for (let i = 0; i < config.particleCount; i++) {
        particlesRef.current.push(createParticle());
      }
    };

    const drawGradientOrbs = () => {
      const orbs = [
        { x: w * 0.2, y: h * 0.3, size: 400, color1: 'rgba(20, 184, 166, 0.05)', color2: 'rgba(20, 184, 166, 0)' },
        { x: w * 0.8, y: h * 0.7, size: 500, color1: 'rgba(16, 185, 129, 0.04)', color2: 'rgba(16, 185, 129, 0)' },
        { x: w * 0.5, y: h * 0.5, size: 450, color1: 'rgba(34, 197, 94, 0.03)', color2: 'rgba(34, 197, 94, 0)' },
      ];

      orbs.forEach(orb => {
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.size);
        gradient.addColorStop(0, orb.color1);
        gradient.addColorStop(1, orb.color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      });
    };

    const render = () => {
      if (!ctx) return;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, w, h);

      drawGradientOrbs();

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update and draw particles
      particles.forEach(p => {
        // Mouse interaction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.vx -= (dx / dist) * force * 0.2;
          p.vy -= (dy / dist) * force * 0.2;
        }

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Boundary bounce
        if (p.x < 0 || p.x > w) {
          p.vx *= -1;
          p.x = Math.max(0, Math.min(w, p.x));
        }
        if (p.y < 0 || p.y > h) {
          p.vy *= -1;
          p.y = Math.max(0, Math.min(h, p.y));
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      // Draw connections
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < config.connectionDistance) {
            const opacity = (1 - dist / config.connectionDistance) * 0.35;
            ctx.strokeStyle = `rgba(20, 184, 166, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY;

      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      mouseRef.current.x = clientX;
      mouseRef.current.y = clientY;
    };

    init();
    render();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/20 via-emerald-50/10 to-cyan-50/10" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />
      <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px]" />
    </div>
  );
};

export default ModernBackground;