'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Phone, Mail, Send, ChevronLeft, Copy, Check, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/landing/Navbar';
import { ParticleCanvas } from '@/components/landing/Hero';

// WhatsApp SVG Icon
function WhatsAppIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
    >
      <path d="M12.004 0C5.378 0 .004 5.374.004 12c0 2.112.551 4.17 1.596 5.979L.004 24l6.166-1.617A11.956 11.956 0 0012.004 24c6.626 0 12-5.374 12-12s-5.374-12-12-12zm6.757 16.942c-.276.776-1.398 1.411-2.228 1.583-.564.118-1.3.21-3.79-.817-3.184-1.31-5.239-4.552-5.398-4.763-.16-.21-1.282-1.706-1.282-3.255 0-1.549.81-2.31 1.099-2.613.29-.303.626-.379.835-.379.208 0 .416.002.597.01.189.008.444-.072.694.53.256.619.876 2.137.95 2.293.076.156.126.338.02.548-.106.21-.16.338-.318.528-.158.19-.333.424-.476.57-.16.163-.327.34-.14.658.188.318.835 1.378 1.79 2.227.955.849 1.76 1.112 2.062 1.238.303.126.48.106.66-.1.18-.205.776-.902.983-1.213.208-.312.416-.26.702-.153.287.106 1.823.859 2.137 1.016.315.156.524.234.6.363.076.13.076.753-.2 1.529z" />
    </svg>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const contactInfo = {
    name: 'Sai Siddharth N',
    phone: '9345411184',
    email: 'nsaisiddharth05@gmail.com',
    linkedin: 'https://www.linkedin.com/in/sai-siddharth-nanda-gopal-b96883321',
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

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${contactInfo.email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          Name: formData.name,
          Email: formData.email,
          Subject: formData.subject || 'At Your Hand - New Contact Message',
          Message: formData.message,
        }),
      });

      if (response.ok) {
        toast.success('Thank you! Your message has been sent successfully.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="hero-bg min-h-screen flex flex-col relative overflow-hidden" style={{ color: '#FFFFFF' }}>
      <Navbar />

      {/* Particle Canvas */}
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

      {/* Main Content */}
      <main className="flex-grow pt-28 pb-16 px-6 relative z-10">
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
                    <div className="flex items-center gap-2">
                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/91${contactInfo.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(76,175,80,0.12)] text-gray-400 hover:text-[#4CAF50] flex items-center justify-center"
                        title="Chat on WhatsApp"
                      >
                        <WhatsAppIcon size={16} />
                      </a>
                      <button
                        onClick={() => handleCopy(contactInfo.phone, 'Phone')}
                        className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.05)] text-gray-400 hover:text-white"
                        title="Copy phone number"
                      >
                        {copiedField === 'Phone' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
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
                    <div className="flex items-center gap-2">
                      {/* Send Email */}
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(229,57,53,0.12)] text-gray-400 hover:text-[#E53935] flex items-center justify-center"
                        title="Send Email"
                      >
                        <Mail size={15} />
                      </a>
                      <button
                        onClick={() => handleCopy(contactInfo.email, 'Email')}
                        className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.05)] text-gray-400 hover:text-white"
                        title="Copy email address"
                      >
                        {copiedField === 'Email' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-[rgba(10,102,194,0.15)] text-[#0A66C2]">
                        <Linkedin size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>LinkedIn</div>
                        <a
                          href={contactInfo.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold transition-colors hover:text-[#0A66C2] block truncate"
                          style={{ maxWidth: '170px' }}
                        >
                          sai-siddharth-nanda-gopal-b96883321
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Visit Profile */}
                      <a
                        href={contactInfo.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(10,102,194,0.12)] text-gray-400 hover:text-[#0A66C2] flex items-center justify-center"
                        title="Visit LinkedIn"
                      >
                        <Linkedin size={15} />
                      </a>
                      <button
                        onClick={() => handleCopy(contactInfo.linkedin, 'LinkedIn')}
                        className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.05)] text-gray-400 hover:text-white"
                        title="Copy LinkedIn URL"
                      >
                        {copiedField === 'LinkedIn' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
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
      <footer className="py-6 px-6 text-center border-t border-[rgba(255,255,255,0.06)] relative z-10">
        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © 2026 At Your Hand · Designed & Built by {contactInfo.name}
        </div>
      </footer>
    </div>
  );
}
