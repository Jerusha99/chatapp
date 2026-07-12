"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flag,
  CheckCircle,
  Eye,
  Ban,
  Clock,
  Filter,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

type ReportStatus = "pending" | "reviewed" | "resolved";

interface Report {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reporter_avatar: string | null;
  reported_user_id: string;
  reported_user_name: string;
  reported_content: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
}

const tabs: { key: ReportStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "reviewed", label: "Reviewed" },
  { key: "resolved", label: "Resolved" },
];

const statusColors: Record<ReportStatus, string> = {
  pending: "bg-amber-500/10 text-amber-500",
  reviewed: "bg-blue-500/10 text-blue-500",
  resolved: "bg-green-500/10 text-green-500",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<ReportStatus | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("reports")
      .select(
        `
        id,
        reporter_id,
        reported_user_id,
        reported_content,
        reason,
        status,
        created_at,
        reporter:profiles!reporter_id(display_name, avatar_url),
        reported:profiles!reported_user_id(display_name)
      `
      )
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;

    const mapped: Report[] = (data || []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      reporter_id: r.reporter_id as string,
      reporter_name:
        (r.reporter as Record<string, string>)?.display_name || "Unknown",
      reporter_avatar:
        (r.reporter as Record<string, string>)?.avatar_url || null,
      reported_user_id: r.reported_user_id as string,
      reported_user_name:
        (r.reported as Record<string, string>)?.display_name || "Unknown",
      reported_content: (r.reported_content as string) || "",
      reason: (r.reason as string) || "",
      status: (r.status as ReportStatus) || "pending",
      created_at: r.created_at as string,
    }));

    setReports(mapped);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  async function updateStatus(reportId: string, status: ReportStatus) {
    setUpdatingId(reportId);
    const supabase = createClient();
    await supabase.from("reports").update({ status }).eq("id", reportId);
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r))
    );
    setUpdatingId(null);
  }

  async function banUser(userId: string) {
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ is_banned: true })
      .eq("id", userId);
  }

  return (
    <div className="p-6 space-y-6">
      <motion.h1
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-gray-900 dark:text-white"
      >
        Reports & Moderation
      </motion.h1>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === tab.key
                ? "bg-bruce-500 text-white shadow-lg shadow-bruce-500/25"
                : "glass text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Reports List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full ml-auto" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))
          : reports.length === 0 && (
              <div className="glass rounded-3xl p-12 text-center">
                <Flag className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No reports found
                </p>
              </div>
            )}

        <AnimatePresence>
          {reports.map((report) => (
            <motion.div
              key={report.id}
              variants={itemVariants}
              layout
              className="glass rounded-3xl p-5 dark:bg-white/5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={report.reporter_name}
                    src={report.reporter_avatar}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {report.reporter_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      reported {report.reported_user_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[report.status]
                    }`}
                  >
                    {report.status}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    {format(new Date(report.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
              </div>

              {report.reason && (
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reason: {report.reason}
                </div>
              )}

              {report.reported_content && (
                <div className="bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    &ldquo;{report.reported_content}&rdquo;
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-1">
                {report.status === "pending" && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={updatingId === report.id}
                      onClick={() => updateStatus(report.id, "reviewed")}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      Mark Reviewed
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={updatingId === report.id}
                      onClick={() => updateStatus(report.id, "resolved")}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      Resolve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => banUser(report.reported_user_id)}
                    >
                      <Ban className="w-3.5 h-3.5 mr-1.5" />
                      Ban User
                    </Button>
                  </>
                )}
                {report.status === "reviewed" && (
                  <Button
                    variant="primary"
                    size="sm"
                    loading={updatingId === report.id}
                    onClick={() => updateStatus(report.id, "resolved")}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Resolve
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
