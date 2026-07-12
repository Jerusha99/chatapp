"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Shield, Zap, Globe, Users, Lock } from "lucide-react";

const features = [
  { icon: MessageCircle, title: "Real-time Chat", desc: "Instant messaging with delivery receipts, typing indicators, and read status." },
  { icon: Users, title: "Group Chats", desc: "Create groups with up to 256 members for team or family conversations." },
  { icon: Shield, title: "End-to-End Privacy", desc: "Row-level security ensures only you and your chat members see your messages." },
  { icon: Zap, title: "Lightning Fast", desc: "Powered by Supabase Realtime — messages appear instantly across all devices." },
  { icon: Globe, title: "Cross Platform", desc: "Available on web and mobile (Flutter) with the same great experience." },
  { icon: Lock, title: "Secure Auth", desc: "Sign in with email/password or phone OTP — your choice." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bruce-50 via-white to-bruce-100 dark:from-gray-900 dark:via-bruce-950 dark:to-gray-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bruce-400 to-bruce-600 flex items-center justify-center shadow-lg shadow-bruce-500/25">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Chat Bruce</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-bruce-600 dark:hover:text-bruce-400 transition-colors rounded-xl"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-bruce-500 to-bruce-700 rounded-xl hover:shadow-lg hover:shadow-bruce-500/25 transition-all active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-28 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Chat <span className="bg-gradient-to-r from-bruce-500 to-bruce-700 bg-clip-text text-transparent">Bruce</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A modern, real-time messaging app with WhatsApp-class features.
            Free, open-source, and built for everyone.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-bruce-500 to-bruce-700 rounded-2xl hover:shadow-xl hover:shadow-bruce-500/25 transition-all active:scale-95"
            >
              Start Chatting Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Glass preview card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 mx-auto max-w-3xl"
        >
          <div className="glass rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-gray-400">Chat Bruce</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-bruce-500 to-bruce-700 text-white px-4 py-2.5 rounded-2xl rounded-br-md text-sm max-w-xs">
                  Hey! Have you tried Chat Bruce yet?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white/60 dark:bg-white/10 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm max-w-xs">
                  Yes! The real-time messaging is incredible 🚀
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-bruce-500 to-bruce-700 text-white px-4 py-2.5 rounded-2xl rounded-br-md text-sm max-w-xs">
                  Right? And it&apos;s completely free!
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Everything you need
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="glass rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bruce-400 to-bruce-600 flex items-center justify-center mb-4 shadow-md shadow-bruce-500/20">
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-center text-sm text-gray-500 dark:text-gray-600">
        Chat Bruce &mdash; Built with Next.js, Supabase &amp; Flutter
      </footer>
    </div>
  );
}
