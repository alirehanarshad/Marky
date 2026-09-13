'use client';

import React, { useState } from 'react';
import {
  Mail,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Building,
  Sparkles
} from 'lucide-react';
import api from '@/lib/api';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: '' }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    // Validation
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setFeedback({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setFeedback({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitContactForm({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim()
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          text: 'Thank you for reaching out! Your message has been logged securely and our enterprise solutions team will respond within 24 hours.'
        });
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to submit your message. Please try again.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'An error occurred while sending your message.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12 animate-fadeIn text-white">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181438] border border-[#7A5DBB]/30 text-xs font-semibold text-[#D1C3FF]">
          <MessageSquare className="w-3.5 h-3.5 text-[#A59FFF]" />
          <span>Direct Contact & Support</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
          Get in Touch With Marky
        </h1>
        <p className="text-sm text-[#B4AFCC] leading-relaxed">
          Have questions regarding enterprise deployments, custom AI agent fine-tuning, or API access? Send us a message and our team will get back to you promptly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Side: Contact Information Cards */}
        <div className="space-y-6 lg:col-span-1">
          <div className="p-6 rounded-3xl bg-[#110E2E]/80 border border-[#231B4D] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#1D1745] flex items-center justify-center text-[#A59FFF]">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Direct Email Inquiries</h3>
            <p className="text-xs text-[#8E8AAB]">
              Technical and commercial inquiries:
            </p>
            <p className="text-xs font-mono font-bold text-[#D1C3FF]">support@marky.ai</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#110E2E]/80 border border-[#231B4D] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#1D1745] flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Response SLA</h3>
            <p className="text-xs text-[#8E8AAB] leading-relaxed">
              Standard accounts receive support within 24 business hours. Ultra &amp; Pro enterprise accounts receive priority SLA escalation.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#110E2E]/80 border border-[#231B4D] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#1D1745] flex items-center justify-center text-amber-400">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Platform Headquarters</h3>
            <p className="text-xs text-[#8E8AAB] leading-relaxed">
              Marky AI Platform Operations<br />
              Commercial SaaS Division
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Form */}
        <div className="lg:col-span-2 p-8 sm:p-10 rounded-3xl bg-[#0F0C29] border border-[#261E52] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-2">Send Us a Message</h3>

            {feedback && (
              <div
                className={`p-4 rounded-2xl flex items-start gap-3 text-xs leading-relaxed ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
                    : 'bg-red-950/40 border border-red-800/60 text-red-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>{feedback.text}</div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#D1C3FF]">
                  Your Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ali Rehan"
                  className="w-full px-4 py-3 rounded-xl bg-[#080614] border border-[#231C4D] text-white text-xs placeholder-[#544F75] focus:outline-none focus:border-[#7A5DBB] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#D1C3FF]">
                  Your Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#080614] border border-[#231C4D] text-white text-xs placeholder-[#544F75] focus:outline-none focus:border-[#7A5DBB] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#D1C3FF]">
                Subject <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Enterprise Custom Model Integration or Question"
                className="w-full px-4 py-3 rounded-xl bg-[#080614] border border-[#231C4D] text-white text-xs placeholder-[#544F75] focus:outline-none focus:border-[#7A5DBB] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#D1C3FF]">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your brand, store volume, or specific technical requirements..."
                className="w-full px-4 py-3 rounded-xl bg-[#080614] border border-[#231C4D] text-white text-xs placeholder-[#544F75] focus:outline-none focus:border-[#7A5DBB] transition-colors resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#4239C4] via-[#7A5DBB] to-[#D97FA5] text-white font-bold text-xs shadow-lg shadow-[#4239C4]/30 hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Inquiry...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
