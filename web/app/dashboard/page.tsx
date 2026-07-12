"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  MessageCircle,
  Activity,
  HardDrive,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function AnimatedCounter({ value, label }: { value: number; label: string }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <p className="text-3xl font-bold text-gray-900 dark:text-white">
      {displayed.toLocaleString()}
    </p>
  );
}

const bruceGradient = ["#8b5cf6", "#a78bfa", "#7c3aed", "#6d28d9", "#c4b5fd"];

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeChats: 0,
    messagesToday: 0,
    storageUsed: "0 MB",
  });
  const [messagesPerDay, setMessagesPerDay] = useState<
    { date: string; count: number }[]
  >([]);
  const [messageTypes, setMessageTypes] = useState<
    { type: string; count: number }[]
  >([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const supabase = createClient();

    const [usersResult, chatsResult, messagesResult, storageResult] =
      await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("chats").select("id", { count: "exact", head: true }),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .gte(
            "created_at",
            new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
          ),
        supabase.from("messages").select("media_size").not("media_size", "is", null),
      ]);

    const totalStorage =
      storageResult.data?.reduce((sum, m) => sum + (m.media_size || 0), 0) || 0;
    const storageStr =
      totalStorage > 1024 * 1024 * 1024
        ? `${(totalStorage / (1024 * 1024 * 1024)).toFixed(1)} GB`
        : totalStorage > 1024 * 1024
        ? `${(totalStorage / (1024 * 1024)).toFixed(1)} MB`
        : `${(totalStorage / 1024).toFixed(1)} KB`;

    setStats({
      totalUsers: usersResult.count || 0,
      activeChats: chatsResult.count || 0,
      messagesToday: messagesResult.count || 0,
      storageUsed: storageStr,
    });

    // Messages per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: dayMessages } = await supabase
      .from("messages")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString());

    const dayMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dayMap[d.toISOString().slice(0, 10)] = 0;
    }
    dayMessages?.forEach((m) => {
      const day = m.created_at.slice(0, 10);
      if (day in dayMap) dayMap[day]++;
    });
    setMessagesPerDay(
      Object.entries(dayMap).map(([date, count]) => ({
        date: date.slice(5),
        count,
      }))
    );

    // Message types
    const { data: types } = await supabase
      .from("messages")
      .select("type")
      .gte("created_at", thirtyDaysAgo.toISOString());
    const typeMap: Record<string, number> = {};
    types?.forEach((m) => {
      typeMap[m.type] = (typeMap[m.type] || 0) + 1;
    });
    setMessageTypes(
      Object.entries(typeMap).map(([type, count]) => ({ type, count }))
    );

    // Online users via presence channel
    const channel = supabase.channel("online-users");
    channel.on("presence", { event: "sync" }, () => {
      setOnlineCount(Object.keys(channel.presenceState()).length || 0);
    });
    await channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: "dashboard",
          online_at: new Date().toISOString(),
        });
      }
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: <Users className="w-6 h-6" />,
      value: stats.totalUsers,
      label: "Total Users",
      color: "from-bruce-500 to-bruce-600",
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      value: stats.activeChats,
      label: "Active Chats",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: <Activity className="w-6 h-6" />,
      value: stats.messagesToday,
      label: "Messages Today",
      color: "from-amber-500 to-amber-600",
    },
    {
      icon: <HardDrive className="w-6 h-6" />,
      value: 0,
      label: `Storage: ${stats.storageUsed}`,
      color: "from-rose-500 to-rose-600",
      displayValue: stats.storageUsed,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          Dashboard Overview
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 glass-dark rounded-2xl px-4 py-2"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-sm font-medium text-white">
            {onlineCount.toLocaleString()} online
          </span>
        </motion.div>
      </div>

      {/* Stat Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            variants={itemVariants}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="glass rounded-3xl p-5 dark:bg-white/5 space-y-3"
          >
            <div
              className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white`}
            >
              {card.icon}
            </div>
            {card.displayValue ? (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.displayValue}
              </p>
            ) : (
              <AnimatedCounter value={card.value} label={card.label} />
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {card.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Line Chart - Messages per Day */}
        <motion.div
          variants={itemVariants}
          className="glass rounded-3xl p-5 dark:bg-white/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-bruce-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Messages (Last 30 Days)
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={messagesPerDay}>
                <defs>
                  <linearGradient id="bruceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(128,128,128,0.15)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(0,0,0,0.8)",
                    border: "none",
                    borderRadius: "1rem",
                    color: "#fff",
                    backdropFilter: "blur(12px)",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#8b5cf6", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart - Message Types */}
        <motion.div
          variants={itemVariants}
          className="glass rounded-3xl p-5 dark:bg-white/5"
        >
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Message Types Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={messageTypes}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(128,128,128,0.15)"
                />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(0,0,0,0.8)",
                    border: "none",
                    borderRadius: "1rem",
                    color: "#fff",
                    backdropFilter: "blur(12px)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {messageTypes.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={bruceGradient[index % bruceGradient.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
