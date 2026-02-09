// app/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleSmoothScroll = (e: Event) => {
      const target = e.currentTarget as HTMLAnchorElement;
      const href = target.getAttribute('href');

      if (href?.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    };

    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach((link) => {
      link.addEventListener('click', handleSmoothScroll);
    });

    return () => {
      anchorLinks.forEach((link) => {
        link.removeEventListener('click', handleSmoothScroll);
      });
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleClickOutside = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target instanceof Node && !target.closest('nav')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/30 backdrop-blur-xl fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tight">
            Task<span className="text-indigo-400">Mestry</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-300 hover:text-white transition">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-300 hover:text-white transition">
              How It Works
            </Link>
            <Link href="/ai-assistant" className="text-gray-300 hover:text-white transition">
              AI Assistant
            </Link>
            <Link href={!loading && user ? "/dashboard" : "/login"} className="text-gray-300 hover:text-white transition">
              Dashboard
            </Link>

            <div className="flex items-center gap-4 ml-4">
              <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-white transition">
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-medium hover:brightness-110 transition shadow-lg shadow-indigo-900/30"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden text-white text-3xl focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10">
            <div className="px-6 py-6 flex flex-col gap-6">
              <Link
                href="#features"
                className="text-gray-200 hover:text-white text-lg transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-200 hover:text-white text-lg transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/ai-assistant"
                className="text-gray-200 hover:text-white text-lg transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                AI Assistant
              </Link>
              <Link
                href={!loading && user ? "/dashboard" : "/login"}
                className="text-gray-200 hover:text-white text-lg transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>

              <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                <Link
                  href="/login"
                  className="text-gray-200 hover:text-white text-lg transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-medium text-center hover:brightness-110 transition text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-28 pb-20 md:pt-40 md:pb-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.12),transparent_50%)] animate-pulse"></div>

        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/5 border border-white/10 text-sm font-medium tracking-wide">
            The Future of Productivity
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-8">
            Transform Your Tasks<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Into Accomplishments
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
            Harness the power of AI to organize, prioritize, and execute your tasks with precision.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-16">
            <Link
              href="/register"
              className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold text-lg hover:brightness-110 transition-all duration-300 shadow-xl shadow-indigo-900/40 hover:scale-105"
            >
              Get Started →
            </Link>
            <Link
              href="/ai-assistant"
              className="px-10 py-5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-medium text-lg hover:bg-white/15 transition-all duration-300 hover:scale-105"
            >
              Try AI Chat →
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-xl px-8 py-5 min-w-[160px] hover:border-indigo-500/40 transition-all">
              <div className="text-3xl font-bold text-indigo-400">95%</div>
              <div className="text-gray-400 mt-1">Task Completion</div>
            </div>
            <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-xl px-8 py-5 min-w-[160px] hover:border-indigo-500/40 transition-all">
              <div className="text-3xl font-bold text-purple-400">4.8/5</div>
              <div className="text-gray-400 mt-1">User Rating</div>
            </div>
            <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-xl px-8 py-5 min-w-[160px] hover:border-indigo-500/40 transition-all">
              <div className="text-3xl font-bold text-pink-400">10K+</div>
              <div className="text-gray-400 mt-1">Active Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-black/15">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Everything You Need to <span className="text-indigo-400">Succeed</span>
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            Powerful features designed to maximize your productivity
          </p>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { icon: "🧠", title: "AI-Powered Insights", desc: "Smart suggestions based on your habits & patterns" },
              { icon: "🧩", title: "Smart Organization", desc: "Auto-categorization and intelligent prioritization" },
              { icon: "🔥", title: "Focus Mode", desc: "Adaptive focus blocks that match your rhythm" },
              { icon: "🔄", title: "Real-time Sync", desc: "Seamless updates across every device" },
              { icon: "📊", title: "Advanced Analytics", desc: "Deep visibility into your productivity trends" },
              { icon: "👥", title: "Team Collaboration", desc: "Real-time shared projects & task assignment" },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-8 hover:border-indigo-500/40 transition-all duration-300 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Trusted by <span className="text-purple-400">Professionals</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Johnson", role: "Product Manager", text: "Transformed how I manage tasks. The AI predictions save me hours weekly.", rating: 5 },
              { name: "Michael Chen", role: "Software Engineer", text: "Best task tool in years — the AI is genuinely useful.", rating: 5 },
              { name: "Elena Rodriguez", role: "Marketing Director", text: "Team productivity up 40% thanks to the analytics.", rating: 5 },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-purple-500/40 transition-all"
              >
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, idx) => (
                    <svg key={idx} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 italic mb-6">“{t.text}”</p>
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-indigo-400 text-sm">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-black/15">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            How <span className="text-indigo-400">TaskMestry</span> Works
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            Simple, fast, powerful — get started in minutes
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Sign up and connect your calendars & tools" },
              { step: "02", title: "Add Tasks", desc: "Enter manually or import from anywhere" },
              { step: "03", title: "Let AI Optimize", desc: "AI analyzes and builds your perfect schedule" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-8 hover:border-indigo-500/40 transition-all group"
              >
                <div className="text-5xl font-bold text-indigo-500/30 mb-4 group-hover:text-indigo-500/70 transition-colors">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-indigo-900/20 to-purple-900/20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8">
            Ready to Transform<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Productivity?
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12">
            Join thousands of professionals who work smarter with TaskMestry.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link
              href="/register"
              className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-xl shadow-indigo-900/40 hover:scale-105"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/ai-assistant"
              className="px-10 py-5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-medium text-lg hover:bg-white/15 transition-all hover:scale-105"
            >
              Schedule Demo →
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/40 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">
                Task<span className="text-indigo-400">Mestry</span>
              </h3>
              <p className="text-gray-400 mb-6">
                AI-powered task management that actually works.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="/ai-assistant" className="hover:text-white transition">AI Assistant</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} TaskMestry. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}