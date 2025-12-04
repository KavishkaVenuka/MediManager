"use client";

import React, { useRef, useEffect } from 'react';

// 1. Define types for our objects so TypeScript knows what they look like
interface Neuron {
  x: number;
  y: number;
  parent: Neuron | null;
  connections: Neuron[];
  placing: boolean;
  targetX: number;
  targetY: number;
}

interface Pulse {
  curr: Neuron;
  target: Neuron;
  progress: number;
}

const BackgroundNeurons = () => {
  // 2. Explicitly tell TypeScript this ref refers to an HTMLCanvasElement
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 3. Define the types for our arrays
  const neuronsRef = useRef<Neuron[]>([]);
  const pulsesRef = useRef<Pulse[]>([]);

  const mouseRef = useRef({ x: -100, y: -100, isActive: false });
  const animationFrameId = useRef<number | null>(null);

  // Configuration settings for easy tweaking
  const config = {
    neuronColor: 'rgba(0, 191, 165, 0.2)',
    nodeColor: 'rgba(13, 148, 136, 0.6)',
    pulseColor: 'rgb(45, 212, 191)',
    maxNeurons: 150,
    growthRate: 3,
    connectionDistance: 100,
    pulseSpeed: 2.5,
  };


  useEffect(() => {
    const canvas = canvasRef.current;
    // Safety check: if canvas isn't loaded yet, stop.
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    // --- Helper Functions ---

    // Distance calculator (typed for safety)
    const getDist = (p1: { x: number, y: number }, p2: { x: number, y: number }) =>
      Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

    // Create a new neuron node
    const createNeuron = (x: number, y: number, parent: Neuron | null = null): Neuron => ({
      x, y,
      parent,
      connections: [],
      placing: true,
      targetX: x, targetY: y
    });

    // --- Simulation Logic ---

    const init = () => {
      neuronsRef.current = [];
      pulsesRef.current = [];
      // Start with a few "seed" neurons scattered randomly
      for (let i = 0; i < 8; i++) {
        neuronsRef.current.push(createNeuron(Math.random() * w, Math.random() * h));
      }
    };

    const growNetwork = () => {
      const neurons = neuronsRef.current;
      if (neurons.length >= config.maxNeurons) return;

      if (Math.floor(Math.random() * config.growthRate) === 0) {
        const parentIndex = Math.floor(Math.random() * neurons.length);
        const parent = neurons[parentIndex];

        if (!parent.placing) {
          const angle = Math.random() * Math.PI * 2;
          const length = 50 + Math.random() * 80;
          const newX = parent.x + Math.cos(angle) * length;
          const newY = parent.y + Math.sin(angle) * length;

          if (newX > 0 && newX < w && newY > 0 && newY < h) {
            const newNode = createNeuron(parent.x, parent.y, parent);
            newNode.targetX = newX;
            newNode.targetY = newY;
            neurons.push(newNode);
            parent.connections.push(newNode);
          }
        }
      }
    };

    const triggerPulse = (startNode: Neuron | null) => {
      if (startNode && startNode.connections.length > 0) {
        const nextNode = startNode.connections[Math.floor(Math.random() * startNode.connections.length)];
        pulsesRef.current.push({
          curr: { ...startNode }, // Clone to avoid modifying original node position
          target: nextNode,
          progress: 0
        });
      }
    }


    // --- The Main Animation Loop ---
    const render = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);
      const neurons = neuronsRef.current;
      const pulses = pulsesRef.current;
      const mouse = mouseRef.current;

      // 1. Update Neuron Growth Positions
      neurons.forEach(n => {
        if (n.placing) {
          const dx = n.targetX - n.x;
          const dy = n.targetY - n.y;
          if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
            n.x = n.targetX;
            n.y = n.targetY;
            n.placing = false;
            if (Math.random() > 0.7) triggerPulse(n.parent);
          } else {
            n.x += dx * 0.1;
            n.y += dy * 0.1;
          }
        }

        if (mouse.isActive && !n.placing) {
          const distToMouse = getDist(n, mouse);
          if (distToMouse < 150) {
            const angle = Math.atan2(mouse.y - n.y, mouse.x - n.x);
            n.x += Math.cos(angle) * 0.5;
            n.y += Math.sin(angle) * 0.5;
            if (Math.random() > 0.97) triggerPulse(n);
          }
        }
      });

      // 2. Draw Static Connections (Axons)
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = config.neuronColor;
      ctx.beginPath();
      neurons.forEach(n => {
        if (n.parent) {
          ctx.moveTo(n.parent.x, n.parent.y);
          ctx.lineTo(n.x, n.y);
        }
      });
      ctx.stroke();

      // 3. Draw Nodes (Somas)
      ctx.fillStyle = config.nodeColor;
      neurons.forEach(n => {
        if (!n.placing) {
          ctx.beginPath();
          const size = (mouse.isActive && getDist(n, mouse) < 150) ? 3.5 : 2;
          ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 4. Update and Draw Pulses (Signals)
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        const distTotal = getDist(p.curr, p.target);
        p.progress += config.pulseSpeed;

        if (p.progress >= distTotal) {
          pulses.splice(i, 1);
          if (Math.random() > 0.3) triggerPulse(p.target);
        } else {
          const ratio = p.progress / distTotal;
          const cx = p.curr.x + (p.target.x - p.curr.x) * ratio;
          const cy = p.curr.y + (p.target.y - p.curr.y) * ratio;

          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fillStyle = config.pulseColor;
          ctx.shadowBlur = 10;
          ctx.shadowColor = config.pulseColor;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      growNetwork();
      animationFrameId.current = requestAnimationFrame(render);
    };


    // --- Event Listeners ---
    const handleResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
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

      mouseRef.current = { x: clientX, y: clientY, isActive: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current.isActive = false;
    }


    init();
    render();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove as any);
    window.addEventListener('touchmove', handleMouseMove as any);
    window.addEventListener('mouseout', handleMouseLeave);
    window.addEventListener('touchend', handleMouseLeave);


    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('touchmove', handleMouseMove as any);
      window.removeEventListener('mouseout', handleMouseLeave);
      window.removeEventListener('touchend', handleMouseLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-gray-50">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>
    </div>
  );
};

export default BackgroundNeurons;