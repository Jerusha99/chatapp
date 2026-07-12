"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Sheet({ open, onClose, children, className }: SheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "relative w-full max-w-lg rounded-t-3xl glass-dark p-6 pb-8 max-h-[70vh] overflow-y-auto",
              className
            )}
          >
            <div className="w-10 h-1 rounded-full bg-white/30 mx-auto mb-4" />
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
