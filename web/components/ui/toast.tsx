"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "1rem",
          background: "rgba(0,0,0,0.8)",
          color: "#fff",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
        },
        success: {
          iconTheme: { primary: "#8b5cf6", secondary: "#fff" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#fff" },
        },
      }}
    />
  );
}
