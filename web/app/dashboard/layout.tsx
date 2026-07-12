"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Flag,
  Megaphone,
  LogOut,
  Shield,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/cn";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Overview",
  },
  {
    href: "/dashboard/users",
    icon: Users,
    label: "Users",
  },
  {
    href: "/dashboard/reports",
    icon: Flag,
    label: "Reports",
  },
  {
    href: "/dashboard/broadcast",
    icon: Megaphone,
    label: "Broadcast",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    async function checkAdmin() {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user!.id)
        .single();
      if (!data?.is_admin) {
        router.push("/chat");
      }
    }
    checkAdmin();
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center mesh-gradient dark:opacity-40">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-bruce-400 to-bruce-700 flex items-center justify-center shadow-glow animate-pulse">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="w-8 h-8 border-2 border-bruce-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const displayName =
    user.user_metadata?.display_name || user.email || "Admin";

  return (
    <div className="flex h-screen overflow-hidden mesh-gradient dark:opacity-40">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-full flex flex-col glass-dark relative overflow-hidden shrink-0"
      >
        {/* Header */}
        <div className="px-4 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-bruce-400 to-bruce-700 flex items-center justify-center shrink-0 shadow-lg shadow-bruce-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="min-w-0"
                >
                  <h2 className="text-sm font-bold text-white truncate">
                    Chat Bruce
                  </h2>
                  <p className="text-xs text-white/40">Admin Dashboard</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 text-sm group relative",
                  isActive
                    ? "bg-bruce-500/15 text-bruce-400"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-bruce-500 rounded-r-full"
                    transition={{ duration: 0.3 }}
                  />
                )}
                <item.icon className="w-5 h-5 shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-medium truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar
              name={displayName}
              size="sm"
              src={user.user_metadata?.avatar_url}
            />
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-xs font-medium text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-white/30 truncate">
                    {user.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <ThemeToggle className="!w-8 !h-8" />
            {!collapsed && (
              <button
                onClick={async () => {
                  await signOut();
                  router.push("/login");
                }}
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/5 transition-all text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 right-0 translate-x-1/2 w-6 h-6 rounded-full glass-dark border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors z-10"
        >
          <ChevronLeft
            className={cn(
              "w-3 h-3 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
