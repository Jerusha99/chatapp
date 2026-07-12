"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Users, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Contact {
  id: string;
  display_name: string;
  avatar_url: string | null;
  email: string;
  is_online: boolean;
}

export default function ContactsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, email, is_online")
      .order("display_name");

    if (data) setContacts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const filtered = contacts.filter((c) =>
    c.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 py-5 border-b border-white/5">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          Contacts
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="input-glass pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-14 h-14 rounded-full bg-white/10 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
                  <div className="h-3 w-24 rounded bg-white/5 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-sm text-white/40 font-medium">No contacts found</p>
            <p className="text-xs text-white/20 mt-1">Try a different search</p>
          </div>
        ) : (
          filtered.map((contact, i) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
            >
              <Avatar
                name={contact.display_name}
                src={contact.avatar_url}
                size="lg"
                online={contact.is_online}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {contact.display_name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {contact.email}
                </p>
              </div>
              <button
                onClick={() => router.push("/chat")}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-white/5 hover:bg-bruce-500/20 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-bruce-400" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
