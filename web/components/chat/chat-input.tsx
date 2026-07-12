"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Paperclip, Smile, Mic, Image, FileText, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { mediaApi } from "@/lib/api/media";

interface ChatInputProps {
  onSend: (content: string, type?: string, mediaUrl?: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({ onSend, onTyping, disabled, className }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ file: File; preview?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const preview = URL.createObjectURL(file);
      setPreviewFile({ file, preview });
    } else {
      setPreviewFile({ file });
    }
    e.target.value = "";
  }, []);

  const handleUploadAndSend = useCallback(async () => {
    if (!previewFile) return;

    setUploading(true);
    try {
      const file = previewFile.file;
      const isImage = file.type.startsWith("image/");
      const mediaUrl = await mediaApi.uploadFile(file);
      onSend(isImage ? "" : file.name, isImage ? "image" : "document", mediaUrl);
      setPreviewFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }, [previewFile, onSend]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (previewFile) {
        handleUploadAndSend();
        return;
      }
      if (!message.trim() || disabled) return;
      onSend(message.trim());
      setMessage("");
      if (inputRef.current) inputRef.current.focus();
    },
    [message, disabled, onSend, previewFile, handleUploadAndSend]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("border-t border-white/10 dark:border-white/5", className)}>
      {previewFile && (
        <div className="px-4 pt-3 flex items-center gap-3 glass">
          {previewFile.preview ? (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden">
              <img
                src={previewFile.preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => {
                  if (previewFile.preview) URL.revokeObjectURL(previewFile.preview);
                  setPreviewFile(null);
                }}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 dark:bg-white/5">
              <FileText className="w-5 h-5 text-bruce-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                {previewFile.file.name}
              </span>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 glass">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,application/pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              onTyping?.();
            }}
            onKeyDown={handleKeyDown}
            placeholder={uploading ? "Uploading..." : "Type a message..."}
            disabled={disabled || uploading}
            className="w-full px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-black/30 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none text-sm"
          />
        </div>

        <button
          type="button"
          className="shrink-0 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
        >
          <Smile className="w-5 h-5" />
        </button>

        <button
          type="submit"
          disabled={(!message.trim() && !previewFile) || disabled || uploading}
          className="shrink-0 p-2.5 rounded-full bg-gradient-to-r from-bruce-500 to-bruce-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-bruce-500/25 active:scale-95"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
