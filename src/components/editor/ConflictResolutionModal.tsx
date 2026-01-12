/**
 * ConflictResolutionModal Component
 *
 * Modal shown when a conflict is detected during save.
 * Offers options to reload latest, overwrite, or copy changes.
 */

"use client";

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
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Save, Copy } from "lucide-react";

interface ConflictData {
  serverRevision: number;
  clientRevision: number;
  serverUpdatedAt: string;
}

interface ConflictResolutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictData: ConflictData | null;
  onResolve: (resolution: "reload" | "overwrite" | "copy") => void;
}

export function ConflictResolutionModal({
  open,
  onOpenChange,
  conflictData,
  onResolve,
}: ConflictResolutionModalProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return "Unknown time";
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle>Conflict Detected</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-3">
            <p>
              This content was updated elsewhere while you were editing.
              Your changes cannot be saved automatically.
            </p>
            {conflictData && (
              <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Server version:</span>{" "}
                  <span className="font-medium">#{conflictData.serverRevision}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Your version:</span>{" "}
                  <span className="font-medium">#{conflictData.clientRevision}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Last updated:</span>{" "}
                  <span className="font-medium">{formatDate(conflictData.serverUpdatedAt)}</span>
                </p>
              </div>
            )}
            <p className="text-sm">
              Choose how to resolve this conflict:
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={() => onResolve("reload")}
          >
            <RefreshCw className="h-4 w-4 mr-3 shrink-0" />
            <div className="text-left">
              <p className="font-medium">Reload latest version</p>
              <p className="text-xs text-muted-foreground">
                Discard your changes and load the server version
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={() => onResolve("overwrite")}
          >
            <Save className="h-4 w-4 mr-3 shrink-0" />
            <div className="text-left">
              <p className="font-medium">Overwrite with my changes</p>
              <p className="text-xs text-muted-foreground">
                Replace the server version with your local changes
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={() => onResolve("copy")}
          >
            <Copy className="h-4 w-4 mr-3 shrink-0" />
            <div className="text-left">
              <p className="font-medium">Copy my changes to clipboard</p>
              <p className="text-xs text-muted-foreground">
                Save your changes as JSON, then reload to review
              </p>
            </div>
          </Button>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Dismiss</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
