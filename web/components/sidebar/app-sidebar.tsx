"use client";

import { usePathname } from "next/navigation";
import { MessageCircle, Users, User, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NavItem } from "@/components/sidebar/nav-item";
import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/cn";

interface AppSidebarProps {
  className?: string;
  children?: React.ReactNode;
}

export function AppSidebar({ className, children }: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const displayName =
    user?.user_metadata?.display_name || user?.email || "User";

  const navItems = [
    { href: "/chat", icon: <MessageCircle className="w-5 h-5" />, label: "Chats" },
    { href: "/contacts", icon: <Users className="w-5 h-5" />, label: "Contacts" },
    { href: "/profile", icon: <User className="w-5 h-5" />, label: "Profile" },
    { href: "/settings", icon: <Settings className="w-5 h-5" />, label: "Settings" },
  ];

  return (
    <div
      className={cn(
        "w-[var(--sidebar-width)] h-full flex flex-col glass border-r border-white/10 dark:border-white/5",
        className
      )}
    >
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 dark:border-white/5">
        <Avatar
          name={displayName}
          size="md"
          src={user?.user_metadata?.avatar_url}
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
            {displayName}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user?.email}
          </p>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={pathname.startsWith(item.href)}
          />
        ))}
      </nav>

      {children && (
        <div className="p-3 border-t border-white/10 dark:border-white/5">
          {children}
        </div>
      )}
    </div>
  );
}
