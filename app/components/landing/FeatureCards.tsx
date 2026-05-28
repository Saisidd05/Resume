'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Upload, Brain, MessageSquare, Wand2,
  FileCheck, Download, Lock, Eye, Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Upload Your Template',
    description:
      'Drop any PDF or DOCX resume template. We parse its exact structure — sections, fonts, spacing, every detail.',
    color: '#FFC107',
    delay: 0,
  },
  {
    icon: Brain,
    title: 'Template Intelligence',
    description:
      'Our engine reads written instructions inside your template ("3–4 lines", "5 bullet points") and enforces them during generation.',
    color: '#FF8F00',
    delay: 0.1,
  },
  {
    icon: MessageSquare,
    title: 'Smart Question Flow',
    description:
      'Dynamically generated questions based on YOUR specific template sections — not generic forms.',
    color: '#FF6F00',
    delay: 0.2,
  },
  {
    icon: Wand2,
    title: 'AI Content Assist',
    description:
      'Generate, improve, shorten, or rewrite content using AI. Entirely optional — works fully offline too.',
    color: '#E53935',
    delay: 0.3,
  },
  {
    icon: Eye,
    title: 'Live Preview',
    description:
      'See your resume update in real time as you type. The preview renders with your template\'s exact formatting.',
    color: '#C62828',
    delay: 0.4,
  },
  {
    icon: Lock,
    title: 'Strict Template Mode',
    description:
      'Layout, colors, fonts, section order — all locked. Nothing changes except the content you provide.',
    color: '#B71C1C',
    delay: 0.5,
  },
  {
    icon: FileCheck,
    title: 'Pixel-Perfect Output',
    description:
      'Generated PDF is visually identical to your uploaded template. Same fonts, same layout, same you.',
    color: '#FFC107',
    delay: 0.6,
  },
  {
    icon: Download,
    title: 'PDF & DOCX Export',
    description:
      'Download in your preferred format. Open it — it looks exactly like your template, now filled with your story.',
    color: '#FFD54F',
    delay: 0.7,
  },
  {
    icon: Sparkles,
    title: 'Fully Local-First',
    description:
      'No account, no cloud, no tracking. Everything lives in your browser. Your data never leaves your machine.',
    color: '#FF5722',
    delay: 0.8,
  },
];

const steps = [
  { number: '01', title: 'Upload Template', desc: 'Your PDF or DOCX resume template' },
  { number: '02', title: 'Answer Questions', desc: 'Section-specific targeted questions' },
  { number: '03', title: 'Generate Resume', desc: 'Template filled with your answers' },
  { number: '04', title: 'Download', desc: 'Pixel-perfect PDF or DOCX output' },
];

export default function FeatureCards() {
  const featRef = useRef(null);
  const stepsRef = useRef(null);
  const featInView = useInView(featRef, { once: true, margin: '-100px' });
  const stepsInView = useInView(stepsRef, { once: true, margin: '-100px' });

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
              Built for professionals who have a great template and just need it filled correctly.
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
              Four steps.{' '}
              <span className="gradient-text">One perfect resume.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10"
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
