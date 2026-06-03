'use client';

import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import FeatureCards from '@/components/landing/FeatureCards';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeatureCards />

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '40px 24px',
          textAlign: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
            © 2026 At Your Hand · MIT License · Open Source · Build Using AI
          </div>
          <div className="flex items-center gap-6" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              style={{ transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FFC107')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
              GitHub
            </a>
            <Link href="/builder"
              style={{ transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FFC107')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
              Start Building
            </Link>
            <Link href="/contact"
              style={{ transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FFC107')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
