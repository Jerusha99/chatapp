"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Send,
  Clock,
  Users,
  CheckCircle,
  Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface Broadcast {
  id: string;
  title: string;
  message: string;
  target: string;
  sent_at: string;
  created_by: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardBroadcastPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"all" | "specific">("all");
  const [specificUsers, setSpecificUsers] = useState("");
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [history, setHistory] = useState<Broadcast[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("broadcasts")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(50);
    setHistory((data as Broadcast[]) || []);
    setLoadingHistory(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function handleSend() {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    setSending(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("broadcasts").insert({
        title: title.trim(),
        message: message.trim(),
        target,
        specific_users:
          target === "specific"
            ? specificUsers
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        created_by: user?.id,
        sent_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Broadcast sent successfully");
      setTitle("");
      setMessage("");
      setSpecificUsers("");
      setShowPreview(false);
      fetchHistory();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <motion.h1
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-gray-900 dark:text-white"
      >
        Broadcast & Announcements
      </motion.h1>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Compose */}
        <motion.div
          variants={itemVariants}
          className="glass rounded-3xl p-6 dark:bg-white/5 space-y-5"
        >
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-bruce-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Compose Broadcast
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Broadcast title"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement..."
              rows={5}
              className="w-full px-4 py-2.5 rounded-2xl glass text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-bruce-500/50 dark:bg-black/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Audience
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setTarget("all")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  target === "all"
                    ? "bg-bruce-500/10 text-bruce-600 dark:text-bruce-400 ring-1 ring-bruce-500/30"
                    : "glass text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-white/5"
                }`}
              >
                <Users className="w-4 h-4" />
                All Users
              </button>
              <button
                onClick={() => setTarget("specific")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  target === "specific"
                    ? "bg-bruce-500/10 text-bruce-600 dark:text-bruce-400 ring-1 ring-bruce-500/30"
                    : "glass text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-white/5"
                }`}
              >
                <Clock className="w-4 h-4" />
                Specific Users
              </button>
            </div>
          </div>

          {target === "specific" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                User IDs (comma separated)
              </label>
              <Input
                value={specificUsers}
                onChange={(e) => setSpecificUsers(e.target.value)}
                placeholder="uuid-1, uuid-2, ..."
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-1.5" />
              Preview
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={sending}
              onClick={handleSend}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-1.5" />
              Send Broadcast
            </Button>
          </div>

          {/* Preview */}
          <AnimatePresence>
            {showPreview && (title || message) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Preview
                  </p>
                  <div className="bg-gradient-to-br from-bruce-500 to-bruce-700 rounded-2xl p-4 text-white">
                    {title && (
                      <h3 className="font-semibold mb-1">{title}</h3>
                    )}
                    <p className="text-sm text-white/90">
                      {message || "Your message will appear here..."}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* History */}
        <motion.div
          variants={itemVariants}
          className="glass rounded-3xl p-6 dark:bg-white/5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Broadcast History
          </h2>

          <div className="space-y-3 max-h-[520px] overflow-y-auto">
            {loadingHistory
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2 p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))
              : history.length === 0 && (
                  <div className="text-center py-8">
                    <Megaphone className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No broadcasts sent yet
                    </p>
                  </div>
                )}

            <AnimatePresence>
              {history.map((broadcast) => (
                <motion.div
                  key={broadcast.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {broadcast.title}
                    </h3>
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {broadcast.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {format(
                        new Date(broadcast.sent_at),
                        "MMM d, yyyy h:mm a"
                      )}
                    </span>
                    <span className="text-xs text-bruce-400 capitalize">
                      {broadcast.target}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
