/**
 * Dashboard Page
 *
 * Main landing page for the E-Learning CMS.
 * Lists all entities (activities, lessons, courses, assessments)
 * with search, filter, and quick actions.
 */

import { Suspense } from "react";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
