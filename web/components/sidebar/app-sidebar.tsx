"use client";

import { usePathname } from "next/navigation";
import {
  MessageCircle,
  Users,
  User,
  Settings,
  LogOut,
  Plus,
  Search,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NavItem } from "@/components/sidebar/nav-item";
import { useAuth } from "@/lib/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

interface AppSidebarProps {
  className?: string;
  children?: React.ReactNode;
}

export function AppSidebar({ className, children }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const displayName =
    user?.user_metadata?.display_name || user?.email || "User";

  const navItems = [
    { href: "/chat", icon: MessageCircle, label: "Chats" },
    { href: "/contacts", icon: Users, label: "Contacts" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div
      className={cn(
        "w-[var(--sidebar-width)] h-full flex flex-col glass-dark relative overflow-hidden",
        className
      )}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-bruce-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-white tracking-tight">
            Messages
          </h1>
          <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <Plus className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white text-sm placeholder-white/30 outline-none focus:ring-1 focus:ring-bruce-500/30 focus:border-bruce-500/20 transition-all"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={<item.icon className="w-5 h-5" />}
            label={item.label}
            active={
              item.href === "/chat"
                ? pathname.startsWith("/chat") || pathname.startsWith("/contacts") || pathname.startsWith("/profile") || pathname.startsWith("/settings")
                  ? pathname.startsWith(item.href)
                  : pathname === "/"
                : pathname.startsWith(item.href)
            }
          />
        ))}
      </nav>

      {/* User profile */}
      <div className="relative px-3 pb-3">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/5">
          <Avatar
            name={displayName}
            size="sm"
            src={user?.user_metadata?.avatar_url}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-white/30 truncate">
              {user?.email}
            </p>
          </div>
          <ThemeToggle className="!w-7 !h-7" />
        </div>
      </div>

      {children}
    </div>
  );
}
