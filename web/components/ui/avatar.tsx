"use client";

import { cn } from "@/lib/cn";
import Image from "next/image";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}

const sizeMap: Record<AvatarSize, { dim: number; text: string }> = {
  sm: { dim: 32, text: "text-xs" },
  md: { dim: 40, text: "text-sm" },
  lg: { dim: 56, text: "text-lg" },
  xl: { dim: 80, text: "text-2xl" },
};

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({
  src,
  alt = "",
  name,
  size = "md",
  online,
  className,
}: AvatarProps) {
  const { dim, text } = sizeMap[size];
  const initials = getInitials(name);

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt || name || "Avatar"}
          width={dim}
          height={dim}
          className="rounded-full object-cover"
          style={{ width: dim, height: dim }}
        />
      ) : (
        <div
          className={cn(
            "rounded-full bg-gradient-to-br from-bruce-400 to-bruce-600 flex items-center justify-center text-white font-semibold",
            text
          )}
          style={{ width: dim, height: dim }}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-900",
            online ? "bg-green-500" : "bg-gray-400",
            size === "sm" ? "w-2 h-2" : size === "md" ? "w-2.5 h-2.5" : "w-3 h-3"
          )}
        />
      )}
    </div>
  );
}
