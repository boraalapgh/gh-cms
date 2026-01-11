/**
 * VersionHistory Component
 *
 * Displays version history for an entity and allows restoring to previous versions.
 * Shows version number, date, and publish status.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { History, RotateCcw, Clock, CheckCircle, Save, Loader2 } from "lucide-react";

interface Version {
  id: string;
  entityId: string;
  versionNumber: number;
  content: unknown;
  createdAt: string;
  publishedAt: string | null;
}

interface VersionHistoryProps {
  entityId: string;
  onRestore?: () => void;
}

export function VersionHistory({ entityId, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  // Fetch versions
  const fetchVersions = useCallback(async () => {
    if (!entityId) return;

    try {
      const response = await fetch(`/api/versions?entityId=${entityId}`);
      const result = await response.json();
      if (result.data) {
        setVersions(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch versions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  // Create new version (save snapshot)
  const handleSaveVersion = async (publish = false) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityId, publish }),
      });

      if (response.ok) {
        await fetchVersions();
      } else {
        console.error("Failed to save version");
      }
    } catch (error) {
      console.error("Failed to save version:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Restore to version
  const handleRestore = async () => {
    if (!selectedVersion) return;

    setIsRestoring(true);
    try {
      const response = await fetch(`/api/versions/${selectedVersion.id}/restore`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchVersions();
        onRestore?.();
        setRestoreDialogOpen(false);
        setSelectedVersion(null);
      } else {
        console.error("Failed to restore version");
      }
    } catch (error) {
      console.error("Failed to restore version:", error);
    } finally {
      setIsRestoring(false);
    }
  };

  // Open restore dialog
  const openRestoreDialog = (version: Version) => {
    setSelectedVersion(version);
    setRestoreDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!entityId) {
    return (
      <div className="text-center py-8 text-sm text-zinc-500">
        No entity selected
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-900 flex items-center gap-2">
          <History className="h-4 w-4" />
          Version History
        </h3>
      </div>

      {/* Save buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => handleSaveVersion(false)}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          Save Draft
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => handleSaveVersion(true)}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-1" />
          )}
          Publish
        </Button>
      </div>

      {/* Version list */}
      <ScrollArea className="h-64">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-5 w-5 mx-auto animate-spin text-zinc-400" />
            <p className="text-xs text-zinc-400 mt-2">Loading versions...</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 mx-auto text-zinc-300 mb-2" />
            <p className="text-sm text-zinc-500">No versions yet</p>
            <p className="text-xs text-zinc-400">
              Save a draft or publish to create a version
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="p-3 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-zinc-900">
                    Version {version.versionNumber}
                  </span>
                  {version.publishedAt ? (
                    <Badge variant="default" className="text-xs">
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Draft
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mb-2">
                  {formatDate(version.createdAt)}
                </p>
                {index !== 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => openRestoreDialog(version)}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restore
                  </Button>
                )}
                {index === 0 && (
                  <span className="text-xs text-zinc-400">Current</span>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Restore confirmation dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Version</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore to Version {selectedVersion?.versionNumber}?
              This will replace all current content with the content from that version.
              Your current work will be lost unless you save it first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restore
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
