'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Upload, Play, ArrowRight, Shield, Zap } from 'lucide-react';

// ── Particle system ───────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
      life: number;
      maxLife: number;
    }

    const particles: Particle[] = [];
    const colors = ['#FFC107', '#E53935', '#FF8F00', '#FF5722'];

    function spawn(): Particle {
      return {
        x: Math.random() * canvas!.width,
        y: canvas!.height + 10,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: -(Math.random() * 1.5 + 0.5),
        opacity: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: Math.random() * 200 + 100,
      };
    }

    // Pre-populate
    for (let i = 0; i < 60; i++) {
      const p = spawn();
      p.y = Math.random() * canvas.height;
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    let raf: number;
    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Add new particles
      if (particles.length < 80 && Math.random() < 0.3) {
        particles.push(spawn());
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.speedX;
        p.y += p.speedY;

        const progress = p.life / p.maxLife;
        p.opacity = progress < 0.2
          ? progress / 0.2
          : progress > 0.8
            ? (1 - progress) / 0.2
            : 1;

        ctx!.save();
        ctx!.globalAlpha = p.opacity * 0.6;
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();

        if (p.life >= p.maxLife || p.y < -20) {
          particles.splice(i, 1);
        }
      }

      raf = requestAnimationFrame(animate);
    }

    animate();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.5 }}
    />
  );
}

// ── Animated headline word ────────────────────────────────────────────────────
const words = ['Answer Questions.', 'Build Resume.', 'Keep Your Template.'];

// ── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  return (
    <section
      id="hero"
      className="hero-bg relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
    >
      {/* Particles */}
      <ParticleCanvas />

      {/* Glow orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,193,7,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(229,57,53,0.05) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center pt-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 mb-8"
          style={{
            background: 'rgba(255,193,7,0.1)',
            border: '1px solid rgba(255,193,7,0.2)',
            borderRadius: '100px',
            padding: '6px 16px',
          }}
        >
          <Shield size={13} style={{ color: '#FFC107' }} />
          <span style={{ color: '#FFC107', fontSize: '13px', fontWeight: 600 }}>
            Template Preserved — Always
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '1.5rem',
          }}
        >
          {words.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.12 }}
              className={i === words.length - 1 ? 'gradient-text-animated' : ''}
              style={{ display: 'block' }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            lineHeight: 1.7,
            maxWidth: '620px',
            margin: '0 auto 2.5rem',
          }}
        >
          Upload your resume template. Answer a few questions. We fill it — 
          pixel perfect, font perfect, layout perfect. 
          <strong style={{ color: 'rgba(255,255,255,0.85)' }}> Your template. Your identity.</strong>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/builder">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(255,193,7,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary flex items-center gap-2.5 text-base"
              style={{ padding: '14px 32px', borderRadius: '14px', fontSize: '16px' }}
              id="cta-upload-template"
            >
              <Upload size={18} />
              Upload Template
              <ArrowRight size={16} />
            </motion.button>
          </Link>

          <Link href="/builder?demo=true">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-secondary flex items-center gap-2.5 text-base"
              style={{ padding: '14px 32px', borderRadius: '14px', fontSize: '16px' }}
              id="cta-try-demo"
            >
              <Play size={16} />
              Try Demo
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6"
          style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}
        >
          {[
            '✓ No login required',
            '✓ No data stored',
            '✓ Fully local-first',
            '✓ Open source (MIT)',
          ].map((item) => (
            <span key={item} style={{ fontWeight: 500 }}>{item}</span>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: '24px' }}
        >
          ↓
        </motion.div>
      </motion.div>
    </section>
  );
}
