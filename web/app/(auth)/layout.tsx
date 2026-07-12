"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Ambient background */}
      <div className="fixed inset-0 mesh-gradient dark:opacity-40 pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-bruce-500/10 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-bruce-600/5 rounded-full blur-3xl animate-float-slow pointer-events-none" />

      {/* Logo */}
      <Link
        href="/"
        className="fixed top-6 left-6 flex items-center gap-2.5 z-10"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bruce-400 to-bruce-700 flex items-center justify-center shadow-lg shadow-bruce-500/30">
          <MessageCircle className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          Chat Bruce
        </span>
      </Link>

      <div className="w-full max-w-md relative z-10">{children}</div>
    </div>
  );
}
