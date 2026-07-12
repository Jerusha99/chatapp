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
  Image,
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

  const isSystem = type === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {content}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "flex gap-2 max-w-[75%] group",
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
          <p className="text-xs text-bruce-500 font-semibold mb-1 ml-2">
            {senderName}
          </p>
        )}

        {replyTo && (
          <div
            className={cn(
              "mb-1 px-3 py-1.5 rounded-xl text-xs border-l-4",
              isOwn
                ? "border-white/40 bg-white/10"
                : "border-bruce-400 bg-gray-100 dark:bg-gray-800"
            )}
          >
            <p className="font-semibold truncate">{replyTo.senderName}</p>
            <p className="truncate opacity-75">{replyTo.content}</p>
          </div>
        )}

        <div
          className={cn(
            "relative px-4 py-2.5",
            isOwn
              ? "chat-bubble-sent"
              : "chat-bubble-received shadow-sm"
          )}
        >
          <div className="min-w-[60px]">
            {type === "image" && mediaUrl && (
              <div className="mb-1 -mx-4 -mt-2.5 rounded-t-[18px] overflow-hidden">
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
              <div className="relative mb-1 -mx-4 -mt-2.5 rounded-t-[18px] overflow-hidden">
                <img
                  src={mediaUrl}
                  alt="Video thumbnail"
                  className="w-full object-cover max-h-48"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  </div>
                </div>
              </div>
            )}
            {type === "voice" && (
              <div className="flex items-center gap-2 min-w-[150px]">
                <Volume2 className="w-5 h-5 opacity-70" />
                <div className="flex-1 h-1.5 rounded-full bg-white/30 dark:bg-gray-500/30">
                  <div className="w-1/2 h-full rounded-full bg-current opacity-60" />
                </div>
                <span className="text-xs opacity-70">0:12</span>
              </div>
            )}
            {type === "document" && (
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 opacity-70" />
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">
                    {content}
                  </p>
                  <p className="text-xs opacity-70">
                    {mediaUrl?.split(".").pop()?.toUpperCase()}
                  </p>
                </div>
              </div>
            )}
            {type === "location" && (
              <div>
                <div className="flex items-center gap-1 text-sm font-medium mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                </div>
                <a
                  href={`https://maps.google.com/?q=${locationLat},${locationLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline opacity-80 hover:opacity-100"
                >
                  {locationLat?.toFixed(4)}, {locationLng?.toFixed(4)}
                </a>
              </div>
            )}
            {type === "contact" && (
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 opacity-70" />
                <div>
                  <p className="text-sm font-medium">{contactName}</p>
                  <p className="text-xs opacity-70">{contactPhone}</p>
                </div>
              </div>
            )}
            {type === "text" && (
              <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
            )}
          </div>

          <div
            className={cn(
              "flex items-center gap-1 mt-1",
              isOwn ? "justify-end" : "justify-end"
            )}
          >
            <span className="text-[10px] opacity-60">
              {format(new Date(timestamp), "h:mm a")}
            </span>
            {isOwn && <MessageStatus status={status} />}
          </div>

          {reactions && Object.keys(reactions).length > 0 && (
            <div
              className={cn(
                "absolute -bottom-3 flex gap-0.5 px-1.5 py-0.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700",
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
            "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full",
            isOwn ? "-left-8" : "-right-8",
            "hover:bg-black/10 dark:hover:bg-white/10"
          )}
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>

        {showMenu && (
          <div
            className={cn(
              "absolute top-0 z-10 glass-dark rounded-2xl p-1 shadow-xl min-w-[140px]",
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
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white hover:bg-white/10 rounded-xl transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
