"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";

const mockContacts = [
  { id: "1", name: "Alice Johnson", phone: "+1 555-0101", online: true },
  { id: "2", name: "Bob Smith", phone: "+1 555-0102", online: false },
  { id: "3", name: "Carol Williams", phone: "+1 555-0103", online: true },
  { id: "4", name: "David Brown", phone: "+1 555-0104", online: false },
  { id: "5", name: "Eve Davis", phone: "+1 555-0105", online: true },
];

export default function ContactsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockContacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 glass border-b border-white/10 dark:border-white/5">
        <h1 className="text-xl font-bold mb-3">Contacts</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-2xl glass bg-white/40 dark:bg-black/20 outline-none focus:ring-2 focus:ring-bruce-500/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="w-12 h-12" />}
            title="No contacts found"
            description="Try a different search"
          />
        ) : (
          filtered.map((contact, i) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-2xl hover:glass transition-all cursor-pointer group"
            >
              <Avatar name={contact.name} size="lg" online={contact.online} />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold">{contact.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {contact.phone}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Chat
              </Button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
