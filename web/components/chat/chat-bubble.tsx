"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Reply,
  Forward,
  Copy,
  Edit,
  Trash2,
  MapPin,
  Phone,
  FileText,
  Volume2,
  Play,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { MessageStatus } from "@/components/chat/message-status";

type MessageType = "text" | "image" | "video" | "voice" | "document" | "location" | "contact" | "system";

interface ChatBubbleProps {
  id: string;
  type: MessageType;
  content: string;
  timestamp: string;
  status?: "sending" | "sent" | "delivered" | "read";
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string | null;
  replyTo?: { content: string; senderName: string } | null;
  mediaUrl?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  locationLat?: number;
  locationLng?: number;
  contactName?: string;
  contactPhone?: string;
  reactions?: Record<string, string[]>;
}

export function ChatBubble({
  id,
  type,
  content,
  timestamp,
  status = "sent",
  isOwn,
  senderName,
  senderAvatar,
  replyTo,
  mediaUrl,
  mediaWidth,
  mediaHeight,
  locationLat,
  locationLng,
  contactName,
  contactPhone,
  reactions,
}: ChatBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);

  if (type === "system") {
    return (
      <div className="flex justify-center my-3">
        <span className="text-[11px] text-white/40 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
          {content}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "flex gap-2 max-w-[70%] group",
        isOwn ? "ml-auto" : "mr-auto"
      )}
    >
      {!isOwn && senderAvatar && (
        <div className="self-end mb-1">
          <Avatar src={senderAvatar} size="sm" />
        </div>
      )}
      <div className={cn("relative", isOwn ? "order-1" : "order-2")}>
        {senderName && !isOwn && (
          <p className="text-[11px] text-bruce-400 font-semibold mb-1 ml-3">
            {senderName}
          </p>
        )}

        {replyTo && (
          <div
            className={cn(
              "mb-1 px-3 py-2 rounded-xl text-xs border-l-4",
              isOwn
                ? "border-white/30 bg-white/5"
                : "border-bruce-400/50 bg-white/5"
            )}
          >
            <p className="font-semibold truncate text-white/80">{replyTo.senderName}</p>
            <p className="truncate text-white/40">{replyTo.content}</p>
          </div>
        )}

        <div
          className={cn(
            "relative px-4 py-2.5",
            isOwn
              ? "bg-gradient-to-br from-bruce-500 to-bruce-700 text-white rounded-2xl rounded-br-md shadow-lg shadow-bruce-500/10"
              : "bg-white/10 text-white/90 rounded-2xl rounded-bl-md border border-white/5"
          )}
        >
          <div className="min-w-[60px]">
            {type === "image" && mediaUrl && (
              <div className="mb-1 -mx-4 -mt-2.5 rounded-t-2xl overflow-hidden">
                <img
                  src={mediaUrl}
                  alt="Image"
                  className="w-full object-cover max-h-64"
                  style={
                    mediaWidth && mediaHeight
                      ? { aspectRatio: `${mediaWidth}/${mediaHeight}` }
                      : undefined
                  }
                  loading="lazy"
                />
              </div>
            )}
            {type === "video" && mediaUrl && (
              <div className="relative mb-1 -mx-4 -mt-2.5 rounded-t-2xl overflow-hidden">
                <img
                  src={mediaUrl}
                  alt="Video thumbnail"
                  className="w-full object-cover max-h-48"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                </div>
              </div>
            )}
            {type === "voice" && (
              <div className="flex items-center gap-2 min-w-[150px]">
                <Volume2 className="w-4 h-4 opacity-60" />
                <div className="flex-1 h-1 rounded-full bg-white/20">
                  <div className="w-1/2 h-full rounded-full bg-white/50" />
                </div>
                <span className="text-[10px] opacity-50">0:12</span>
              </div>
            )}
            {type === "document" && (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 opacity-70" />
                </div>
                <div>
                  <p className="text-sm font-medium truncate max-w-[180px]">
                    {content}
                  </p>
                  <p className="text-[10px] opacity-50">
                    {mediaUrl?.split(".").pop()?.toUpperCase()}
                  </p>
                </div>
              </div>
            )}
            {type === "location" && (
              <div>
                <div className="flex items-center gap-1.5 text-sm font-medium mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                </div>
                <a
                  href={`https://maps.google.com/?q=${locationLat},${locationLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline opacity-70 hover:opacity-100"
                >
                  {locationLat?.toFixed(4)}, {locationLng?.toFixed(4)}
                </a>
              </div>
            )}
            {type === "contact" && (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 opacity-70" />
                </div>
                <div>
                  <p className="text-sm font-medium">{contactName}</p>
                  <p className="text-[10px] opacity-50">{contactPhone}</p>
                </div>
              </div>
            )}
            {type === "text" && (
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {content}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1 justify-end">
            <span className="text-[10px] opacity-40">
              {format(new Date(timestamp), "h:mm a")}
            </span>
            {isOwn && <MessageStatus status={status} />}
          </div>

          {reactions && Object.keys(reactions).length > 0 && (
            <div
              className={cn(
                "absolute -bottom-3 flex gap-0.5 px-1.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10",
                isOwn ? "right-2" : "left-2"
              )}
            >
              {Object.entries(reactions).map(([emoji, users]) => (
                <span key={emoji} className="text-xs" title={users.join(", ")}>
                  {emoji}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className={cn(
            "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl",
            isOwn ? "-left-8" : "-right-8",
            "hover:bg-white/10 text-white/40"
          )}
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div
              className={cn(
                "absolute top-0 z-50 glass-dark rounded-2xl p-1.5 shadow-float min-w-[160px]",
                isOwn ? "left-0" : "right-0"
              )}
            >
              {[
                { icon: Reply, label: "Reply" },
                { icon: Forward, label: "Forward" },
                { icon: Copy, label: "Copy" },
                ...(isOwn ? [{ icon: Edit, label: "Edit" }] : []),
                ...(isOwn ? [{ icon: Trash2, label: "Delete" }] : []),
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
