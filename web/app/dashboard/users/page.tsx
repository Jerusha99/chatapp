"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Ban,
  CheckCircle,
  Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface UserRecord {
  id: string;
  display_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  is_banned: boolean;
  created_at: string;
  bio: string | null;
}

const PAGE_SIZE = 10;

export default function DashboardUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [togglingBan, setTogglingBan] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search.trim()) {
      query = query.or(
        `display_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    const { data, count } = await query;
    setUsers((data as UserRecord[]) || []);
    setTotal(count || 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function toggleBan(user: UserRecord) {
    setTogglingBan(user.id);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ is_banned: !user.is_banned })
      .eq("id", user.id);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, is_banned: !u.is_banned } : u
      )
    );
    if (selectedUser?.id === user.id) {
      setSelectedUser((prev) =>
        prev ? { ...prev, is_banned: !prev.is_banned } : null
      );
    }
    setTogglingBan(null);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6">
      <motion.h1
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-gray-900 dark:text-white"
      >
        User Management
      </motion.h1>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl glass text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-bruce-500/30 text-sm dark:bg-black/20"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-3xl overflow-hidden dark:bg-white/5"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Phone
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Joined
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-9 h-9 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <Skeleton className="h-4 w-36" />
                      </td>
                      <td className="px-5 py-3 hidden lg:table-cell">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="px-5 py-3 hidden lg:table-cell">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-5 py-3">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </td>
                      <td className="px-5 py-3">
                        <Skeleton className="h-7 w-7 rounded-xl" />
                      </td>
                    </tr>
                  ))
                : users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 hover:bg-white/5 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={user.display_name}
                            src={user.avatar_url}
                            size="sm"
                          />
                          <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[140px]">
                            {user.display_name || "Unnamed"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">
                        {user.email || "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                        {user.phone || "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.is_banned
                              ? "bg-red-500/10 text-red-500"
                              : "bg-green-500/10 text-green-500"
                          }`}
                        >
                          {user.is_banned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => toggleBan(user)}
                            disabled={togglingBan === user.id}
                            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            {user.is_banned ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Ban className="w-4 h-4 text-red-500" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-medium transition-colors ${
                      page === pageNum
                        ? "bg-bruce-500 text-white"
                        : "hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Profile Modal */}
      <Modal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Profile"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar
                name={selectedUser.display_name}
                src={selectedUser.avatar_url}
                size="lg"
              />
              <div>
                <h3 className="font-semibold text-white">
                  {selectedUser.display_name || "Unnamed"}
                </h3>
                <p className="text-sm text-gray-400">{selectedUser.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {selectedUser.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone</span>
                  <span className="text-gray-200">{selectedUser.phone}</span>
                </div>
              )}
              {selectedUser.bio && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Bio</span>
                  <span className="text-gray-200 max-w-[200px] text-right">
                    {selectedUser.bio}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Joined</span>
                <span className="text-gray-200">
                  {format(new Date(selectedUser.created_at), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span
                  className={
                    selectedUser.is_banned ? "text-red-400" : "text-green-400"
                  }
                >
                  {selectedUser.is_banned ? "Banned" : "Active"}
                </span>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant={selectedUser.is_banned ? "primary" : "danger"}
                size="sm"
                onClick={() => toggleBan(selectedUser)}
                loading={togglingBan === selectedUser.id}
              >
                {selectedUser.is_banned ? "Unban User" : "Ban User"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
