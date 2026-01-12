/**
 * SaveStatus Component
 *
 * Displays the current save state in the editor header.
 * Shows: Saved • X min ago, Saving…, Offline, Conflict detected
 */

"use client";

import { useEffect, useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { Cloud, CloudOff, Loader2, AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type SaveState = "saved" | "saving" | "offline" | "conflict" | "unsaved";

interface SaveStatusProps {
  lastSavedAt?: Date | null;
  saveState?: SaveState;
  className?: string;
}

export function SaveStatus({ lastSavedAt, saveState: externalState, className }: SaveStatusProps) {
  const { isSaving, isDirty } = useEditorStore();
  const [isOnline, setIsOnline] = useState(true);
  const [timeAgo, setTimeAgo] = useState<string>("");

  // Determine save state from props or store
  const saveState: SaveState = externalState ?? (
    !isOnline ? "offline" :
    isSaving ? "saving" :
    isDirty ? "unsaved" :
    "saved"
  );

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Update time ago string
  useEffect(() => {
    if (!lastSavedAt) {
      setTimeAgo("");
      return;
    }

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastSavedAt.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (seconds < 10) {
        setTimeAgo("just now");
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`);
      } else if (minutes < 60) {
        setTimeAgo(`${minutes} min ago`);
      } else if (hours < 24) {
        setTimeAgo(`${hours}h ago`);
      } else {
        setTimeAgo(lastSavedAt.toLocaleDateString());
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [lastSavedAt]);

  const stateConfig = {
    saved: {
      icon: <Check className="h-3.5 w-3.5" />,
      label: "Saved",
      showTime: true,
      className: "text-muted-foreground",
    },
    saving: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: "Saving…",
      showTime: false,
      className: "text-muted-foreground",
    },
    unsaved: {
      icon: <Cloud className="h-3.5 w-3.5" />,
      label: "Unsaved changes",
      showTime: false,
      className: "text-amber-600",
    },
    offline: {
      icon: <CloudOff className="h-3.5 w-3.5" />,
      label: "Offline",
      showTime: false,
      className: "text-amber-600",
    },
    conflict: {
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      label: "Conflict detected",
      showTime: false,
      className: "text-red-600",
    },
  };

  const config = stateConfig[saveState];

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs",
        config.className,
        className
      )}
    >
      {config.icon}
      <span>{config.label}</span>
      {config.showTime && timeAgo && (
        <>
          <span className="text-muted-foreground/50">•</span>
          <span>{timeAgo}</span>
        </>
      )}
    </div>
  );
}
