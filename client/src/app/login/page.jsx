'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('marky_token');
      if (token) {
        router.replace('/');
      }
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email.trim(), password);
        if (res.success && res.token) {
          localStorage.setItem('marky_token', res.token);
          localStorage.setItem('marky_user', JSON.stringify(res.user));
          // Notify app components of auth change
          window.dispatchEvent(new Event('authChange'));
          router.replace('/');
        } else {
          setError(res.error || 'Invalid email or password');
        }
      } else {
        if (!name.trim()) {
          setError('Full name is required');
          setLoading(false);
          return;
        }
        const res = await api.register(name.trim(), email.trim(), password);
        if (res.success && res.token) {
          localStorage.setItem('marky_token', res.token);
          localStorage.setItem('marky_user', JSON.stringify(res.user));
          window.dispatchEvent(new Event('authChange'));
          setSuccessMsg('Account registered successfully! Redirecting...');
          setTimeout(() => {
            router.replace('/');
          }, 800);
        } else {
          setError(res.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0B091B] relative overflow-hidden">
      {/* Dynamic Background Glows matching Marky Visual Language */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-[#4239C4]/30 via-[#7A5DBB]/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-[#D97FA5]/20 via-[#A73B9D]/15 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#ECE8E3] overflow-hidden relative z-10 animate-fadeIn">
        {/* Top Header */}
        <div className="p-8 pb-6 text-center border-b border-[#ECE8E3] bg-[#FCFBFA]">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4239C4] via-[#7A5DBB] to-[#F3C5A8] p-1.5 mx-auto mb-3 shadow-lg shadow-indigo-950/20 flex items-center justify-center">
            <img
              src="/marky-avatar.png"
              alt="Marky"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>
          <h1 className="text-xl font-extrabold text-[#141226] tracking-tight">
            MarketPulse AI &middot; Marky
          </h1>
          <p className="text-xs text-[#6C6782] mt-1 font-medium">
            Autonomous Marketing Intelligence & Command Platform
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 mx-8 mt-6 bg-[#F7F6FA] border border-[#ECE8E3] rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#4239C4] text-white shadow-xs'
                : 'text-[#6C6782] hover:text-[#141226]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-[#4239C4] text-white shadow-xs'
                : 'text-[#6C6782] hover:text-[#141226]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-[#141226] mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F7F6FA] border border-[#ECE8E3] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#141226] placeholder-[#9894AD] focus:outline-hidden focus:ring-2 focus:ring-[#4239C4]/20 focus:border-[#4239C4] font-medium"
                />
                <User className="w-4 h-4 text-[#8E8AAB] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#141226] mb-1">
              Work Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F7F6FA] border border-[#ECE8E3] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#141226] placeholder-[#9894AD] focus:outline-hidden focus:ring-2 focus:ring-[#4239C4]/20 focus:border-[#4239C4] font-medium"
              />
              <Mail className="w-4 h-4 text-[#8E8AAB] absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#141226]">
                Password
              </label>
              {mode === 'login' && (
                <span className="text-[11px] text-[#6C6782]">
                  Encrypted session
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F7F6FA] border border-[#ECE8E3] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#141226] placeholder-[#9894AD] focus:outline-hidden focus:ring-2 focus:ring-[#4239C4]/20 focus:border-[#4239C4] font-medium"
              />
              <Lock className="w-4 h-4 text-[#8E8AAB] absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-[#4239C4] via-[#7A5DBB] to-[#D97FA5] hover:opacity-95 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-950/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create Protected Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Secure Tenant Note */}
          <div className="pt-3 border-t border-[#ECE8E3] flex items-center justify-center gap-1.5 text-[11px] text-[#6C6782]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tenant data isolation & server-side verification enforced</span>
          </div>
        </form>
      </div>
    </div>
  );
}
