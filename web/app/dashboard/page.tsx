"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  MessageCircle,
  Activity,
  HardDrive,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

function AnimatedCounter({ value }: { value: number }) {
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

  return <>{displayed.toLocaleString()}</>;
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
        supabase
          .from("messages")
          .select("media_size")
          .not("media_size", "is", null),
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
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-10 w-32 rounded-2xl bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 rounded-3xl bg-white/10 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-72 rounded-3xl bg-white/10 animate-pulse" />
          <div className="h-72 rounded-3xl bg-white/10 animate-pulse" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      value: stats.totalUsers,
      label: "Total Users",
      color: "from-bruce-500 to-bruce-600",
      glowColor: "shadow-bruce-500/20",
      trend: "+12%",
      trendUp: true,
    },
    {
      icon: MessageCircle,
      value: stats.activeChats,
      label: "Active Chats",
      color: "from-emerald-500 to-emerald-600",
      glowColor: "shadow-emerald-500/20",
      trend: "+8%",
      trendUp: true,
    },
    {
      icon: Activity,
      value: stats.messagesToday,
      label: "Messages Today",
      color: "from-amber-500 to-amber-600",
      glowColor: "shadow-amber-500/20",
      trend: "+23%",
      trendUp: true,
    },
    {
      icon: HardDrive,
      value: 0,
      label: `Storage Used`,
      color: "from-rose-500 to-rose-600",
      glowColor: "shadow-rose-500/20",
      displayValue: stats.storageUsed,
    },
  ];

  return (
    <div className="p-6 space-y-6 relative">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-bruce-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, here&apos;s what&apos;s happening today.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl px-4 py-2.5 flex items-center gap-2.5"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-white">
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
            className="stat-card group cursor-default"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ${card.glowColor}`}
              >
                <card.icon className="w-5 h-5 text-white" />
              </div>
              {card.trend && (
                <div
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    card.trendUp
                      ? "text-emerald-500"
                      : "text-rose-500"
                  }`}
                >
                  {card.trendUp ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {card.trend}
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {card.displayValue ? (
                card.displayValue
              ) : (
                <AnimatedCounter value={card.value} />
              )}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
        {/* Line Chart */}
        <motion.div variants={itemVariants} className="glass-card">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-bruce-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-bruce-500" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Messages (Last 30 Days)
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={messagesPerDay}>
                <defs>
                  <linearGradient
                    id="bruceLineGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(128,128,128,0.1)"
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
                    background: "rgba(15,15,25,0.9)",
                    border: "none",
                    borderRadius: "1rem",
                    color: "#fff",
                    backdropFilter: "blur(20px)",
                    fontSize: 12,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#8b5cf6",
                    strokeWidth: 0,
                    stroke: "#fff",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div variants={itemVariants} className="glass-card">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-bruce-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-bruce-500" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Message Types
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={messageTypes}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(128,128,128,0.1)"
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
                    background: "rgba(15,15,25,0.9)",
                    border: "none",
                    borderRadius: "1rem",
                    color: "#fff",
                    backdropFilter: "blur(20px)",
                    fontSize: 12,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
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
