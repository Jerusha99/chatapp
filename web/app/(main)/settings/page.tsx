"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Moon,
  Info,
  LogOut,
  ChevronRight,
  Shield,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

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

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
        checked
          ? "bg-gradient-to-r from-bruce-500 to-bruce-600"
          : "neu-pressed"
      }`}
    >
      <motion.div
        className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md"
        animate={{ left: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [notifications, setNotifications] = useState({
    messages: true,
    sound: true,
    vibration: true,
    groupInvites: true,
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOut();
      toast.success("Logged out");
      router.push("/login");
    } catch {
      toast.error("Failed to logout");
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  }

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-lg mx-auto p-6 space-y-6"
      >
        <motion.h1 variants={itemVariants} className="text-xl font-bold">
          Settings
        </motion.h1>

        {/* Notifications */}
        <motion.div
          variants={itemVariants}
          className="glass rounded-3xl p-5 dark:bg-white/5"
        >
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-bruce-500" />
            <h2 className="text-sm font-semibold">Notifications</h2>
          </div>
          <div className="space-y-4">
            {(
              [
                ["messages", "New Messages"],
                ["sound", "Sound"],
                ["vibration", "Vibration"],
                ["groupInvites", "Group Invites"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {label}
                </span>
                <Toggle
                  checked={notifications[key]}
                  onChange={() => toggleNotification(key)}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div
          variants={itemVariants}
          className="glass rounded-3xl p-5 dark:bg-white/5"
        >
          <div className="flex items-center gap-3 mb-4">
            <Moon className="w-5 h-5 text-bruce-500" />
            <h2 className="text-sm font-semibold">Appearance</h2>
          </div>
          <div className="space-y-3">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-sm ${
                  theme === t
                    ? "bg-bruce-500/10 text-bruce-600 dark:text-bruce-400 font-medium ring-1 ring-bruce-500/30"
                    : "hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="capitalize">{t}</span>
                {theme === t && (
                  <div className="w-2 h-2 rounded-full bg-bruce-500" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          variants={itemVariants}
          className="glass rounded-3xl p-5 dark:bg-white/5"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-bruce-500" />
            <h2 className="text-sm font-semibold">Privacy & Security</h2>
          </div>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-gray-500" />
                <span>Two-Factor Authentication</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-gray-500" />
                <span>Blocked Users</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          variants={itemVariants}
          className="glass rounded-3xl p-5 dark:bg-white/5"
        >
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-bruce-500" />
            <h2 className="text-sm font-semibold">About</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="text-gray-900 dark:text-gray-100">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Build</span>
              <span className="text-gray-900 dark:text-gray-100">
                2024.07
              </span>
            </div>
            <div className="flex justify-between">
              <span>Account</span>
              <span className="text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                {user?.email}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={itemVariants} className="space-y-3 pb-6">
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full text-center text-sm text-red-500 hover:text-red-600 transition-colors py-2"
          >
            Delete Account
          </button>
        </motion.div>
      </motion.div>

      {/* Logout Modal */}
      <Modal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Log Out"
      >
        <p className="text-sm text-gray-300 mb-6">
          Are you sure you want to log out?
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLogoutModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={loggingOut}
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <p className="text-sm text-gray-300 mb-4">
          This action is irreversible. All your data will be permanently
          deleted.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              toast.error("Please contact support to delete your account");
              setShowDeleteModal(false);
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
