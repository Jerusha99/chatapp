"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Flag,
  Megaphone,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/cn";

const navItems = [
  {
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "Overview",
  },
  {
    href: "/dashboard/users",
    icon: <Users className="w-5 h-5" />,
    label: "Users",
  },
  {
    href: "/dashboard/reports",
    icon: <Flag className="w-5 h-5" />,
    label: "Reports",
  },
  {
    href: "/dashboard/broadcast",
    icon: <Megaphone className="w-5 h-5" />,
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
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-2 border-bruce-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName =
    user.user_metadata?.display_name || user.email || "Admin";

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--chat-bg)] dark:bg-[var(--chat-bg-dark)]">
      {/* Sidebar */}
      <aside className="w-64 h-full flex flex-col glass-dark border-r border-white/10">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-bruce-500 to-bruce-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Chat Bruce</h2>
              <p className="text-xs text-white/50">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm",
                  isActive
                    ? "bg-bruce-500/20 text-bruce-400 font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar
              name={displayName}
              size="sm"
              src={user.user_metadata?.avatar_url}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
            </div>
            <ThemeToggle className="!w-7 !h-7" />
          </div>
          <button
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-white/50 hover:text-red-400 hover:bg-white/5 transition-all text-sm mt-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

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
