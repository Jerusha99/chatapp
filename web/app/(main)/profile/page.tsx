"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Save, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { usersApi } from "@/lib/api/users";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await usersApi.getMe();
        setDisplayName(data.displayName || user?.user_metadata?.display_name || "");
        setBio(data.bio || user?.user_metadata?.bio || "");
        setAvatarUrl(data.avatarUrl || user?.user_metadata?.avatar_url || null);
      } catch {
        setDisplayName(user?.user_metadata?.display_name || "");
        setBio(user?.user_metadata?.bio || "");
        setAvatarUrl(user?.user_metadata?.avatar_url || null);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/${user?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);
      toast.success("Avatar uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (displayName.trim().length < 2) {
      toast.error("Display name must be at least 2 characters");
      return;
    }

    setSaving(true);
    try {
      await usersApi.updateMe({
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarUrl,
      });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col p-6 space-y-6">
        <div className="h-8 w-32 rounded-2xl bg-white/10 animate-pulse" />
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse" />
          <div className="h-10 w-64 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-20 w-full max-w-md rounded-2xl bg-white/10 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-lg mx-auto p-6 space-y-5"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Edit Profile
          </h1>
        </motion.div>

        {/* Avatar */}
        <motion.div variants={itemVariants} className="glass-card">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <Avatar
                src={avatarUrl}
                name={displayName}
                size="xl"
                className="w-24 h-24"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Click avatar to upload &bull; Max 5MB
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div variants={itemVariants} className="glass-card space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              maxLength={50}
              className="input-glass"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={300}
              rows={4}
              className="input-glass resize-none"
            />
            <p className="mt-1 text-xs text-gray-400 text-right">
              {bio.length}/300
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="input-glass opacity-60 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Phone
            </label>
            <input
              type="text"
              value={user?.phone || user?.user_metadata?.phone || "Not set"}
              disabled
              className="input-glass opacity-60 cursor-not-allowed"
            />
          </div>
        </motion.div>

        {/* Save */}
        <motion.div variants={itemVariants} className="flex justify-end pb-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 min-w-[140px] justify-center"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
