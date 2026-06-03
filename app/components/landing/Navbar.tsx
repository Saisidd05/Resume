'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Github } from 'lucide-react';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10,10,10,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FFC107, #E53935)' }}
            >
              <FileText size={16} className="text-black" />
            </motion.div>
            <span
              className="font-bold text-lg tracking-tight"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              At Your Hand
            </span>
          </Link>
        </div>

        {/* Center: Nav Links */}
        <div className="hidden md:flex items-center justify-center gap-8 flex-1">
          {[
            { label: 'Features', href: '/#features' },
            { label: 'How It Works', href: '/#how-it-works' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors"
              style={{ color: 'rgba(255,255,255,0.6)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFC107')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: actions */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 text-sm btn-secondary"
            style={{ padding: '7px 16px' }}
          >
            <Github size={15} />
            GitHub
          </a>
          <Link href="/builder">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary text-sm"
              style={{ padding: '8px 20px' }}
            >
              Start Building →
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
