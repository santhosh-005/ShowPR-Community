"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { X, CheckCircle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const styles = {
  success: "border-green-500 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-200",
  error: "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200",
  info: "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    delete timersRef.current[id];
  }, []);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    timersRef.current[id] = setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => removeToast(id), 300);
    }, duration);
    return id;
  }, [removeToast]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;
          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg max-w-sm",
                "transition-all duration-300",
                toast.exiting
                  ? "opacity-0 translate-x-4 scale-95"
                  : "opacity-100 translate-x-0 scale-100",
                styles[toast.type] || styles.info
              )}
              role="alert"
            >
              <Icon className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
