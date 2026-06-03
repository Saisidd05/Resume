'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Phone, Mail, Send, ChevronLeft, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/landing/Navbar';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const contactInfo = {
    name: 'Sai Siddharth N',
    phone: '9345411184',
    email: 'nsaisiddharth05@gmail.com',
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(type);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);

    toast.success('Thank you! Your message has been sent successfully.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0A', color: '#FFFFFF' }}>
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors" style={{ color: 'rgba(255,255,255,0.45)' }} onMouseEnter={e => e.currentTarget.style.color = '#FFC107'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
            <ChevronLeft size={16} />
            Back to Home
          </Link>

          {/* Page Heading */}
          <div className="text-center mb-12">
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs uppercase tracking-widest font-semibold mb-2"
              style={{ color: '#FFC107' }}
            >
              Get In Touch
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Build with AI by <span className="gradient-text">{contactInfo.name}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-sm sm:text-base max-w-2xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Have feedback, questions, or want to collaborate? Send a message or reach out directly.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-stretch">
            {/* Contact Details Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2 rounded-2xl p-6 flex flex-col justify-between"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Creator Information
                </h3>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  This application was crafted with the power of advanced agentic AI coding assistants, tailored for seamless document templates and clean resume generation.
                </p>

                <div className="space-y-4">
                  {/* Phone */}
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(255,193,7,0.15)] text-[#FFC107]">
                        <Phone size={15} />
                      </div>
                      <div>
                        <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Call / WhatsApp</div>
                        <a href={`tel:${contactInfo.phone}`} className="text-sm font-semibold transition-colors hover:text-[#FFC107]">
                          +91 {contactInfo.phone}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(contactInfo.phone, 'Phone')}
                      className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.05)] text-gray-400 hover:text-white"
                      title="Copy phone number"
                    >
                      {copiedField === 'Phone' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(229,57,53,0.15)] text-[#E53935]">
                        <Mail size={15} />
                      </div>
                      <div>
                        <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Email Address</div>
                        <a href={`mailto:${contactInfo.email}`} className="text-sm font-semibold transition-colors hover:text-[#E53935] break-all">
                          {contactInfo.email}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(contactInfo.email, 'Email')}
                      className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.05)] text-gray-400 hover:text-white"
                      title="Copy email address"
                    >
                      {copiedField === 'Email' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.06)] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFC107, #E53935)' }}>
                  <FileText size={16} className="text-black" />
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>At Your Hand</div>
                  <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Template-Preserving Resume Builder</div>
                </div>
              </div>
            </motion.div>

            {/* Message Form Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="md:col-span-3 rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Send a Message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-400">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        color: '#FFFFFF',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FFC107';
                        e.target.style.background = 'rgba(255,193,7,0.02)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.target.style.background = 'rgba(255,255,255,0.02)';
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-400">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        color: '#FFFFFF',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FFC107';
                        e.target.style.background = 'rgba(255,193,7,0.02)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.target.style.background = 'rgba(255,255,255,0.02)';
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-400">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Collaboration request / general feedback"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      borderColor: 'rgba(255,255,255,0.08)',
                      color: '#FFFFFF',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#FFC107';
                      e.target.style.background = 'rgba(255,193,7,0.02)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.target.style.background = 'rgba(255,255,255,0.02)';
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-400">Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all resize-none"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      borderColor: 'rgba(255,255,255,0.08)',
                      color: '#FFFFFF',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#FFC107';
                      e.target.style.background = 'rgba(255,193,7,0.02)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.target.style.background = 'rgba(255,255,255,0.02)';
                    }}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 btn-primary font-semibold text-sm"
                  style={{ padding: '12px 24px', opacity: isSubmitting ? 0.8 : 1 }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  <Send size={14} />
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 px-6 text-center border-t border-[rgba(255,255,255,0.06)]">
        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © 2026 At Your Hand · Designed & Built by {contactInfo.name}
        </div>
      </footer>
    </div>
  );
}
