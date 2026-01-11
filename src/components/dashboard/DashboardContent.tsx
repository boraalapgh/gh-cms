/**
 * DashboardContent Component
 *
 * Main dashboard content with entity list, search, filter, and actions.
 * Fetches entities from the API and displays them in a grid.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Video,
  HelpCircle,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Award,
  Loader2,
} from "lucide-react";

interface Entity {
  id: string;
  type: string;
  title: string;
  description: string | null;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

const entityTypeIcons: Record<string, React.ReactNode> = {
  activity: <Video className="h-4 w-4" />,
  lesson: <BookOpen className="h-4 w-4" />,
  course: <GraduationCap className="h-4 w-4" />,
  assessment: <ClipboardCheck className="h-4 w-4" />,
  certificate_template: <Award className="h-4 w-4" />,
};

const entityTypeLabels: Record<string, string> = {
  activity: "Activity",
  lesson: "Lesson",
  course: "Course",
  assessment: "Assessment",
  certificate_template: "Certificate",
};

export function DashboardContent() {
  const router = useRouter();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<Entity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch entities
  const fetchEntities = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/entities?${params.toString()}`);
      const result = await response.json();
      if (result.data) {
        setEntities(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch entities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, statusFilter, searchQuery]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  // Create new entity
  const handleCreate = async (type: string) => {
    try {
      const response = await fetch("/api/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: `New ${entityTypeLabels[type] || type}`,
          status: "draft",
        }),
      });

      const result = await response.json();
      if (result.data) {
        router.push(`/editor/${type}/${result.data.id}`);
      }
    } catch (error) {
      console.error("Failed to create entity:", error);
    }
  };

  // Duplicate entity
  const handleDuplicate = async (entity: Entity) => {
    try {
      const response = await fetch("/api/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: entity.type,
          title: `${entity.title} (Copy)`,
          description: entity.description,
          status: "draft",
        }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchEntities();
      }
    } catch (error) {
      console.error("Failed to duplicate entity:", error);
    }
  };

  // Delete entity
  const handleDelete = async () => {
    if (!entityToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/entities/${entityToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchEntities();
        setDeleteDialogOpen(false);
        setEntityToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete entity:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Open delete dialog
  const openDeleteDialog = (entity: Entity) => {
    setEntityToDelete(entity);
    setDeleteDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter entities
  const filteredEntities = entities.filter((entity) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !entity.title.toLowerCase().includes(query) &&
        !entity.description?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">E-Learning CMS</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your activities, lessons, courses, and assessments
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleCreate("activity")}>
              <Video className="h-4 w-4 mr-2" />
              Activity
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCreate("lesson")}>
              <BookOpen className="h-4 w-4 mr-2" />
              Lesson
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCreate("course")}>
              <GraduationCap className="h-4 w-4 mr-2" />
              Course
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCreate("assessment")}>
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Assessment
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/certificates/new")}>
              <Award className="h-4 w-4 mr-2" />
              Certificate Template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="activity">Activities</SelectItem>
            <SelectItem value="lesson">Lessons</SelectItem>
            <SelectItem value="course">Courses</SelectItem>
            <SelectItem value="assessment">Assessments</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Entity Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : filteredEntities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
          <HelpCircle className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 mb-2">No entities found</h3>
          <p className="text-sm text-zinc-500 mb-4">
            {searchQuery || typeFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first activity or course"}
          </p>
          <Button onClick={() => handleCreate("activity")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Activity
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntities.map((entity) => (
            <div
              key={entity.id}
              className="bg-white rounded-lg border border-zinc-200 p-4 hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {entityTypeIcons[entity.type]}
                  <span className="text-xs font-medium text-zinc-500 uppercase">
                    {entityTypeLabels[entity.type] || entity.type}
                  </span>
                </div>
                <Badge variant={entity.status === "published" ? "default" : "secondary"}>
                  {entity.status}
                </Badge>
              </div>
              <h3 className="font-medium text-zinc-900 mb-1 truncate">{entity.title}</h3>
              <p className="text-sm text-zinc-500 mb-3 line-clamp-2">
                {entity.description || "No description"}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  Updated {formatDate(entity.updatedAt)}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/editor/${entity.type}/${entity.id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/editor/${entity.type}/${entity.id}`)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(entity)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(entity)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{entityToDelete?.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
