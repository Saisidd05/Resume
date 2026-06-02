'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  MessageSquare,
  Wand2,
  Eye,
  Printer,
  FileCode,
  Sparkles,
  FileCheck
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Guided Questions',
    description:
      'Fill in your details step-by-step across 8 comprehensive sections designed for maximum visual alignment.',
    color: '#FFC107',
    delay: 0,
  },
  {
    icon: Wand2,
    title: 'Smart Repeaters',
    description:
      'Dynamically add and manage repeatable blocks for Professional Experience, Projects, Education, and Awards.',
    color: '#FF8F00',
    delay: 0.1,
  },
  {
    icon: Eye,
    title: 'Live Preview',
    description:
      'Watch your resume render in real time on a beautifully structured, standard Calibri/Arial template card.',
    color: '#FF6F00',
    delay: 0.2,
  },
  {
    icon: Printer,
    title: 'Print directly to PDF',
    description:
      'Instantly print or save your resume as a clean, high-resolution vector PDF using standard browser print options.',
    color: '#E53935',
    delay: 0.3,
  },
  {
    icon: FileCode,
    title: 'Export Standalone HTML',
    description:
      'Download a single, fully responsive HTML file with nested styles to host online or run locally.',
    color: '#C62828',
    delay: 0.4,
  },
  {
    icon: Sparkles,
    title: '100% Offline & Private',
    description:
      'No backend, no accounts, and no data tracking. Your resume details stay locally in your browser storage.',
    color: '#FF5722',
    delay: 0.5,
  },
];

const steps = [
  { number: '01', title: 'Answer Questions', desc: 'Fill in sections with repeatable blocks' },
  { number: '02', title: 'Live Preview', desc: 'Watch your layout update instantly' },
  { number: '03', title: 'Print & Export', desc: 'Download as HTML or save as PDF' },
];

export default function FeatureCards() {
  const featRef = useRef(null);
  const stepsRef = useRef(null);
  const featInView = useInView(featRef, { once: false, margin: '-100px' });
  const stepsInView = useInView(stepsRef, { once: false, margin: '-100px' });

  return (
    <>
      {/* Features Grid */}
      <section id="features" className="py-24 px-6" ref={featRef}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="section-badge mb-4" style={{ display: 'inline-flex' }}>
              <Sparkles size={12} />
              Features
            </div>
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: '1rem',
              }}
            >
              Everything you need.{' '}
              <span className="gradient-text">Nothing you don't.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto' }}>
              Built for professionals who need a clean, standard resume formatted instantly.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={featInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: feature.delay }}
                  className="glass-card rounded-2xl p-6 cursor-default"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${feature.color}20`, border: `1px solid ${feature.color}30` }}
                  >
                    <Icon size={20} style={{ color: feature.color }} />
                  </div>
                  <h3
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.65 }}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-24 px-6"
        ref={stepsRef}
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={stepsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="section-badge mb-4" style={{ display: 'inline-flex' }}>
              <FileCheck size={12} />
              How It Works
            </div>
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              Three steps.{' '}
              <span className="gradient-text">One perfect resume.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative"
              >
                <div className="glass-card rounded-2xl p-6 text-center h-full">
                  <div
                    className="text-5xl font-black mb-3 gradient-text"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {step.number}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 700,
                      fontSize: '1rem',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.825rem', lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                </div>
                {/* Connector arrow */}
                {i < steps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10"
                    style={{ color: 'rgba(255,193,7,0.4)', fontSize: '20px' }}
                  >
                    →
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
