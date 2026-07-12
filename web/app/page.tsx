"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  MessageCircle,
  Shield,
  Zap,
  Globe,
  Users,
  Lock,
  Smartphone,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";
import { useRef } from "react";

const features = [
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    desc: "Instant messaging with delivery receipts, typing indicators, and read status.",
  },
  {
    icon: Users,
    title: "Group Chats",
    desc: "Create groups with up to 256 members for team or family conversations.",
  },
  {
    icon: Shield,
    title: "End-to-End Privacy",
    desc: "Row-level security ensures only you and your chat members see your messages.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Powered by Supabase Realtime — messages appear instantly across all devices.",
  },
  {
    icon: Globe,
    title: "Cross Platform",
    desc: "Available on web and mobile (Flutter) with the same great experience.",
  },
  {
    icon: Lock,
    title: "Secure Auth",
    desc: "Sign in with email/password or phone OTP — your choice.",
  },
];

const plans = [
  { text: "Free forever" },
  { text: "Unlimited chats" },
  { text: "Group messaging" },
  { text: "File sharing" },
  { text: "Phone & email auth" },
  { text: "Open source" },
];

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 mesh-gradient dark:opacity-40 pointer-events-none" />
      <div className="fixed top-20 left-10 w-72 h-72 bg-bruce-500/10 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-bruce-600/5 rounded-full blur-3xl animate-float-slow pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-bruce-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-bruce-400 to-bruce-700 flex items-center justify-center shadow-lg shadow-bruce-500/30">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Chat Bruce
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost hidden sm:block">
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary flex items-center gap-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative pt-32 pb-20 px-6"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8"
          >
            <Sparkles className="w-4 h-4 text-bruce-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Free &amp; Open Source
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight"
          >
            <span className="text-gray-900 dark:text-white">Chat</span>{" "}
            <span className="premium-gradient-text">Bruce</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            A modern, real-time messaging app with WhatsApp-class features.
            <br className="hidden md:block" />
            Free, open-source, and built for everyone.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/signup"
              className="btn-primary text-base px-8 py-4 flex items-center gap-2 shadow-glow"
            >
              Start Chatting Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-ghost text-base px-8 py-4">
              Sign In
            </Link>
          </motion.div>

          {/* Floating preview card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 mx-auto max-w-2xl"
          >
            <div className="glass-strong rounded-[2rem] p-6 shadow-float border border-white/30 dark:border-white/10 relative overflow-hidden">
              {/* Window controls */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
                <span className="ml-2 text-xs text-gray-400 font-medium">
                  Chat Bruce
                </span>
              </div>

              {/* Chat messages */}
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex justify-end"
                >
                  <div className="bg-gradient-to-br from-bruce-500 to-bruce-700 text-white px-5 py-3 rounded-2xl rounded-br-md text-sm max-w-xs shadow-lg shadow-bruce-500/20">
                    Hey! Have you tried Chat Bruce yet?
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 }}
                  className="flex justify-start"
                >
                  <div className="glass px-5 py-3 rounded-2xl rounded-bl-md text-sm max-w-xs text-gray-800 dark:text-gray-200">
                    Yes! The real-time messaging is incredible
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex justify-end"
                >
                  <div className="bg-gradient-to-br from-bruce-500 to-bruce-700 text-white px-5 py-3 rounded-2xl rounded-br-md text-sm max-w-xs shadow-lg shadow-bruce-500/20">
                    Right? And it&apos;s completely free!
                  </div>
                </motion.div>
              </div>

              {/* Typing indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="flex items-center gap-2 mt-3 text-xs text-gray-400"
              >
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-bruce-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-bruce-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-bruce-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                someone is typing...
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Everything you need
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
              Built with modern technologies for the best messaging experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass-card group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-bruce-400 to-bruce-600 flex items-center justify-center mb-5 shadow-lg shadow-bruce-500/20 group-hover:shadow-glow transition-shadow duration-300">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-strong rounded-[2rem] p-12 text-center relative overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 mesh-gradient opacity-50 pointer-events-none" />

            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-bruce-400 to-bruce-700 flex items-center justify-center mx-auto mb-6 shadow-glow">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Start chatting today
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Join Chat Bruce for free. No credit card required.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto mb-8">
                {plans.map((p) => (
                  <div
                    key={p.text}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <Check className="w-4 h-4 text-bruce-500 shrink-0" />
                    {p.text}
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2 shadow-glow"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 dark:border-white/5 py-8 text-center text-sm text-gray-500 dark:text-gray-600">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-bruce-400 to-bruce-600 flex items-center justify-center">
              <MessageCircle className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Chat Bruce
            </span>
          </div>
          <p>Built with Next.js, Supabase &amp; Flutter</p>
        </div>
      </footer>
    </div>
  );
}
