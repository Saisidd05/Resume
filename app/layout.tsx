import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'At Your Hand — Template-Preserving Resume Builder',
  description:
    'Upload your resume template. Answer a few questions. Get back the exact same template — filled perfectly. No redesign. No layout changes. TEMPLATE IN = TEMPLATE OUT.',
  keywords: [
    'resume builder',
    'template preserving',
    'PDF resume',
    'DOCX resume',
    'AI resume',
    'resume filler',
    'resume generator',
  ],
  authors: [{ name: 'At Your Hand' }],
  openGraph: {
    title: 'At Your Hand — Template-Preserving Resume Builder',
    description: 'Answer Questions. Build Resume. Keep Your Template.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#4CAF50', secondary: '#1A1A1A' },
            },
            error: {
              iconTheme: { primary: '#E53935', secondary: '#1A1A1A' },
            },
            loading: {
              iconTheme: { primary: '#FFC107', secondary: '#1A1A1A' },
            },
          }}
        />
      </body>
    </html>
  );
}
