'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('marky_token');
      if (token) {
        router.replace('/dashboard');
      }
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.login(email.trim(), password);
      if (res.success && res.token) {
        localStorage.setItem('marky_token', res.token);
        localStorage.setItem('marky_user', JSON.stringify(res.user));
        // Notify app components of auth change
        window.dispatchEvent(new Event('authChange'));
        setSuccessMsg('Authentication successful! Loading workspace...');
        setTimeout(() => {
          router.replace(redirectTarget);
        }, 500);
      } else {
        setError(res.error || 'Invalid email or password');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0B091B] relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-[#4239C4]/30 via-[#7A5DBB]/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-[#D97FA5]/20 via-[#A73B9D]/15 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#ECE8E3] overflow-hidden relative z-10 animate-fadeIn">
        {/* Top Header */}
        <div className="p-8 pb-6 text-center border-b border-[#ECE8E3] bg-[#FCFBFA]">
          <Link href="/" className="inline-block">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4239C4] via-[#7A5DBB] to-[#F3C5A8] p-1.5 mx-auto mb-3 shadow-lg shadow-indigo-950/20 flex items-center justify-center">
              <img
                src="/marky-avatar.png"
                alt="Marky"
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            </div>
          </Link>
          <h1 className="text-xl font-extrabold text-[#141226] tracking-tight">
            Sign In to Marky
          </h1>
          <p className="text-xs text-[#6C6782] mt-1">
            Access your AI Marketing Command Center
          </p>
        </div>

        {/* Credentials Form */}
        <div className="p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#141226]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8E8AAB] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="off"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F5F2] border border-[#ECE8E3] text-xs font-medium text-[#141226] placeholder-[#8E8AAB] focus:bg-white focus:outline-none focus:border-[#4239C4] focus:ring-1 focus:ring-[#4239C4] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#141226]">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8E8AAB] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F5F2] border border-[#ECE8E3] text-xs font-medium text-[#141226] placeholder-[#8E8AAB] focus:bg-white focus:outline-none focus:border-[#4239C4] focus:ring-1 focus:ring-[#4239C4] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#4239C4] via-[#7A5DBB] to-[#D97FA5] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-[#4239C4]/25 transition-all disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Enter Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[#ECE8E3] text-center text-xs text-[#6C6782]">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#4239C4] font-bold hover:underline">
              Create a free workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B091B]" />}>
      <LoginContent />
    </Suspense>
  );
}
